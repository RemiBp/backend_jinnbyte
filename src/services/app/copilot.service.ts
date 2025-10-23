import { UserRepository } from "../../repositories";
import { mapQueryToIntent } from "../../utils/queryMapper";
import { formatCopilotResponse } from "../../utils/responseFormatter";
import { getNearbyProducers } from "../producer/maps.service";

export const UserCopilotService = {
    async handle(query: string, userId: number) {
        const intent = mapQueryToIntent(query);

        switch (intent) {
            // FIND NEARBY RESTAURANTS
            case "find_nearby_restaurants": {
                // Fetch user location
                const user = await UserRepository.findOne({
                    where: { id: userId },
                    select: ["latitude", "longitude"],
                });

                if (!user?.latitude || !user?.longitude) {
                    return formatCopilotResponse(
                        "Please enable location access to find nearby restaurants."
                    );
                }

                // Call the existing maps service correctly
                const nearbyRestaurants = await getNearbyProducers({
                    latitude: user.latitude,
                    longitude: user.longitude,
                    radius: 10,       // radius in km (adjust as needed)
                    type: "restaurant",
                    sort: "distance",
                    limit: 20,
                    page: 1,
                });

                // Return formatted Copilot response
                return formatCopilotResponse(
                    "Here are some restaurants near your location:",
                    nearbyRestaurants
                );
            }

            default:
                return formatCopilotResponse(
                    "Sorry, I didn’t understand that query. Please rephrase or try another question."
                );
        }
    },
};

export * as CopilotService from './copilot.service';