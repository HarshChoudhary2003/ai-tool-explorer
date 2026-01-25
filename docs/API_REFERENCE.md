# AI Tools Explorer - API Reference

<div align="center">
  <h3>🔌 Database Schema & Edge Functions API</h3>
  <p>Complete reference for database tables, RLS policies, and serverless functions</p>
</div>

---

## 📖 Table of Contents

1. [Database Schema](#database-schema)
2. [Enum Types](#enum-types)
3. [Database Functions](#database-functions)
4. [Edge Functions](#edge-functions)
5. [Row Level Security](#row-level-security)
6. [Query Examples](#query-examples)

---

## 🗄️ Database Schema

### ai_tools

Primary table storing all AI tools.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Tool name |
| `description` | text | No | - | Full description |
| `website_url` | text | No | - | Official website |
| `category` | tool_category | No | - | Primary category |
| `pricing` | pricing_type | No | 'freemium' | Pricing model |
| `tasks` | text[] | No | '{}' | Supported tasks |
| `logo_url` | text | Yes | - | Logo image URL |
| `has_api` | boolean | Yes | false | API availability |
| `api_details` | text | Yes | - | API documentation |
| `pricing_details` | text | Yes | - | Pricing breakdown |
| `use_cases` | text[] | Yes | '{}' | Example use cases |
| `pros` | text[] | Yes | '{}' | Tool strengths |
| `cons` | text[] | Yes | '{}' | Tool weaknesses |
| `rating` | numeric | Yes | 0 | Average rating |
| `popularity_score` | integer | Yes | 0 | Trending weight |
| `created_at` | timestamptz | Yes | now() | Creation timestamp |
| `updated_at` | timestamptz | Yes | now() | Last update |

---

### profiles

User profile information.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | Auth user reference |
| `display_name` | text | Yes | - | Display name |
| `email` | text | Yes | - | Email address |
| `avatar_url` | text | Yes | - | Profile image |
| `created_at` | timestamptz | No | now() | Creation timestamp |
| `updated_at` | timestamptz | No | now() | Last update |

---

### user_roles

Role-based access control.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | Auth user reference |
| `role` | app_role | No | - | Assigned role |
| `created_at` | timestamptz | No | now() | Assignment timestamp |

**Unique constraint**: `(user_id, role)`

---

### tool_ratings

User reviews and ratings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | Reviewer |
| `tool_id` | uuid | No | - | Reviewed tool |
| `rating` | integer | No | - | Star rating (1-5) |
| `review` | text | Yes | - | Review text |
| `helpful_count` | integer | Yes | 0 | Helpful votes |
| `created_at` | timestamptz | No | now() | Review timestamp |

**Foreign key**: `tool_id` → `ai_tools.id`

---

### review_helpful_votes

Tracks helpful votes on reviews.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `review_id` | uuid | No | - | Voted review |
| `user_id` | uuid | No | - | Voter |
| `created_at` | timestamptz | No | now() | Vote timestamp |

**Foreign key**: `review_id` → `tool_ratings.id`

---

### bookmarks

User saved tools.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | User |
| `tool_id` | uuid | No | - | Bookmarked tool |
| `created_at` | timestamptz | No | now() | Bookmark timestamp |

**Foreign key**: `tool_id` → `ai_tools.id`

---

### tool_views

Analytics for tool page views.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `tool_id` | uuid | No | - | Viewed tool |
| `user_id` | uuid | Yes | - | Viewer (if logged in) |
| `session_id` | text | Yes | - | Anonymous session |
| `viewed_at` | timestamptz | No | now() | View timestamp |

**Foreign key**: `tool_id` → `ai_tools.id`

---

### tool_submissions

User-submitted tool suggestions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Tool name |
| `website_url` | text | No | - | Website |
| `description` | text | No | - | Description |
| `category` | text | No | - | Category |
| `pricing` | text | No | - | Pricing model |
| `submitter_email` | text | No | - | Submitter contact |
| `submitter_name` | text | Yes | - | Submitter name |
| `additional_info` | text | Yes | - | Extra details |
| `status` | text | No | 'pending' | Review status |
| `reviewed_at` | timestamptz | Yes | - | Review timestamp |
| `reviewed_by` | uuid | Yes | - | Reviewing admin |
| `created_at` | timestamptz | No | now() | Submission time |

---

### blog_posts

Blog content.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `title` | text | No | - | Post title |
| `slug` | text | No | - | URL slug |
| `excerpt` | text | Yes | - | Preview text |
| `content` | text | No | - | Full content |
| `cover_image` | text | Yes | - | Header image |
| `category` | text | Yes | 'general' | Post category |
| `author_id` | uuid | Yes | - | Author |
| `is_published` | boolean | Yes | false | Published status |
| `is_featured` | boolean | Yes | false | Featured status |
| `published_at` | timestamptz | Yes | - | Publish date |
| `created_at` | timestamptz | No | now() | Creation date |
| `updated_at` | timestamptz | No | now() | Last update |

---

### faqs

Frequently asked questions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `question` | text | No | - | Question text |
| `answer` | text | No | - | Answer text |
| `category` | text | Yes | - | FAQ category |
| `sort_order` | integer | Yes | 0 | Display order |
| `is_active` | boolean | Yes | true | Active status |
| `created_at` | timestamptz | No | now() | Creation date |

---

### testimonials

User testimonials.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Person name |
| `role` | text | Yes | - | Job title |
| `company` | text | Yes | - | Company |
| `content` | text | No | - | Testimonial text |
| `avatar_url` | text | Yes | - | Profile image |
| `rating` | integer | Yes | 5 | Rating |
| `is_featured` | boolean | Yes | false | Featured status |
| `created_at` | timestamptz | No | now() | Creation date |

---

### newsletter_subscribers

Email subscribers.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `email` | text | No | - | Email address |
| `is_active` | boolean | Yes | true | Active status |
| `subscribed_at` | timestamptz | No | now() | Subscribe date |

---

### contacts

Contact form submissions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `name` | text | No | - | Sender name |
| `email` | text | No | - | Sender email |
| `subject` | text | Yes | - | Message subject |
| `message` | text | No | - | Message body |
| `created_at` | timestamptz | No | now() | Submission date |

---

### user_category_interests

User category preferences for notifications.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | User |
| `category` | tool_category | No | - | Category interest |
| `email_notifications` | boolean | Yes | true | Email opt-in |
| `created_at` | timestamptz | No | now() | Creation date |

---

### tool_comparisons

Saved tool comparisons.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | Yes | - | User |
| `tool_ids` | uuid[] | No | - | Compared tools |
| `created_at` | timestamptz | Yes | now() | Creation date |

---

### tool_notifications_log

Email notification history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `user_id` | uuid | No | - | Recipient |
| `tool_id` | uuid | No | - | Related tool |
| `sent_at` | timestamptz | No | now() | Send timestamp |

---

## 📋 Enum Types

### tool_category

```sql
'llm' | 'image_generation' | 'voice' | 'automation' | 'no_code' |
'video' | 'audio' | 'productivity' | 'code_assistant' | 'data_analysis' |
'writing' | 'research' | 'customer_support' | 'marketing' | 'design' |
'education' | 'sales' | 'hr_recruiting' | 'legal' | 'finance' | 'healthcare'
```

### pricing_type

```sql
'free' | 'freemium' | 'paid' | 'enterprise'
```

### app_role

```sql
'admin' | 'moderator' | 'user'
```

---

## ⚡ Database Functions

### has_role

Check if a user has a specific role.

```sql
has_role(_user_id uuid, _role app_role) → boolean
```

**Usage:**
```sql
SELECT has_role('user-uuid', 'admin'); -- Returns true/false
```

---

### get_trending_tools

Get trending tools based on views, bookmarks, and ratings.

```sql
get_trending_tools(days_back integer DEFAULT 7, limit_count integer DEFAULT 10)
→ TABLE(tool_id, tool_name, view_count, bookmark_count, rating_count, trending_score)
```

**Usage:**
```sql
SELECT * FROM get_trending_tools(7, 10);
```

**Scoring formula:**
```
trending_score = (view_count × 1) + (bookmark_count × 5) + (rating_count × 3)
```

---

### handle_new_user

Trigger function for new user registration.

- Creates profile entry
- Assigns default 'user' role

---

### update_updated_at_column

Trigger function to update `updated_at` timestamps.

---

## 🔌 Edge Functions

### recommend-tools

AI-powered tool recommendations.

**Endpoint:** `POST /functions/v1/recommend-tools`

**Request Body:**
```json
{
  "task": "string - What you need help with",
  "budget": "string - Budget constraints",
  "requirements": "string - Additional requirements"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "name": "Tool Name",
      "reason": "Why this tool fits",
      "link": "/tools/tool-id"
    }
  ]
}
```

---

### send-notification-email

Send transactional emails.

**Endpoint:** `POST /functions/v1/send-notification-email`

**Request Body:**
```json
{
  "type": "newsletter_welcome | new_tool | contact_confirmation",
  "data": {
    "email": "recipient@example.com",
    ...
  }
}
```

---

### notify-new-tools

Notify subscribers about new tools.

**Endpoint:** `POST /functions/v1/notify-new-tools`

---

### generate-sitemap

Generate dynamic sitemap XML.

**Endpoint:** `GET /functions/v1/generate-sitemap`

**Response:** XML sitemap

---

## 🔒 Row Level Security

### ai_tools

| Policy | Command | Condition |
|--------|---------|-----------|
| Anyone can view | SELECT | `true` |
| Admins can insert | INSERT | `has_role(auth.uid(), 'admin')` |
| Admins can update | UPDATE | `has_role(auth.uid(), 'admin')` |
| Admins can delete | DELETE | `has_role(auth.uid(), 'admin')` |

### profiles

| Policy | Command | Condition |
|--------|---------|-----------|
| View own profile | SELECT | `auth.uid() = user_id` |
| Insert own profile | INSERT | `auth.uid() = user_id` |
| Update own profile | UPDATE | `auth.uid() = user_id` |

### bookmarks

| Policy | Command | Condition |
|--------|---------|-----------|
| View own | SELECT | `auth.uid() = user_id` |
| Create own | INSERT | `auth.uid() = user_id` |
| Delete own | DELETE | `auth.uid() = user_id` |

### tool_ratings

| Policy | Command | Condition |
|--------|---------|-----------|
| Anyone can view | SELECT | `true` |
| Create own | INSERT | `auth.uid() = user_id` |
| Update own | UPDATE | `auth.uid() = user_id` |

### blog_posts

| Policy | Command | Condition |
|--------|---------|-----------|
| View published | SELECT | `is_published = true` |
| Admins manage | ALL | `has_role(auth.uid(), 'admin')` |

---

## 📝 Query Examples

### Get Tools by Category

```typescript
const { data } = await supabase
  .from("ai_tools")
  .select("*")
  .eq("category", "llm")
  .order("rating", { ascending: false });
```

### Get Tool with Reviews

```typescript
const { data } = await supabase
  .from("ai_tools")
  .select(`
    *,
    tool_ratings (
      id, rating, review, created_at,
      profiles:user_id (display_name, avatar_url)
    )
  `)
  .eq("id", toolId)
  .single();
```

### Search Tools

```typescript
const { data } = await supabase
  .from("ai_tools")
  .select("*")
  .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
```

### Get User Bookmarks

```typescript
const { data } = await supabase
  .from("bookmarks")
  .select(`
    id, created_at,
    ai_tools (*)
  `)
  .eq("user_id", userId);
```

### Count Reviews per Tool

```typescript
const { data } = await supabase
  .from("tool_ratings")
  .select("tool_id")
  .then((result) => {
    // Aggregate counts
  });
```

### Get Trending Tools

```typescript
const { data } = await supabase
  .rpc("get_trending_tools", { days_back: 7, limit_count: 10 });
```

---

<div align="center">
  <strong>Build amazing integrations! 🔌</strong>
</div>
