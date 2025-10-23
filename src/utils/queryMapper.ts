export const mapQueryToIntent = (query: string): string => {
    const q = query.toLowerCase();

    // User
    if (q.includes("nearby") && q.includes("restaurant")) return "find_nearby_restaurants";
    if (q.includes("event") && q.includes("weekend")) return "get_upcoming_events";
    if (q.includes("friend") && q.includes("booking")) return "get_friends_bookings";
    if (q.includes("friend") && q.includes("choice")) return "get_friends_recent_choices";

    // Producer
    if (q.includes("profile") && q.includes("view")) return "get_profile_views";
    if (q.includes("popular") || q.includes("attention")) return "get_popular_items";
    if (q.includes("upcoming") && q.includes("booking")) return "get_upcoming_bookings";
    if (q.includes("average") && q.includes("rating")) return "get_average_rating_by_month";
    if (q.includes("review") && q.includes("mention")) return "get_reviews_by_keyword";

    return "unknown";
};
