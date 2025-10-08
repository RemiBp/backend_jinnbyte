import { InterestType } from "../../enums/interestStatus.enum";
import { InviteStatus } from "../../enums/inviteStatus.enum";
import { NotFoundError } from "../../errors/notFound.error";
import {
    EventRepository,
    InterestInviteRepository,
    InterestRepository,
    ProducerRepository,
    SlotRepository,
    UserRepository,
} from "../../repositories";
import { AcceptInterestInviteInput, CreateInterestInput, DeclineInterestInviteInput, SuggestNewTimeInput } from "../../validators/app/interest.validation";

export const createInterest = async (userId: number, data: CreateInterestInput) => {
    const { type, producerId, eventId, slotId, suggestedTime, message, invitedUserIds = [] } = data;

    let targetId: number | null = null;

    //  For PRODUCER type
    if (type === InterestType.PRODUCER) {
        if (!producerId) throw new Error("producerId is required for Producer type");
        const producer = await ProducerRepository.findOne({ where: { id: producerId } });
        if (!producer) throw new NotFoundError("Producer not found");
        targetId = producer.id;

        let slotTime: string | null = null;

        if (slotId) {
            const slot = await SlotRepository.findOne({ where: { id: slotId } });
            if (!slot) throw new NotFoundError("Slot not found");

            const baseDate = suggestedTime ? new Date(suggestedTime) : new Date();
            const datePart = baseDate.toISOString().split("T")[0];

            // normalize time
            let timePart = slot.startTime;
            if (timePart.length === 5) timePart += ":00"; // ensure HH:mm:ss

            const fullTimeString = `${datePart}T${timePart}Z`;
            slotTime = new Date(fullTimeString).toISOString();
        }

        // create interest
        const interest = InterestRepository.create({
            userId,
            type,
            producerId: targetId,
            eventId: null,
            slotId: slotId ?? null,
            suggestedTime: slotId ? slotTime : suggestedTime ?? null,
            message: message ?? null,
        });

        const savedInterest = await InterestRepository.save(interest);

        // invites
        if (invitedUserIds.length > 0) {
            const validUsers = await UserRepository.findByIds(invitedUserIds);
            const validUserIds = validUsers.map((u: any) => u.id);

            if (validUserIds.length > 0) {
                const invites = validUserIds.map((invitedUserId: any) => ({
                    interestId: savedInterest.id,
                    invitedUserId,
                }));
                await InterestInviteRepository.insert(invites);
            }
        }

        return savedInterest;
    }

    // For EVENT type
    if (type === InterestType.EVENT) {
        if (!eventId) throw new Error("eventId is required for Event type");
        const event = await EventRepository.findOne({ where: { id: eventId } });
        if (!event) throw new NotFoundError("Event not found");
        targetId = event.id;

        const interest = InterestRepository.create({
            userId,
            type,
            eventId: targetId,
            producerId: null,
            suggestedTime: suggestedTime ?? null,
            message: message ?? null,
        });

        const savedInterest = await InterestRepository.save(interest);

        if (invitedUserIds.length > 0) {
            const validUsers = await UserRepository.findByIds(invitedUserIds);
            const validUserIds = validUsers.map((u: any) => u.id);
            if (validUserIds.length > 0) {
                const invites = validUserIds.map((invitedUserId: any) => ({
                    interestId: savedInterest.id,
                    invitedUserId,
                }));
                await InterestInviteRepository.insert(invites);
            }
        }
        return savedInterest;
    }

    throw new Error("Invalid interest type");
};

export const getProducerSlots = async (producerId: number) => {
    try {
        const slots = await SlotRepository.createQueryBuilder('slot')
            .innerJoin('slot.user', 'user')
            .where('user.id = :producerId', { producerId })
            .orderBy(
                `
        CASE 
          WHEN slot.day = 'Monday' THEN 1
          WHEN slot.day = 'Tuesday' THEN 2
          WHEN slot.day = 'Wednesday' THEN 3
          WHEN slot.day = 'Thursday' THEN 4
          WHEN slot.day = 'Friday' THEN 5
          WHEN slot.day = 'Saturday' THEN 6
          WHEN slot.day = 'Sunday' THEN 7
          ELSE 8
        END
      `,
                'ASC'
            )
            .addOrderBy('slot.startTime', 'ASC')
            .getMany();

        const groupedSlots = slots.reduce((acc: Record<string, typeof slots>, slot: any) => {
            const { day } = slot;
            if (!acc[day]) acc[day] = [];
            acc[day].push(slot);
            return acc;
        }, {});

        const response = {
            data: Object.entries(groupedSlots).map(([day, slots]) => ({
                day,
                slots,
            })),
        };

        return response;
    } catch (error) {
        console.error('Error in getProducerSlots', { error }, 'ProfileService');
        throw error;
    }
};

export const getInvited = async (userId: number) => {
    const interests = await InterestRepository.createQueryBuilder("interest")
        .leftJoinAndSelect("interest.producer", "producer")
        .leftJoinAndSelect("interest.event", "event")
        .leftJoinAndSelect("interest.slot", "slot")
        .leftJoinAndSelect("interest.invites", "invites")
        .leftJoinAndSelect("invites.invitedUser", "invitedUser")
        .where("invites.invitedUserId = :userId", { userId })
        .orderBy("interest.createdAt", "DESC")
        .getMany();

    return interests;
};

export const acceptInterestInvite = async (userId: number, data: AcceptInterestInviteInput) => {
    try {
        const { interestId } = data;

        const invite = await InterestInviteRepository.findOne({
            where: { invitedUserId: userId, interestId },
            relations: ["interest"],
        });

        if (!invite) throw new Error("Invite not found for this user.");

        // Prevent re-accept or accept after decline/suggest
        if ([InviteStatus.ACCEPTED, InviteStatus.DECLINED, InviteStatus.SUGGESTED_NEW_TIME].includes(invite.status)) {
            throw new Error(`You cannot accept an invite that is already ${invite.status.toLowerCase()}.`);
        }

        invite.status = InviteStatus.ACCEPTED;
        invite.respondedAt = new Date();
        await InterestInviteRepository.save(invite);

        // If all accepted → mark main interest confirmed
        const allInvites = await InterestInviteRepository.find({ where: { interestId } });
        const allAccepted = allInvites.every((i: any) => i.status === InviteStatus.ACCEPTED);

        if (allAccepted && invite.interest) {
            invite.interest.status = "Confirmed";
            await InterestRepository.save(invite.interest);
        }

        return invite;
    } catch (error: any) {
        console.error("Error in acceptInterestInvite:", error);
        return {
            success: false,
            message: error.message || "Something went wrong while accepting invite.",
        };
    }
};

export const declineInterestInvite = async (userId: number, data: DeclineInterestInviteInput) => {
    try {
        const { interestId, reason } = data;

        if (!interestId || !userId) throw new Error("Invalid input: interestId and userId are required.");

        const invite = await InterestInviteRepository.findOne({
            where: { invitedUserId: userId, interestId },
        });

        if (!invite) throw new Error("Invite not found for this user.");

        // Prevent decline after accept or already declined
        if ([InviteStatus.DECLINED, InviteStatus.ACCEPTED].includes(invite.status)) {
            throw new Error(`You cannot decline an invite that is already ${invite.status.toLowerCase()}.`);
        }

        invite.status = InviteStatus.DECLINED;
        invite.declineReason = reason ?? null;
        invite.respondedAt = new Date();
        await InterestInviteRepository.save(invite);

        // If all declined → mark main interest as Declined
        const allInvites = await InterestInviteRepository.find({ where: { interestId } });
        const allDeclined = allInvites.every((i: any) => i.status === InviteStatus.DECLINED);

        if (allDeclined) {
            const interest = await InterestRepository.findOne({ where: { id: interestId } });
            if (interest) {
                interest.status = "Declined";
                await InterestRepository.save(interest);
            }
        }

        return invite;
    } catch (error: any) {
        console.error("Error in declineInterestInvite:", error);
        return {
            success: false,
            message: error.message || "Something went wrong while declining invite.",
        };
    }
};

export const suggestNewTime = async (userId: number, data: SuggestNewTimeInput) => {
    try {
        const { interestId, slotId, suggestedTime, message } = data;

        if (!interestId || !userId) throw new Error("Invalid input: interestId and userId are required.");

        const invite = await InterestInviteRepository.findOne({
            where: { invitedUserId: userId, interestId },
            relations: ["interest", "interest.producer"],
        });

        if (!invite) throw new Error("Invite not found for this user.");

        const interest = invite.interest;
        if (!interest || !interest.producerId) throw new Error("This interest is not linked to a valid producer.");

        // Prevent suggesting new time after accept or decline
        if ([InviteStatus.ACCEPTED, InviteStatus.DECLINED].includes(invite.status)) {
            throw new Error(`You cannot suggest a new time for an invite that is already ${invite.status.toLowerCase()}.`);
        }

        // Validate slot belongs to same producer
        let selectedSlot = null;
        if (slotId) {
            selectedSlot = await SlotRepository.findOne({
                where: { id: slotId, userId: interest.producerId },
            });
            if (!selectedSlot) throw new Error("Invalid slot: slot does not belong to this producer.");
        }

        invite.status = InviteStatus.SUGGESTED_NEW_TIME;
        invite.suggestedSlotId = selectedSlot ? selectedSlot.id : null;
        invite.suggestedTime = suggestedTime ? new Date(suggestedTime) : null;
        invite.suggestedMessage = message ?? null;
        invite.respondedAt = new Date();

        await InterestInviteRepository.save(invite);

        return invite;
    } catch (error: any) {
        console.error("Error in suggestNewTime:", error);
        return {
            success: false,
            message: error.message || "Something went wrong while suggesting new time.",
        };
    }
};

export const getUserInterests = async (userId: number) => {
    const interests = await InterestRepository.find({
        where: { userId },
        relations: [
            "producer",
            "event",
            "slot",
            "invites",
            "invites.invitedUser",
        ],
        order: { createdAt: "DESC" },
    });

    if (!interests.length) return [];

    return interests;
};

export const getInterestDetails = async (userId: number, interestId: number) => {
    const interest = await InterestRepository.findOne({
        where: { id: interestId, userId },
        relations: ["producer", "event", "invites"],
    });
    if (!interest) throw new NotFoundError("Interest not found");

    return interest;
};

export const respondToInvite = async (userId: number, interestId: number, response: string) => {
    const invite = await InterestInviteRepository.findOne({
        where: { interestId, invitedUserId: userId },
    });
    if (!invite) throw new NotFoundError("Invite not found");
    invite.status = response;

    const updatedInvite = await InterestInviteRepository.save(invite);
    return updatedInvite;
};

export * as InterestService from "./interest.service";
