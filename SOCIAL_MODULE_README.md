# Social Module Documentation

## Overview

The Social Module enables users to create posts about producers and allows producers to post about their businesses. The module supports different types of posts with flexible rating systems, interactions, and comprehensive analytics.

## Schema Design

### Core Entities

#### 1. Post
The main entity for all social content.

**Fields:**
- `id`: Primary key
- `type`: Post type (wellness, leisure, restaurant, event, simple)
- `status`: Post visibility (public, private, friends_only, draft, restricted)
- `publishDate`: When the post should be published
- `description`: Post content
- `coverImage`: Main image URL
- `link`: External link associated with the post
- `tags`: Array of tags
- `likesCount`, `shareCount`, `commentCount`: Interaction counters
- `overallAvgRating`: Average rating across all criteria
- `userId`: User who created the post (nullable)
- `producerId`: Producer who created the post (nullable)

**Relations:**
- User (Many-to-One)
- Producer (Many-to-One)
- PostLikes (One-to-Many)
- PostComments (One-to-Many)
- PostShares (One-to-Many)
- PostTags (One-to-Many)
- PostEmotions (One-to-Many)
- PostRatings (One-to-Many)
- PostImages (One-to-Many)
- PostStatistics (One-to-One)

#### 2. PostLike
Tracks user likes on posts.

**Features:**
- Unique constraint per user per post
- Soft delete support

#### 3. PostComment
User comments on posts.

**Features:**
- Rich text support
- Soft delete support

#### 4. PostShare
Tracks when users share posts.

**Features:**
- Unique constraint per user per post
- Analytics tracking

#### 5. PostTag
User-generated tags for posts.

**Features:**
- Flexible tagging system
- User attribution

#### 6. PostEmotion
Advanced reactions beyond simple likes.

**Emotion Types:**
- LIKE, LOVE, LAUGH, WOW, SAD, ANGRY

**Features:**
- Unique constraint per user per post
- One emotion per user per post

#### 7. PostRating
Flexible rating system for different post types.

**Features:**
- Rating value: 0.0 to 5.0
- Different criteria per post type
- Unique constraint per user per post per criteria
- Optional comment per rating

#### 8. PostImage
Multiple images per post.

**Features:**
- Cover image designation
- URL-based storage
- Soft delete support

#### 9. PostStatistics
Aggregated statistics for efficient querying.

**Features:**
- Real-time counters
- JSONB storage for flexible criteria ratings
- Emotion counts aggregation

#### 10. RatingConfiguration
Dynamic rating criteria management.

**Features:**
- Configure rating criteria per post type
- Add/remove criteria without schema changes
- Display names and descriptions
- Sort order management

## Rating System Design

### Flexible Architecture

The rating system is designed to handle different criteria for different post types:

#### Restaurant Posts
- Service
- Place
- Portions
- Ambiance

#### Leisure Posts
- Stage Direction
- Actor Performance
- Text Quality
- Scenography

#### Wellness Posts
- Care Quality
- Cleanliness
- Welcome
- Value for Money
- Atmosphere
- Staff Expertise

### Rating Features

1. **Dynamic Criteria**: New criteria can be added via RatingConfiguration
2. **Type Safety**: TypeScript enums ensure valid criteria usage
3. **Flexible Storage**: JSONB storage in PostStatistics for aggregated data
4. **Individual Ratings**: Each user can rate each criteria once
5. **Comments**: Optional text feedback per rating
6. **Validation**: Database constraints ensure ratings are 0-5

### Post Types and Ratings

- **Simple & Event Posts**: No rating system
- **Restaurant, Leisure, Wellness Posts**: Full rating system with specific criteria
- **Future Types**: Easily extensible through configuration

## Usage Examples

### Creating a Restaurant Post with Ratings

```typescript
// Create post
const post = new Post();
post.type = PostType.RESTAURANT;
post.status = PostStatus.PUBLIC;
post.description = "Amazing dining experience!";
post.producerId = restaurantId;

// Add ratings
const serviceRating = new PostRating();
serviceRating.postId = post.id;
serviceRating.userId = userId;
serviceRating.criteria = RestaurantRatingCriteria.SERVICE;
serviceRating.rating = 4.5;
serviceRating.comment = "Excellent service!";

const ambianceRating = new PostRating();
ambianceRating.postId = post.id;
ambianceRating.userId = userId;
ambianceRating.criteria = RestaurantRatingCriteria.AMBIANCE;
ambianceRating.rating = 5.0;
```

### Adding New Rating Criteria

```typescript
const newCriteria = new RatingConfiguration();
newCriteria.postType = PostType.RESTAURANT;
newCriteria.criteria = 'food_quality'; // Add to enum first
newCriteria.displayName = 'Food Quality';
newCriteria.description = 'Quality and taste of food';
newCriteria.sortOrder = 5;
```

## Database Relationships

```
User ←→ Post (One-to-Many)
Producer ←→ Post (One-to-Many)
Post ←→ PostLike (One-to-Many)
Post ←→ PostComment (One-to-Many)
Post ←→ PostShare (One-to-Many)
Post ←→ PostTag (One-to-Many)
Post ←→ PostEmotion (One-to-Many)
Post ←→ PostRating (One-to-Many)
Post ←→ PostImage (One-to-Many)
Post ←→ PostStatistics (One-to-One)
User ←→ [All Interaction Tables] (One-to-Many)
```

## Performance Considerations

1. **PostStatistics**: Pre-calculated aggregations for fast queries
2. **Indexes**: Strategic indexing on frequently queried fields
3. **Soft Deletes**: Maintains data integrity while hiding deleted content
4. **JSONB**: Efficient storage for flexible rating criteria
5. **Unique Constraints**: Prevent duplicate interactions

## Security Features

1. **User Attribution**: All interactions linked to users
2. **Soft Deletes**: Audit trail preservation
3. **Status Control**: Draft/private post support
4. **Validation**: Database-level constraints
5. **Timestamping**: Full audit trail with created/updated timestamps

## Migration and Setup

The migration file `1751700000000-social-module-setup.ts` creates:
- All required tables
- Foreign key constraints
- Unique constraints
- Check constraints for ratings
- Default rating configurations
- Performance indexes

To run the migration:
```bash
npm run typeorm migration:run
```

## Future Enhancements

1. **Nested Comments**: Reply-to-comment functionality
2. **Media Types**: Video and audio support
3. **Advanced Analytics**: Engagement metrics and trends
4. **Recommendation Engine**: Content suggestion algorithms
5. **Moderation Tools**: Content filtering and reporting
6. **Notification System**: Real-time interaction notifications

## API Endpoints Suggestions

```
POST /api/posts - Create post
GET /api/posts - List posts with filters
GET /api/posts/:id - Get specific post
PUT /api/posts/:id - Update post
DELETE /api/posts/:id - Soft delete post

POST /api/posts/:id/like - Like/unlike post
POST /api/posts/:id/share - Share post
POST /api/posts/:id/comment - Add comment
POST /api/posts/:id/emotion - Add emotion reaction
POST /api/posts/:id/rating - Add/update rating

GET /api/posts/:id/statistics - Get post statistics
GET /api/rating-configurations - Get rating criteria by post type
```

This comprehensive social module provides a solid foundation for user-generated content about producers while maintaining flexibility for future growth and modifications.
