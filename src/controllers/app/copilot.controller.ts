import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../errors/badRequest.error";
import { UserCopilotService } from "../../services/app/copilot.service";

// Handle AI Copilot query requests
export const handleQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { query } = req.body;
        const { role, userId } = req.userId;

        if (!query) throw new BadRequestError("Query text is required");

        let result: any;

        if (role === "user") {
            result = await UserCopilotService.handle(query, userId);
            // } else if (role === "producer") {
            //     result = await ProducerCopilotService.handle(query, userId);
        } else {
            throw new BadRequestError("Invalid role type");
        }

        return res.status(200).json({
            success: true,
            role,
            query,
            result,
        });
    } catch (error) {
        next(error);
    }
};

export * as CopilotController from "./copilot.controller";
