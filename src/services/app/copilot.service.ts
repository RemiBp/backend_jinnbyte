import { CopilotAgent } from "../../mcp/agent";
import { UserRepository } from "../../repositories";

export const CopilotAgentService = {
    async handle(userId: number, role: string, query: string) {
        // 🔹 Fetch user to enrich AI context
        const user = await UserRepository.findOne({
            where: { id: userId },
            select: ["id", "fullName", "email", "role", "latitude", "longitude"],
            relations: role === "producer" ? ["producer"] : [],
        });

        const context = {
            userId,
            role,
            user,
            coords:
                user?.latitude && user?.longitude
                    ? { latitude: user.latitude, longitude: user.longitude }
                    : undefined,
            producer: role === "producer" ? user?.producer : undefined,
            today: new Date().toISOString().split("T")[0],
        };

        // 🔹 Run the Copilot Agent (fixed name)
        const result = await CopilotAgent.handle(query, context);
        return result;
    },
};
