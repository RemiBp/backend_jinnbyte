export enum RestaurantRatingCriteria {
    SERVICE = 'service',
    PLACE = 'place',
    PORTIONS = 'portions',
    AMBIANCE = 'ambiance',
}

export enum LeisureRatingCriteria {
    STAGE_DIRECTION = 'stage_direction',
    ACTOR_PERFORMANCE = 'actor_performance',
    TEXT_QUALITY = 'text_quality',
    SCENOGRAPHY = 'scenography',
}

export enum WellnessRatingCriteria {
    CARE_QUALITY = 'care_quality',
    CLEANLINESS = 'cleanliness',
    WELCOME = 'welcome',
    VALUE_FOR_MONEY = 'value_for_money',
    ATMOSPHERE = 'atmosphere',
    STAFF_EXPERTISE = 'staff_expertise',
}

export type RatingCriteria = RestaurantRatingCriteria | LeisureRatingCriteria | WellnessRatingCriteria;
