// services/producer/dashboard.service.ts
import { Between } from "typeorm";
import { ProducerRepository, PostRepository, BookingRepository, PostRatingRepository, FollowRepository, InterestRepository, InterestInviteRepository, UserRepository, RestaurantRatingRepository, WellnessRepository, LeisureRepository, DishRatingRepository, MenuDishesRepository, ProfileViewLogRepository, MenuCategoryRepository } from "../../repositories";
import { NotFoundError } from "../../errors/notFound.error";
import dayjs from "dayjs";
import { BusinessRole } from "../../enums/Producer.enum";
import DishRating from "../../models/DishRating";
import { GetCategoriesInput } from "../../validators/producer/dashboard.validation";

export const getOverview = async ({ userId }: { userId: number }) => {
    // Find producer
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id", "userId"],
    });
    if (!producer) throw new NotFoundError("Producer not found.");

    // Profile Views
    const profileViews = await ProfileViewLogRepository.count({
        where: { producerId: producer.id },
    });

    // Number of Interests (users who want to come)
    const numberOfInterests = await InterestRepository.count({
        where: { producerId: producer.id },
    });

    // Choices Made → Posts created by users for this producer
    const choicesMadeResult = await PostRepository.createQueryBuilder("post")
        .where("post.producerId = :producerId", { producerId: producer.id })
        .andWhere("post.isDeleted = false")
        .andWhere("post.status = :status", { status: "public" }) // optional filter
        .select("COUNT(post.id)", "count")
        .getRawOne();

    const choicesMade = parseInt(choicesMadeResult?.count || "0", 10);

    // Conversion Rate (choicesMade / interests × 100)
    const conversionRate =
        numberOfInterests > 0
            ? `${((choicesMade / numberOfInterests) * 100).toFixed(1)}%`
            : "0%";

    // Post Conversion Rate (engagement stats for producer’s own posts)
    const posts = await PostRepository.find({
        where: { producerId: producer.id, isDeleted: false },
        select: ["likesCount", "commentCount", "shareCount"],
    });

    const totalPosts = posts.length;
    const totalEngagements = posts.reduce(
        (sum: any, post: any) =>
            sum +
            (post.likesCount || 0) +
            (post.commentCount || 0) +
            (post.shareCount || 0),
        0
    );

    const postConversionRate =
        totalPosts > 0
            ? `${(totalEngagements / totalPosts).toFixed(1)}%`
            : "0%";

    // Final structured response
    return {
        profileViews,
        numberOfInterests,
        choicesMade,
        conversionRate,
        postConversionRate,
    };
};

export const getUserInsights = async ({ userId }: { userId: number }) => {
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id", "latitude", "longitude", "name", "city", "country"],
    });

    if (!producer || !producer.latitude || !producer.longitude) {
        throw new NotFoundError("Producer location not found.");
    }

    const lat = Number(producer.latitude);
    const lon = Number(producer.longitude);
    const radiusKm = 20; // adjustable search radius (20 km for "User Origin Map")

    // Fetch all users with coordinates
    const usersWithLocation = await UserRepository.createQueryBuilder("u")
        .select([
            "u.id AS id",
            "u.fullName AS fullName",
            "u.email AS email",
            "u.latitude AS latitude",
            "u.longitude AS longitude",
            `(
        6371 * acos(
          cos(radians(:lat)) *
          cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(:lon)) +
          sin(radians(:lat)) *
          sin(radians(u.latitude))
        )
      ) AS distance_km`,
        ])
        .where("u.latitude IS NOT NULL AND u.longitude IS NOT NULL")
        .setParameters({ lat, lon })
        .getRawMany();

    // Filter users by distance manually (to avoid SQL alias issues)
    const nearbyUsers = usersWithLocation.filter((u: any) => Number(u.distance_km) <= radiusKm);

    // Compute local stats (only users who have lat/lon)
    const totalLocalUsers = usersWithLocation.length;
    const nearbyCount = nearbyUsers.length;
    const nearbyPercentage =
        totalLocalUsers > 0 ? ((nearbyCount / totalLocalUsers) * 100).toFixed(1) : "0";

    // Construct response
    return {
        mapSummary: {
            producerName: producer.name,
            city: producer.city || "N/A",
            country: producer.country || "N/A",
            nearbyUserPercentage: `${nearbyPercentage}%`,
            totalNearbyUsers: nearbyCount,
            totalLocalUsers,
            radiusKm,
        },
        nearbyUsers: nearbyUsers.map((u: any) => ({
            id: u.id,
            fullName: u.fullname || u.fullName,
            email: u.email,
            latitude: u.latitude,
            longitude: u.longitude,
            distanceKm: Number(u.distance_km).toFixed(2),
        })),
    };
};

export const getTrends = async ({ userId, metric = "interests", from, to }: { userId: number; metric?: string; from?: string; to?: string }) => {
    const producer = await ProducerRepository.findOneBy({ userId });
    if (!producer) throw new NotFoundError("Producer not found.");

    // Determine weekly range (default = last 7 days)
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : dayjs(endDate).subtract(6, "day").toDate();

    const lastWeekStart = dayjs(startDate).subtract(7, "day").toDate();
    const lastWeekEnd = dayjs(startDate).subtract(1, "day").toDate();

    let currentWeekData: any[] = [];
    let lastWeekData: any = {};

    // Select correct data source based on metric
    if (metric === "interests" || metric === "choices") {
        // Interests in current week
        currentWeekData = await InterestRepository.createQueryBuilder("i")
            .select(`TO_CHAR(i."createdAt", 'DY')`, "day")
            .addSelect("COUNT(*)", "count")
            .where("i.producerId = :id", { id: producer.id })
            .andWhere("i.createdAt BETWEEN :start AND :end", { start: startDate, end: endDate })
            .groupBy("day")
            .orderBy("MIN(i.createdAt)", "ASC")
            .getRawMany();

        // Interests in last week
        lastWeekData = await InterestRepository.createQueryBuilder("i")
            .select("COUNT(*)", "count")
            .where("i.producerId = :id", { id: producer.id })
            .andWhere("i.createdAt BETWEEN :start AND :end", { start: lastWeekStart, end: lastWeekEnd })
            .getRawOne();

    } else if (metric === "choicesMade") {
        // Choices made (accepted invites) this week
        currentWeekData = await InterestInviteRepository.createQueryBuilder("inv")
            .select(`TO_CHAR(inv."createdAt", 'DY')`, "day")
            .addSelect("COUNT(*)", "count")
            .where("inv.status = :status", { status: "accepted" })
            .andWhere("inv.createdAt BETWEEN :start AND :end", { start: startDate, end: endDate })
            .groupBy("day")
            .orderBy("MIN(inv.createdAt)", "ASC")
            .getRawMany();

        // Choices made last week
        lastWeekData = await InterestInviteRepository.createQueryBuilder("inv")
            .select("COUNT(*)", "count")
            .where("inv.status = :status", { status: "accepted" })
            .andWhere("inv.createdAt BETWEEN :start AND :end", { start: lastWeekStart, end: lastWeekEnd })
            .getRawOne();
    }

    // Calculate total for current and last week
    const currentTotal = currentWeekData.reduce((sum, d) => sum + Number(d.count), 0);
    const lastTotal = Array.isArray(lastWeekData)
        ? (lastWeekData.length > 0 ? Number(lastWeekData[0]?.count || 0) : 0)
        : Number((lastWeekData as any)?.count || 0);

    // Calculate growth percentage
    const changePercent = lastTotal === 0 ? currentTotal > 0 ? 100 : 0 : ((currentTotal - lastTotal) / lastTotal) * 100;

    // Normalize weekly data (Mon–Sun)
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const series = weekDays.map((day) => ({
        day,
        value:
            Number(
                currentWeekData.find((d: any) => d.day.toLowerCase().startsWith(day.toLowerCase()))?.count || 0
            ),
    }));

    return {
        metric,
        summary: {
            total: currentTotal,
            changePercent: Number(changePercent.toFixed(1)),
            comparisonText:
                changePercent >= 0
                    ? `Your ${metric} increased by ${changePercent.toFixed(1)}% this week.`
                    : `Your ${metric} decreased by ${Math.abs(changePercent).toFixed(1)}% this week.`,
        },
        series, // Data for graph
    };
};

export const getRatings = async ({ userId }: { userId: number }) => {
    // Get producer info
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id", "type"],
    });

    if (!producer) throw new NotFoundError("Producer not found.");

    let data: Record<string, number> = {};
    let average = 0;

    // Fetch ratings dynamically based on producer type
    if (producer.type === BusinessRole.RESTAURANT) {
        const rating = await RestaurantRatingRepository.findOne({
            where: { producerId: producer.id },
        });
        if (!rating) throw new NotFoundError("Restaurant ratings not found.");

        data = {
            Service: Number(rating.service),
            Place: Number(rating.place),
            Portions: Number(rating.portions),
            Ambiance: Number(rating.ambiance),
        };
        average = Number(rating.overall);

    } else if (producer.type === BusinessRole.WELLNESS) {
        const rating = await WellnessRepository.findOne({
            where: { producerId: producer.id },
        });
        if (!rating) throw new NotFoundError("Wellness ratings not found.");

        data = {
            Cleanliness: Number(rating.cleanliness),
            "Staff Expertise": Number(rating.staffExperience),
            Ambiance: Number(rating.atmosphere),
            "Value for Money": Number(rating.valueForMoney),
        };
        average = Number(rating.overall);

    } else if (producer.type === BusinessRole.LEISURE) {
        const rating = await LeisureRepository.findOne({
            where: { producerId: producer.id },
        });
        if (!rating) throw new NotFoundError("Leisure ratings not found.");

        data = {
            "Stage Direction": Number(rating.stageDirection),
            "Actor Performance": Number(rating.actorPerformance),
            Scenography: Number(rating.scenography),
        };
        average = Number(rating.overall);
    } else {
        throw new NotFoundError("Invalid producer type.");
    }

    // Convert into UI-friendly response
    const criteria = Object.entries(data).map(([label, value]) => ({
        label,
        value: Number(value.toFixed(1)),
    }));

    return {
        producerType: producer.type,
        average: Number(average.toFixed(1)),
        criteria,
    };
};


export const getEventInsights = async ({ userId }: { userId: number }) => {
    // Find the producer
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id", "type"],
    });
    if (!producer) throw new NotFoundError("Producer not found.");

    // Interest split by price type
    const interests = await InterestRepository.createQueryBuilder("i")
        .leftJoin("i.event", "event")
        .where("i.producerId = :producerId", { producerId: producer.id })
        .andWhere("event.id IS NOT NULL")
        .select([
            `SUM(CASE WHEN event."pricePerGuest" = 0 THEN 1 ELSE 0 END) AS "free"`,
            `SUM(CASE WHEN event."pricePerGuest" > 0 AND event."pricePerGuest" <= 50 THEN 1 ELSE 0 END) AS "discount"`,
            `SUM(CASE WHEN event."pricePerGuest" > 50 THEN 1 ELSE 0 END) AS "full"`,
        ])
        .getRawOne();

    const priceSplit = {
        Free: Number(interests?.free) || 0,
        Discount: Number(interests?.discount) || 0,
        "Full Price": Number(interests?.full) || 0,
    };

    // Top performing event type
    const topEventTypes = await InterestRepository.createQueryBuilder("i")
        .leftJoin("i.event", "event")
        .leftJoin("event.eventType", "type")
        .where("i.producerId = :producerId", { producerId: producer.id })
        .andWhere("type.id IS NOT NULL")
        .select("type.name", "eventType")
        .addSelect("COUNT(i.id)", "interestCount") // alias fixed
        .groupBy("type.name")
        .orderBy(`"interestCount"`, "DESC") // wrap alias in double quotes
        .limit(2)
        .getRawMany();

    let topEvent = null;
    if (topEventTypes.length > 0) {
        const [first, second] = topEventTypes;
        const multiplier =
            second && Number(second.interestCount) > 0
                ? (Number(first.interestCount) / Number(second.interestCount)).toFixed(1)
                : "—";

        topEvent = {
            eventType: first.eventType || "N/A",
            description:
                second && second.eventType
                    ? `${first.eventType} = ${multiplier}x more Choices than ${second.eventType}`
                    : `${first.eventType} is performing best`,
        };
    }

    // Format response
    return {
        priceSplit: Object.entries(priceSplit).map(([label, value]) => ({
            label,
            value,
        })),
        topEvent: topEvent || { eventType: "N/A", description: "No data available" },
    };
};

export const getDishRatings = async ({ userId, groupBy, categoryId }: { userId: number; groupBy?: "category" | "dish"; categoryId?: string }) => {
    // get the producer for this user
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id"],
    });
    if (!producer) throw new NotFoundError("Producer not found.");

    // normalize categoryId from querystring to number (optional)
    const categoryIdNum =
        typeof categoryId === "string" && categoryId.trim() !== ""
            ? Number(categoryId)
            : undefined;

    // base: list dishes that belong to this producer
    // left join into DishRatings so dishes with no ratings still appear
    const qb = MenuDishesRepository.createQueryBuilder("MenuDishes")
        .leftJoin("MenuDishes.menuCategory", "MenuCategory")
        .leftJoin("MenuCategory.producer", "Producers")
        .leftJoin(
            DishRating, // joining the entity directly, not a short alias
            "DishRatings",
            "DishRatings.dishId = MenuDishes.id"
        )
        .where("Producers.id = :producerId", { producerId: producer.id });

    // filter by category only if provided
    if (typeof categoryIdNum === "number" && Number.isFinite(categoryIdNum)) {
        qb.andWhere("MenuCategory.id = :categoryId", { categoryId: categoryIdNum });
    }

    const rows = await qb
        .select("MenuDishes.id", "dish_id")
        .addSelect("MenuDishes.name", "dish_name")
        .addSelect("MenuCategory.id", "category_id")
        .addSelect("MenuCategory.name", "category_name")
        .addSelect(
            "COALESCE(ROUND(AVG(DishRatings.rating)::numeric, 1), 0)",
            "avg_rating"
        )
        .addSelect("COUNT(DishRatings.id)", "total_ratings")
        .groupBy("MenuDishes.id, MenuDishes.name, MenuCategory.id, MenuCategory.name")
        .orderBy("avg_rating", "DESC")
        .addOrderBy("total_ratings", "DESC")
        .addOrderBy("dish_name", "ASC")
        .getRawMany();

    return {
        view: "dishes",
        categoryId: typeof categoryIdNum === "number" ? categoryIdNum : null,
        totalDishes: rows.length,
        items: rows.map((r: any) => ({
            dishId: Number(r.dish_id),
            dishName: r.dish_name ?? "Unnamed Dish",
            categoryId: r.category_id !== null ? Number(r.category_id) : null,
            categoryName: r.category_name ?? null,
            averageRating: Number(r.avg_rating) || 0,
            totalRatings: Number(r.total_ratings) || 0,
        })),
    };
};

export const getCategories = async ({ userId, search, includeCounts = true, page = 1, limit = 20 }: GetCategoriesInput) => {
    // resolve producer from current user
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id"],
    });
    if (!producer) throw new NotFoundError("Producer not found.");

    const offset = (page - 1) * limit;

    // main list query
    const qb = MenuCategoryRepository.createQueryBuilder("MenuCategory")
        .leftJoin("MenuCategory.producer", "Producers")
        .where("Producers.id = :producerId", { producerId: producer.id });

    if (search && search.trim() !== "") {
        qb.andWhere("LOWER(MenuCategory.name) LIKE :q", {
            q: `%${search.trim().toLowerCase()}%`,
        });
    }

    qb.select("MenuCategory.id", "category_id")
        .addSelect("MenuCategory.name", "category_name");

    if (includeCounts) {
        qb.leftJoin("MenuCategory.dishes", "MenuDishes")
            .addSelect("COUNT(MenuDishes.id)", "dish_count")
            .groupBy("MenuCategory.id, MenuCategory.name");
    }

    const rows = await qb
        .orderBy("MenuCategory.name", "ASC")
        .offset(offset)
        .limit(limit)
        .getRawMany();

    // separate total count query (not grouped)
    const totalQb = MenuCategoryRepository.createQueryBuilder("MenuCategory")
        .leftJoin("MenuCategory.producer", "Producers")
        .where("Producers.id = :producerId", { producerId: producer.id });

    if (search && search.trim() !== "") {
        totalQb.andWhere("LOWER(MenuCategory.name) LIKE :q", {
            q: `%${search.trim().toLowerCase()}%`,
        });
    }

    const total = await totalQb.getCount();
    const totalPages = Math.ceil(total / limit);

    return {
        categories: rows.map((r: any) => ({
            id: Number(r.category_id),
            name: r.category_name ?? null,
            dishCount:
                includeCounts && r.dish_count !== undefined
                    ? Number(r.dish_count)
                    : undefined,
        })),
        page,
        limit,
        total,
        totalPages,
    };
};

export const getMenuOverview = async ({ userId }: { userId: number }) => {
    // Find producer
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id"],
    });
    if (!producer) throw new NotFoundError("Producer not found.");

    // Menu Coverage — correctly join via MenuCategory → Producer
    const totalDishesResult = await MenuDishesRepository.createQueryBuilder("dish")
        .leftJoin("dish.menuCategory", "category")
        .leftJoin("category.producer", "producer")
        .where("producer.id = :producerId", { producerId: producer.id })
        .select("COUNT(DISTINCT dish.id)", "total")
        .getRawOne();

    const totalDishes = parseInt(totalDishesResult?.total || "0", 10);

    const ratedDishCount = await DishRatingRepository.createQueryBuilder("r")
        .leftJoin("r.dish", "dish")
        .leftJoin("dish.menuCategory", "category")
        .leftJoin("category.producer", "producer")
        .where("producer.id = :producerId", { producerId: producer.id })
        .select("COUNT(DISTINCT r.dishId)", "count")
        .getRawOne();

    const ratedDishes = parseInt(ratedDishCount?.count || "0", 10);
    const notRatedDishes = totalDishes - ratedDishes;
    const ratedPercentage = totalDishes > 0 ? Math.round((ratedDishes / totalDishes) * 100) : 0;

    // Most Chosen Dish (use ratings as fallback since no order table)
    const mostChosenDish = await DishRatingRepository.createQueryBuilder("r")
        .leftJoin("r.dish", "dish")
        .leftJoin("dish.menuCategory", "category")
        .leftJoin("category.producer", "producer")
        .where("producer.id = :producerId", { producerId: producer.id })
        .select("dish.name", "name")
        .addSelect("COUNT(r.id)", "chosencount") // lowercase alias, no manual quotes
        .groupBy("dish.id, dish.name")
        .orderBy("chosencount", "DESC")
        .limit(1)
        .getRawOne();

    return {
        menuCoverage: {
            totalDishes,
            ratedDishes,
            notRatedDishes,
            ratedPercentage,
        },
        mostChosenDish: {
            name: mostChosenDish?.name || null,
            chosenCount: parseInt(mostChosenDish?.chosencount || "0", 10), // lowercase alias
            timeFrame: "this week",
        },
    };
};

export const getDishDropAlerts = async ({ userId, days = 7 }: { userId: number; days?: number }) => {
    // Find producer
    const producer = await ProducerRepository.findOne({
        where: { userId },
        select: ["id"],
    });
    if (!producer) throw new NotFoundError("Producer not found.");

    // Date range: last X days
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - days + 1);

    // Fetch average rating per day
    const data = await DishRatingRepository.createQueryBuilder("r")
        .leftJoin("r.dish", "d")
        .leftJoin("d.menuCategory", "c")
        .leftJoin("c.producer", "p")
        .where("p.id = :producerId", { producerId: producer.id })
        .andWhere("r.createdAt BETWEEN :start AND :end", {
            start: startDate.toISOString(),
            end: now.toISOString(),
        })
        .select("DATE(r.createdAt)", "date")
        .addSelect("ROUND(AVG(r.rating)::numeric, 1)", "avg_rating")
        .addSelect("COUNT(r.id)", "total_ratings")
        .groupBy("DATE(r.createdAt)")
        .orderBy("DATE(r.createdAt)", "ASC")
        .getRawMany();

    // Fill missing days with 0s for chart continuity
    const trend: any[] = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - (days - 1 - i));
        const formattedDate = date.toISOString().split("T")[0];
        const found = data.find((d: any) => d.date === formattedDate);
        trend.push({
            day: `Day ${i + 1}`,
            date: formattedDate,
            averageRating: found ? Number(found.avg_rating) : 0,
            totalRatings: found ? Number(found.total_ratings) : 0,
        });
    }

    return {
        view: "dishDropAlerts",
        timeFrame: `last ${days} days`,
        trend,
    };
};

export * as DashboardService from './dashboard.service';