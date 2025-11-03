import { tool } from "@openai/agents";
import { z } from "zod";
import { getNearbyProducers } from "../services/producer/maps.service";
import { ProducerType, SortOption } from "../enums/ProducerType.enum";
import { ProducerInsightsService } from "../services/producer/insights.service";

const hasNumber = (v: unknown) => typeof v === "number" && Number.isFinite(v);

// USER SIDE TOOLS

export const findNearbyRestaurants = tool({
    name: "find_nearby_restaurants",
    description: "Find nearby restaurants based on user's location.",
    parameters: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radius_km: z.number().min(0.1).max(50).default(10),
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

export const findRestaurantPosts = tool({
    name: "find_restaurant_posts",
    description: "Fetch all posts made by a specific restaurant.",
    parameters: z.object({
        restaurantName: z.string().min(1, "Restaurant name is required."),
        limit: z.number().optional().default(10),
        page: z.number().optional().default(1),
    }),
    async execute({ restaurantName, page, limit }) {
        try {
            const result = await ProducerInsightsService.getPostsByRestaurant(restaurantName, page, limit);
            if (!result?.data || result.data.length === 0) {
                return { message: `No posts found for '${restaurantName}'.`, data: [] };
            }
            return { message: result.message, data: result.data };
        } catch {
            return { message: `No restaurant found with the name '${restaurantName}'.`, data: [] };
        }
    },
});

export const friendsPostsThisWeek = tool({
    name: "friends_posts_this_week",
    description: "Find which of the user's friends have made a choice post this week.",
    parameters: z.object({
        userId: z.number().describe("The ID of the user making the query"),
    }),
    async execute({ userId }) {
        const result = await ProducerInsightsService.getFriendsWhoPostedThisWeek(userId);
        return { message: result.message, data: result.data };
    },
});

export const findMostVisitedRestaurants = tool({
    name: "find_most_visited_restaurants",
    description: "Find the most visited restaurants based on how many people made Choice posts there.",
    parameters: z.object({
        limit: z.number().default(10).describe("Maximum number of restaurants to return"),
    }),
    async execute({ limit }) {
        const result = await ProducerInsightsService.getMostVisitedRestaurants(limit);
        return result;
    },
});

export const checkRestaurantAvailability = tool({
    name: "check_restaurant_availability",
    description: "Check available slots for a specific restaurant name.",
    parameters: z.object({
        restaurant_name: z.string().min(1, "Restaurant name is required"),
    }),
    async execute({ restaurant_name }) {
        try {
            const result = await ProducerInsightsService.getProducerAvailabilityByName(restaurant_name);
            if (!result?.data || result.data.length === 0) {
                return { message: `No availability found for '${restaurant_name}'.`, data: [] };
            }
            return { message: result.message, data: result.data };
        } catch (error: any) {
            const msg = String(error?.message || error);
            if (msg.includes("not found")) {
                return { message: `No restaurant found with the name '${restaurant_name}'.`, data: [] };
            }
            return { message: `Failed to check availability for '${restaurant_name}'.`, data: null };
        }
    },
});

export const findOpenWellnessStudios = tool({
    name: "find_open_wellness_studios",
    description: "List all wellness studios that are currently open (based on UTC time).",
    parameters: z.object({}),
    async execute() {
        try {
            const result = await ProducerInsightsService.getOpenWellnessStudios();
            return { message: result.message, data: result.data };
        } catch {
            return { message: "Failed to fetch open wellness studios.", data: null };
        }
    },
});

// PRODUCER SIDE TOOLS

export const getMostEngagedItems = tool({
    name: "get_most_engaged_items",
    description: "Find which dishes, activities, or services have the highest engagement (likes, bookings, or posts).",
    parameters: z.object({
        producerId: z.number(),
    }),
    async execute({ producerId }) {
        try {
            const result = await ProducerInsightsService.getMostEngagedItems(producerId);
            return result;
        } catch (error: any) {
            const msg = String(error?.message || error);
            if (msg.includes("No engagement data") || msg.includes("not found")) {
                return {
                    message: "You don't have any engagement data yet. Start by adding menu items or services to track engagement!",
                    data: [],
                };
            }
            return { message: "Failed to fetch engagement data. Please try again later.", data: null };
        }
    },
});

export const getUpcomingBookings = tool({
    name: "get_upcoming_bookings",
    description: "Check all upcoming bookings for the given producer and optional date/time.",
    parameters: z.object({
        producerId: z.number(),
        date: z.string().datetime().nullable().optional(),
    }),
    async execute({ producerId, date }) {
        try {
            const result = await ProducerInsightsService.getUpcomingBookings(producerId, date ?? null);
            return result;
        } catch (e: any) {
            const msg = String(e?.message || e);
            if (msg.includes("No upcoming bookings") || msg.includes("not found") || msg.includes("No bookings")) {
                return { message: "You don't have any upcoming bookings at the moment.", data: [] };
            }
            return { message: "Failed to fetch upcoming bookings. Please try again later.", data: null };
        }
    },
});

export const getFriendReferralBookings = tool({
    name: "get_friend_referral_bookings",
    description: "List customers who booked through a friend's referral.",
    parameters: z.object({
        producerId: z.number(),
    }),
    async execute({ producerId }) {
        try {
            const result = await ProducerInsightsService.getFriendReferralBookings(producerId);
            return result;
        } catch (error: any) {
            const msg = String(error?.message || error);
            if (msg.includes("No referral") || msg.includes("not found") || msg.includes("No bookings")) {
                return {
                    message: "You don't have any friend referral bookings yet. Encourage customers to share your business!",
                    data: [],
                };
            }
            return { message: "Failed to fetch referral bookings. Please try again later.", data: null };
        }
    },
});

export const getMonthlyAverageRating = tool({
    name: "get_monthly_average_rating",
    description: "Get the producer's average customer rating for the current month.",
    parameters: z.object({
        producerId: z.number(),
    }),
    async execute({ producerId }) {
        try {
            const res = await ProducerInsightsService.getMonthlyAverageRating(producerId);
            return res;
        } catch (error: any) {
            const msg = String(error?.message || error);
            if (msg.includes("No rating") || msg.includes("not found") || msg.includes("No data")) {
                return { message: "You don't have any ratings for this month yet.", data: { averageRating: 0 } };
            }
            return { message: "Failed to fetch average rating. Please try again later.", data: null };
        }
    },
});

export const getCustomersByRating = tool({
    name: "get_customers_by_rating",
    description: "List customers grouped by the rating (1–5 stars) they gave.",
    parameters: z.object({
        producerId: z.number(),
        rating: z.number().min(1).max(5),
    }),
    async execute({ producerId, rating }) {
        try {
            const rows = await ProducerInsightsService.getCustomersByRating(producerId, rating);
            return {
                message:
                    rows.length > 0
                        ? `Found ${rows.length} customers with ${rating}-star ratings`
                        : `No customers have given ${rating}-star ratings yet`,
                data: rows,
            };
        } catch (e: any) {
            const msg = String(e?.message || e);
            if (msg.includes("No customers") || msg.includes("not found") || msg.includes("No ratings")) {
                return { message: `No customers have given ${rating}-star ratings yet`, data: [] };
            }
            return { message: "Failed to fetch customers by rating. Please try again later.", data: null };
        }
    },
});

export const getRatingBreakdown = tool({
    name: "get_rating_breakdown",
    description: "Return the current overall rating and criteria breakdown for the producer.",
    parameters: z.object({
        producerId: z.number(),
    }),
    async execute({ producerId }) {
        try {
            const res = await ProducerInsightsService.getRatingBreakdown(producerId);
            if (!res) {
                return {
                    message: "You don't have any rating data yet. Ratings will appear once customers start reviewing your business.",
                    data: { type: null, overall: 0, criteria: {}, updatedAt: null },
                };
            }

            const oneDec = (n: number) => (Number.isFinite(n) ? parseFloat(n.toFixed(1)) : 0);
            const criteria = Object.fromEntries(Object.entries(res.criteria).map(([k, v]) => [k, oneDec(v as number)]));

            return {
                message: `Overall rating: ${oneDec(res.overall)}`,
                data: { type: res.type, overall: oneDec(res.overall), criteria, updatedAt: res.updatedAt },
            };
        } catch (error: any) {
            const msg = String(error?.message || error);
            if (msg.includes("No rating") || msg.includes("not found") || msg.includes("No data")) {
                return {
                    message: "You don't have any rating data yet. Ratings will appear once customers start reviewing your business.",
                    data: { type: null, overall: 0, criteria: {}, updatedAt: null },
                };
            }
            return { message: "Failed to fetch rating breakdown. Please try again later.", data: null };
        }
    },
});