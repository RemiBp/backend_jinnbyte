import { getNearbyProducers } from "../services/producer/maps.service";

export const findNearbyRestaurants = async (params: {
    cuisine?: string;
    latitude: number;
    longitude: number;
    radius_km: number;
}) => {
    if (!params.latitude || !params.longitude) {
        return { message: "Please enable location access to find nearby restaurants." };
    }

    const result = await getNearbyProducers({
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius_km ?? 10,
        type: "restaurant",
        sort: "distance",
        limit: 20,
        page: 1,
    });

    return result;
};
