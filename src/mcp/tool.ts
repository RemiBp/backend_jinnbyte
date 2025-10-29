// src/mcp/tool.ts
import { tool } from "@openai/agents";
import { z } from "zod";
import { getNearbyProducers } from "../services/producer/maps.service";
import { ProducerType, SortOption } from "../enums/ProducerType.enum";

const hasNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);

export const findNearbyRestaurants = tool({
    name: "find_nearby_restaurants",
    description: "Find nearby restaurants based on user's location.",
    parameters: z.object({
        latitude: z.number(),
        longitude: z.number(),
        radius_km: z.number().default(10),
    }),
    async execute({ latitude, longitude, radius_km }) {
        if (!hasNumber(latitude) || !hasNumber(longitude)) {
            return { message: "Location (latitude, longitude) is required.", data: null };
        }

        const data = await getNearbyProducers(0, {
            latitude,
            longitude,
            radius: radius_km,
            type: ProducerType.RESTAURANT,
            sort: SortOption.DISTANCE,
            limit: 20,
            page: 1,
        });

        return { message: "Nearby restaurants", data };
    },
});

export const findTopRatedNearby = tool({
    name: "find_top_rated_nearby",
    description: "Top-rated restaurants and wellness services near the user's location, sorted by rating.",
    parameters: z.object({
        latitude: z.number().describe("Latitude of user's location"),
        longitude: z.number().describe("Longitude of user's location"),
        radius_km: z.number().default(10).describe("Search radius in kilometers"),
    }),
    async execute({ latitude, longitude, radius_km }) {
        if (!hasNumber(latitude) || !hasNumber(longitude)) {
            return { message: "Location (latitude, longitude) is required.", data: null };
        }

        const restaurants = await getNearbyProducers(0, {
            latitude,
            longitude,
            radius: radius_km,
            type: ProducerType.RESTAURANT,
            sort: SortOption.RATING,
            minAverageScore: 4,
            limit: 10,
            page: 1,
        });

        const wellness = await getNearbyProducers(0, {
            latitude,
            longitude,
            radius: radius_km,
            type: ProducerType.WELLNESS,
            sort: SortOption.RATING,
            minCareQuality: 4,
            minCleanliness: 5,
            minWelcome: 4,
            minValueForMoney: 3,
            minAtmosphere: 4,
            minStaffExperience: 4,
            minAverageScore: 4,
            limit: 10,
            page: 1,
        });

        return { message: "Top-rated restaurants and wellness services near you.", data: { restaurants, wellness } };
    },
});
