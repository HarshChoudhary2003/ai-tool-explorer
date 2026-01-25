# AI Tools Explorer - Administrator Manual

<div align="center">
  <h3>🛠️ Complete Guide for Platform Administrators</h3>
  <p>Manage tools, content, users, and platform operations</p>
</div>

---

## 📖 Table of Contents

1. [Admin Access](#admin-access)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Managing AI Tools](#managing-ai-tools)
4. [Tool Submissions](#tool-submissions)
5. [Content Management](#content-management)
6. [User Management](#user-management)
7. [Analytics & Monitoring](#analytics--monitoring)
8. [Security Guidelines](#security-guidelines)
9. [Troubleshooting](#troubleshooting)

---

## 🔐 Admin Access

### Getting Admin Privileges

Admin access is granted through the `user_roles` database table. Only existing admins or database administrators can grant admin roles.

### Accessing the Admin Panel

1. **Sign In** with your admin account at `/auth`
2. **Navigate to Admin Panel** at `/admin`
3. The admin panel is only visible to users with the `admin` role

### Security Notes

- Admin sessions inherit standard authentication security
- All admin actions are logged in the database
- Role verification happens server-side via RLS policies
- Never share admin credentials

---

## 📊 Admin Dashboard Overview

The admin panel provides access to:

| Section | Functionality |
|---------|--------------|
| **Tools Management** | Add, edit, delete AI tools |
| **Submissions** | Review user-submitted tools |
| **Blog Posts** | Create and manage blog content |
| **Testimonials** | Manage user testimonials |
| **FAQs** | Update frequently asked questions |
| **Contact Messages** | View user inquiries |

---

## 🔧 Managing AI Tools

### Adding a New Tool

1. Navigate to **Admin Panel → Tools**
2. Click **"Add New Tool"**
3. Fill in required fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | Text | ✅ | Tool name (e.g., "ChatGPT") |
| `description` | Text | ✅ | Detailed description |
| `website_url` | URL | ✅ | Official tool website |
| `category` | Enum | ✅ | Primary category |
| `pricing` | Enum | ✅ | Pricing model |
| `tasks` | Array | ✅ | What the tool can do |
| `logo_url` | URL | ❌ | Tool logo image |
| `has_api` | Boolean | ❌ | API availability |
| `api_details` | Text | ❌ | API documentation link |
| `pricing_details` | Text | ❌ | Pricing breakdown |
| `use_cases` | Array | ❌ | Real-world applications |
| `pros` | Array | ❌ | Tool strengths |
| `cons` | Array | ❌ | Tool limitations |
| `rating` | Number | ❌ | Initial rating (0-5) |
| `popularity_score` | Number | ❌ | Trending weight |

### Category Options

```
llm, image_generation, voice, automation, no_code, video, audio,
productivity, code_assistant, data_analysis, writing, research,
customer_support, marketing, design, education, sales, hr_recruiting,
legal, finance, healthcare
```

### Pricing Options

```
free, freemium, paid, enterprise
```

### Editing a Tool

1. Find the tool in the admin list
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Save Changes"**

### Deleting a Tool

1. Find the tool in the admin list
2. Click **"Delete"** button
3. Confirm deletion in the modal
4. **Note**: This also removes associated reviews and bookmarks

---

## 📩 Tool Submissions

### Reviewing Submissions

User-submitted tools appear in the Submissions section:

1. Navigate to **Admin Panel → Submissions**
2. Review each submission:
   - Tool name and website
   - Category and pricing
   - Submitter information
   - Additional notes

### Submission Status

| Status | Description |
|--------|-------------|
| `pending` | Awaiting admin review |
| `approved` | Submission accepted |
| `rejected` | Submission declined |

### Approval Process

1. **Verify Information**
   - Check website is accessible
   - Confirm tool is AI-related
   - Validate category and pricing

2. **Check for Duplicates**
   - Search existing tools
   - Ensure not already listed

3. **Approve or Reject**
   - Approve: Creates new tool entry
   - Reject: Marks submission as rejected

### Creating Tool from Submission

When approving:
1. Click **"Approve & Create Tool"**
2. Review auto-filled information
3. Add missing details (pros, cons, use cases)
4. Save the new tool

---

## 📝 Content Management

### Blog Posts

#### Creating a Post

1. Go to **Admin Panel → Blog**
2. Click **"New Post"**
3. Fill in:

| Field | Description |
|-------|-------------|
| `title` | Post headline |
| `slug` | URL-friendly identifier (auto-generated) |
| `excerpt` | Short preview text |
| `content` | Full post body (Markdown supported) |
| `cover_image` | Header image URL |
| `category` | Post category |
| `is_featured` | Show in featured section |
| `is_published` | Make publicly visible |

#### Publishing Workflow

- **Draft**: `is_published = false`
- **Published**: `is_published = true`, sets `published_at`
- **Featured**: `is_featured = true` (shows prominently)

### FAQs

#### Managing FAQs

1. Go to **Admin Panel → FAQs**
2. Add, edit, or delete FAQs
3. Fields:

| Field | Description |
|-------|-------------|
| `question` | The FAQ question |
| `answer` | The FAQ answer |
| `category` | FAQ grouping |
| `sort_order` | Display order |
| `is_active` | Show/hide FAQ |

### Testimonials

#### Managing Testimonials

1. Go to **Admin Panel → Testimonials**
2. Add featured testimonials:

| Field | Description |
|-------|-------------|
| `name` | Person's name |
| `role` | Job title |
| `company` | Company name |
| `content` | Testimonial text |
| `rating` | Star rating (1-5) |
| `avatar_url` | Profile image |
| `is_featured` | Show on homepage |

---

## 👥 User Management

### User Roles

| Role | Permissions |
|------|-------------|
| `user` | Browse, bookmark, review tools |
| `moderator` | Review submissions (future) |
| `admin` | Full platform access |

### Granting Admin Access

Via database (Supabase Dashboard or SQL):

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

### Viewing User Activity

Admins can see:
- User bookmarks (aggregated)
- Review submissions
- Contact form messages
- Tool submissions

---

## 📈 Analytics & Monitoring

### Platform Metrics

Monitor through the database:

| Metric | Table | Query |
|--------|-------|-------|
| Total Tools | `ai_tools` | `SELECT COUNT(*) FROM ai_tools` |
| Total Users | `profiles` | `SELECT COUNT(*) FROM profiles` |
| Total Reviews | `tool_ratings` | `SELECT COUNT(*) FROM tool_ratings` |
| Total Bookmarks | `bookmarks` | `SELECT COUNT(*) FROM bookmarks` |
| Tool Views | `tool_views` | Aggregated by tool/time |

### Trending Calculation

Trending score formula:
```
score = (views × 1) + (bookmarks × 5) + (ratings × 3)
```

Query trending tools:
```sql
SELECT * FROM get_trending_tools(7, 10);
-- Returns top 10 tools from last 7 days
```

### Newsletter Subscribers

```sql
SELECT COUNT(*) FROM newsletter_subscribers WHERE is_active = true;
```

---

## 🔒 Security Guidelines

### Access Control

- ✅ Always use RLS policies for data access
- ✅ Verify admin role server-side
- ✅ Never expose service role key in frontend
- ❌ Don't store admin status in localStorage
- ❌ Don't hardcode admin credentials

### Content Guidelines

When reviewing submissions:
1. Verify tool legitimacy
2. Check for malicious URLs
3. Ensure accurate categorization
4. Remove inappropriate content

### Data Protection

- User passwords are hashed by Supabase Auth
- Personal data protected by RLS policies
- Admin actions logged for audit

---

## 🔧 Troubleshooting

### Common Issues

#### Tool Not Appearing

1. Check if `created_at` is set
2. Verify category is valid enum value
3. Ensure required fields are populated

#### Reviews Not Showing

1. Check RLS policies on `tool_ratings`
2. Verify user is authenticated
3. Check `tool_id` foreign key

#### Admin Panel Access Denied

1. Verify `user_roles` entry exists
2. Check role is exactly `'admin'`
3. Clear browser cache and re-login

### Database Queries

#### Find Tool by Name
```sql
SELECT * FROM ai_tools WHERE name ILIKE '%chatgpt%';
```

#### Recent Submissions
```sql
SELECT * FROM tool_submissions 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

#### User Reviews
```sql
SELECT t.name, r.rating, r.review, r.created_at
FROM tool_ratings r
JOIN ai_tools t ON r.tool_id = t.id
ORDER BY r.created_at DESC
LIMIT 20;
```

---

## 📞 Support

For technical issues:
- Check database logs in Supabase Dashboard
- Review Edge Function logs
- Contact development team

---

<div align="center">
  <strong>Keep the platform running smoothly! 🛠️</strong>
</div>
