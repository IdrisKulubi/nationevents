# Nxt Her Summit Database Schema

This document describes the database schema for the Nxt Her Summit event platform, which provides event-specific data isolation from the main Nation Events platform.

## Overview

The Nxt Her Summit schema consists of 13 specialized tables with the `nxt_her_` prefix to ensure complete data isolation. The schema supports:

- Event management
- Attendee registration and profiles
- Speaker and session management
- Networking and connection features
- Forum discussions
- Feedback collection
- Session bookmarking

## Table Structure

### Core Event Tables

#### `nxt_her_event`
Main event configuration table.
- **Primary Key**: `id` (text)
- **Key Fields**: `name`, `start_date`, `end_date`, `venue`, `branding`
- **Indexes**: name, active status, date

#### `nxt_her_attendee`
Comprehensive attendee profiles with registration data.
- **Primary Key**: `id` (text)
- **Key Fields**: `first_name`, `last_name`, `email`, `country`, `attendance_type`
- **Features**: Professional details, consent tracking, authentication
- **Indexes**: event_id, email, status, name, country, attendance_type
- **Unique Constraint**: email per event

#### `nxt_her_speaker`
Speaker profiles and information.
- **Primary Key**: `id` (text)
- **Key Fields**: `name`, `bio`, `organization`, `expertise`
- **Features**: Social media links, keynote designation, display ordering
- **Indexes**: event_id, name, keynote status, display_order

#### `nxt_her_session`
Session/workshop/panel details.
- **Primary Key**: `id` (text)
- **Key Fields**: `title`, `session_type`, `track`, `pillar`, `start_time`, `end_time`
- **Features**: Virtual meeting support, capacity limits
- **Indexes**: event_id, title, type, track, pillar, time, virtual status

#### `nxt_her_session_speaker`
Junction table linking sessions to speakers.
- **Composite Primary Key**: `session_id` + `speaker_id`
- **Features**: Role designation (moderator, speaker, panelist)
- **Indexes**: session_id, speaker_id, role

### Networking Tables

#### `nxt_her_networking_profile`
Extended networking profiles for attendees.
- **Primary Key**: `id` (text)
- **Key Fields**: `networking_goals`, `sector`, `region`, `interests`
- **Features**: Visibility controls, connection preferences
- **Indexes**: attendee_id, sector, region, visibility

#### `nxt_her_connection_suggestion`
AI-powered connection recommendations.
- **Primary Key**: `id` (text)
- **Key Fields**: `from_attendee_id`, `to_attendee_id`, `match_score`, `match_reasons`
- **Features**: Status tracking, match scoring
- **Indexes**: from_attendee, to_attendee, status, score

#### `nxt_her_connection`
Actual connections between attendees.
- **Primary Key**: `id` (text)
- **Key Fields**: `requester_attendee_id`, `requested_attendee_id`, `status`
- **Features**: Connection requests, messages, timestamps
- **Indexes**: requester, requested, status
- **Unique Constraint**: Prevents duplicate connection requests

### Community Tables

#### `nxt_her_forum`
Discussion forums by category.
- **Primary Key**: `id` (text)
- **Key Fields**: `title`, `category`, `moderator_ids`
- **Features**: Category organization, moderation
- **Indexes**: event_id, title, category, active status

#### `nxt_her_forum_post`
Forum posts and replies.
- **Primary Key**: `id` (text)
- **Key Fields**: `forum_id`, `author_attendee_id`, `content`, `parent_post_id`
- **Features**: Threaded discussions, moderation
- **Indexes**: forum_id, author, parent_post, moderated status, created_at

### Feedback Tables

#### `nxt_her_session_feedback`
Session-specific feedback and ratings.
- **Primary Key**: `id` (text)
- **Key Fields**: `session_id`, `attendee_id`, `rating`, `content_quality`, `speaker_rating`
- **Features**: Multi-dimensional ratings, recommendations
- **Indexes**: session_id, attendee_id, rating
- **Unique Constraint**: One feedback per session per attendee

#### `nxt_her_event_feedback`
Overall event feedback and NPS scoring.
- **Primary Key**: `id` (text)
- **Key Fields**: `event_id`, `attendee_id`, `nps_score`, `overall_rating`
- **Features**: NPS tracking, multi-dimensional ratings, suggestions
- **Indexes**: event_id, attendee_id, nps_score, overall_rating
- **Unique Constraint**: One feedback per event per attendee

#### `nxt_her_session_bookmark`
Personal session bookmarks for attendees.
- **Primary Key**: `id` (text)
- **Key Fields**: `attendee_id`, `session_id`, `notes`
- **Features**: Personal notes, session tracking
- **Indexes**: attendee_id, session_id
- **Unique Constraint**: One bookmark per session per attendee

## Key Features

### Data Isolation
- Complete separation from main Nation Events platform
- Event-specific data with proper foreign key relationships
- Isolated user authentication and profiles

### Performance Optimization
- Comprehensive indexing strategy
- Optimized for common query patterns
- Efficient relationship traversal

### Scalability
- Designed for high attendee volumes
- Efficient networking algorithms support
- Optimized feedback collection

### Data Integrity
- Proper foreign key constraints
- Unique constraints prevent duplicates
- Cascade deletes maintain referential integrity

## Migration Information

- **Migration File**: `0004_nxt_her_summit_schema.sql`
- **Tables Created**: 13 tables
- **Indexes Created**: 60+ optimized indexes
- **Foreign Keys**: 16 relationship constraints
- **Unique Constraints**: 5 data integrity constraints

## Usage Notes

1. All tables use text-based primary keys for flexibility
2. JSON fields store complex data structures (arrays, objects)
3. Timestamp fields use PostgreSQL's `timestamp` type with `now()` defaults
4. Boolean fields have appropriate defaults
5. Decimal fields use proper precision for scoring (3,2)

## Security Considerations

- Password hashes stored securely in `nxt_her_attendee.password_hash`
- Email verification tracking
- Consent and terms acceptance tracking
- Data privacy compliance fields
- Moderation capabilities for forum content