import {
    EventBookingRepository,
    EventRepository,
    EventTypeRepository,
    LeisureRepository,
    ProducerRepository,
    UserRepository,
} from '../../repositories';
import { BadRequestError } from '../../errors/badRequest.error';
import { NotFoundError } from '../../errors/notFound.error';
import { CreateEventInput, FindProducersNearbySchema, GetAllEventsInput } from '../../validators/producer/event.validation';
import { EventStatus } from '../../enums/eventStatus.enum';

export const getEventTypes = async () => {
    const eventTypes = await EventTypeRepository.find({
        order: { name: "ASC" },
    });
    return eventTypes;
};

export const createEvent = async (userId: number, data: CreateEventInput) => {
    const producer = await ProducerRepository.findOne({ where: { userId } });
    if (!producer) {
        throw new NotFoundError("Producer not found");
    }

    if (producer.type !== "leisure" && producer.type !== "restaurant") {
        throw new BadRequestError("Only leisure and restaurant producers can create events");
    }

    let leisureId: number | null = null;
    let eventTypeId: number | null = null;

    if (producer.type === "leisure") {
        if (!data.eventTypeId) {
            throw new BadRequestError("Event type is required for Leisure events");
        }

        const leisure = await LeisureRepository.findOne({
            where: { producerId: producer.id },
        });
        if (!leisure) {
            throw new NotFoundError("Leisure record not found for this producer");
        }
        leisureId = leisure.id;

        const eventType = await EventTypeRepository.findOne({
            where: { id: data.eventTypeId },
        });
        if (!eventType) {
            throw new NotFoundError("Invalid Event Type provided");
        }
        eventTypeId = eventType.id;
    }

    // Default timezone logic
    const timeZone = data.timeZone && data.timeZone.trim() !== "" ? data.timeZone : "UTC";

    const newEvent = await EventRepository.save({
        ...data,
        timeZone,
        producer: { id: producer.id },
        leisure: leisureId ? { id: leisureId } : null,
        eventType: eventTypeId ? { id: eventTypeId } : null,
    });

    return newEvent;
};

export const getMyEvents = async (userId: number, status?: EventStatus) => {
    const producer = await ProducerRepository.findOne({ where: { userId } });
    if (!producer) throw new NotFoundError("Producer not found");

    const whereClause: any = { producer: { id: producer.id } };
    if (status) whereClause.status = status;

    return EventRepository.find({
        where: whereClause,
        relations: ["producer", "leisure", "eventType"],
    });
};

export const getAllEvents = async ({ status, category, type, lat, lng, radius }: GetAllEventsInput) => {
    const qb = EventRepository.createQueryBuilder("event")
        .leftJoinAndSelect("event.producer", "producer")
        .leftJoinAndSelect("event.leisure", "leisure");

    if (status) {
        qb.andWhere("event.status = :status", { status });
    }

    if (category) {
        qb.andWhere("event.category = :category", { category });
    }

    if (lat && lng && radius) {
        qb.andWhere("event.latitude IS NOT NULL AND event.longitude IS NOT NULL");
        qb.andWhere(
            `
      (
        6371 * acos(
          cos(radians(:lat)) * cos(radians(event.latitude)) *
          cos(radians(event.longitude) - radians(:lng)) +
          sin(radians(:lat)) * sin(radians(event.latitude))
        )
      ) <= :radius
    `,
            { lat, lng, radius }
        );
    }

    if (type && type.trim() !== "") {
        qb.andWhere("event.serviceType = :type", { type });
    }

    return qb.getMany();
};

export const getEventById = async (userId: number, eventId: number) => {
    const user = await UserRepository.findOne({
        where: { id: userId, isDeleted: false },
        relations: ["role"],
    });
    if (!user) throw new NotFoundError("User not found");

    let event;

    // If normal app user
    if (user.role.name === "user") {
        event = await EventRepository.findOne({
            where: { id: eventId },
            relations: [
                "producer",
                "leisure",
                "eventType",
                "ratings",
                "interests",

                // Producer deep
                "producer.user",
                "producer.photos",
                "producer.aiAnalysis",
                "producer.globalRating",
                "producer.openingHours",
                "producer.documents",
                "producer.offers",
                "producer.cuisineType",
                "producer.menuCategory",
                "producer.menuCategory.dishes",
            ],
        });
    }

    // If producer → only get their own event
    else if (["restaurant", "leisure"].includes(user.role.name)) {
        const producer = await ProducerRepository.findOne({
            where: { userId },
        });
        if (!producer) throw new NotFoundError("Producer not found");

        event = await EventRepository.findOne({
            where: {
                id: eventId,
                producer: { id: producer.id },
            },
            relations: [
                "producer",
                "leisure",
                "eventType",
                "ratings",
                "interests",

                // Producer deep
                "producer.user",
                "producer.photos",
                "producer.aiAnalysis",
                "producer.globalRating",
                "producer.openingHours",
                "producer.documents",
                "producer.offers",
                "producer.cuisineType",
                "producer.menuCategory",
                "producer.menuCategory.dishes",
            ],
        });
    }

    if (!event) throw new NotFoundError("Event not found");

    // total participants
    const { total } = await EventBookingRepository
        .createQueryBuilder("booking")
        .select("SUM(booking.numberOfPersons)", "total")
        .where("booking.eventId = :eventId", { eventId })
        .andWhere("booking.status NOT IN (:...cancelledStatuses)", {
            cancelledStatuses: ["cancelled"],
        })
        .getRawOne();

    return {
        ...event,
        totalParticipants: Number(total) || 0,
    };
};

export const findNearbyProducer = async (params: FindProducersNearbySchema) => {
    const { userId, latitude, longitude, keyword = "", page, limit, radius, producerType } = params;

    if (!latitude || !longitude)
        throw new BadRequestError("Latitude and Longitude are required.");

    const user = await UserRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const searchRadius = radius || 10000; // meters
    const vehicleSpeed = 30; // km/h

    // Build base query for all producer types
    const query = ProducerRepository.createQueryBuilder("producer")
        .innerJoin("producer.user", "user")
        .addSelect(
            `ST_Distance(
        "producer"."locationPoint"::geography,
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
      )`,
            "distance"
        )
        .where(
            `ST_DWithin(
        "producer"."locationPoint"::geography,
        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
        :searchRadius
      )`,
            { longitude, latitude, searchRadius }
        )
        .andWhere("producer.isDeleted = false")
        .andWhere("producer.isActive = true")
        .andWhere("user.isActive = true")
        .andWhere("user.isDeleted = false")
        // fixed column name here:
        .andWhere("producer.name ILIKE :keyword", { keyword: `%${keyword}%` })
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("distance", "ASC");

    // Optional filter by producerType (mapped to your enum field `type`)
    if (producerType) {
        query.andWhere("producer.type = :producerType", { producerType });
    }

    // Execute query
    const [entities, total] = await query.getManyAndCount();
    const { raw } = await query.getRawAndEntities();

    const producers = entities.map((p: any, i: any) => {
        const distanceInMeters = parseFloat(raw[i].distance);
        const distanceInKm = distanceInMeters / 1000;
        const etaMinutes = Math.round((distanceInKm / vehicleSpeed) * 60);

        return {
            id: p.id,
            name: p.name,
            type: p.type, // BusinessRole enum (restaurant, leisure, wellness)
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
            profileImage: p.user?.profileImageUrl || null,
            distance: Math.round(distanceInMeters),
            etaInMinutes: etaMinutes,
        };
    });

    return {
        producers,
        totalProducers: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
    };
};

export const getEventsByProducerId = async (producerId: number) => {
    // Find the producer
    const producer = await ProducerRepository.findOne({
        where: { id: producerId },
        relations: ["user"],
    });

    if (!producer) throw new NotFoundError("Producer not found.");

    let events = [];

    // If producer is RESTAURANT → use producerId
    if (producer.type === "restaurant") {
        events = await EventRepository.find({
            where: { producerId },
            relations: [
                "producer",
                "eventType",
                "ratings",
                "interests",
                "leisure",
            ],
            order: { createdAt: "DESC" },
        });
    }

    // If producer is LEISURE → find their leisure entity, then use leisureId
    else if (producer.type === "leisure") {
        const leisure = await LeisureRepository.findOne({
            where: { producerId },
        });

        if (!leisure) throw new NotFoundError("Leisure profile not found.");

        events = await EventRepository.find({
            where: { leisureId: leisure.id },
            relations: [
                "leisure",
                "eventType",
                "ratings",
                "interests",
                "producer",
            ],
            order: { createdAt: "DESC" },
        });
    }

    return {
        producerId,
        type: producer.type,
        totalEvents: events.length,
        events,
    };
};


export const updateEvent = async (userId: number, eventId: number, data: Partial<CreateEventInput>) => {
    const producer = await ProducerRepository.findOne({ where: { userId } });
    if (!producer) {
        throw new NotFoundError("Producer not found");
    }

    const event = await EventRepository.findOne({
        where: {
            id: eventId,
            producer: { id: producer.id },
        },
        relations: ["producer"],
    });

    if (!event) {
        throw new NotFoundError("Event not found");
    }

    Object.assign(event, data);

    await EventRepository.save(event);

    return event;
};

export const deleteEvent = async (userId: number, eventId: number) => {

    const producer = await ProducerRepository.findOne({ where: { userId } });
    if (!producer) {
        throw new NotFoundError("Producer not found");
    }

    const event = await EventRepository.findOne({
        where: {
            id: eventId,
            producer: { id: producer.id },
        },
        relations: ["producer"],
    });

    if (!event) {
        throw new NotFoundError("Event not found");
    }

    await EventRepository.remove(event);

    return {
        success: true,
        eventId: event.id,
    };
};

export * as EventService from './event.service';