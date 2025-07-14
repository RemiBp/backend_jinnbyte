import { NextFunction, Request, Response } from 'express';
import { createEventSchema } from '../../validators/producer/event.validation';
import { EventService } from '../../services/producer/event.service';
import { EventStatus } from '../../enums/eventStatus.enum';
import { sendApiResponse } from '../../utils/sendApiResponse';

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error('userId is required');
        }
        const eventData = createEventSchema.parse(req.body);

        const newEvent = await EventService.createEvent(userId, eventData);

        return sendApiResponse(res, 200, 'Event created successfully.', newEvent);
    } catch (error) {
        next(error);
    }
};

export const getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error('userId is required');
        }

        const status = req.query.status as EventStatus | undefined;

        const events = await EventService.getAllEvents(userId, status);

        return sendApiResponse(res, 200, 'Events Fetching successfully.', events);
    } catch (error) {
        next(error);
    }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error('userId is required');
        }
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            throw new Error('Invalid event ID');
        }

        const event = await EventService.getEventById(userId, eventId);

        return sendApiResponse(res, 200, 'Event Fetching successfully.', event);
    } catch (error) {
        next(error);
    }
};

export const updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error('userId is required');
        }
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            throw new Error('Invalid event ID');
        }

        const eventData = createEventSchema.partial().parse(req.body);

        const updatedEvent = await EventService.updateEvent(userId, eventId, eventData);

        return sendApiResponse(res, 200, 'Event updated successfully.', updatedEvent);
    } catch (error) {
        next(error);
    }
};

export const deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            throw new Error('userId is required');
        }
        const eventId = parseInt(req.params.eventId, 10);
        if (isNaN(eventId)) {
            throw new Error('Invalid event ID');
        }

        const result = await EventService.deleteEvent(userId, eventId);

        return sendApiResponse(res, 200, 'Event deleted successfully.', result);
    } catch (error) {
        next(error);
    }
};

export * as EventController from './event.controller';