import { UserRepository } from "../../repositories";
import { CopilotMCPAgent } from "../../mcp/agent";

export const CopilotAgentService = {
    async handle(userId: number, role: string, query: string) {
        // Get user coordinates if available
        const user = await UserRepository.findOne({
            where: { id: userId },
            select: ["latitude", "longitude"],
        });

        const coords = user?.latitude && user?.longitude
            ? { latitude: user.latitude, longitude: user.longitude }
            : undefined;

        const result = await CopilotMCPAgent.run(query, { userId, role, coords });

        return result;
    },
};
