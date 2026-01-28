import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Book,
  Users,
  Shield,
  Code,
  Server,
  GitBranch,
  Rocket,
  ChevronRight,
  ExternalLink,
  Home,
  Sparkles,
} from "lucide-react";

interface DocSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  audience: string;
  content: DocContent[];
}

interface DocContent {
  id: string;
  title: string;
  content: string;
  keywords: string[];
}

const docSections: DocSection[] = [
  {
    id: "user-guide",
    title: "User Guide",
    description: "Learn how to use AI Tools Explorer to discover and compare AI tools",
    icon: <Book className="h-5 w-5" />,
    audience: "End Users",
    content: [
      {
        id: "getting-started",
        title: "Getting Started",
        content: `Welcome to AI Tools Explorer! This platform helps you discover, compare, and find the perfect AI tools for your projects.

**Quick Start:**
1. Browse the homepage to see featured, trending, and new tools
2. Use the search bar to find specific tools or categories
3. Filter tools by category, pricing, and API availability
4. Compare up to 3 tools side-by-side
5. Get AI-powered recommendations based on your needs

**Creating an Account:**
- Click "Sign In" in the header
- Enter your email and create a password
- Verify your email (auto-confirmed for faster access)
- Access your dashboard to manage bookmarks and reviews`,
        keywords: ["start", "begin", "account", "signup", "register", "login"],
      },
      {
        id: "browsing-tools",
        title: "Browsing & Searching Tools",
        content: `**Search Features:**
- Use the global search bar to find tools by name or description
- Filter by categories: LLM, Image Generation, Voice, Automation, and more
- Filter by pricing: Free, Freemium, Paid, Enterprise
- Filter by API availability for developer integration

**Tool Categories:**
- Language Models (LLM)
- Image Generation
- Voice & Audio
- Video Generation
- Code Assistants
- Data Analysis
- Writing & Content
- Automation & Productivity
- And many more...

**Sorting Options:**
- Newest first
- Highest rated
- Most reviewed
- Alphabetical`,
        keywords: ["search", "browse", "filter", "category", "find", "discover"],
      },
      {
        id: "comparing-tools",
        title: "Comparing Tools",
        content: `**How to Compare:**
1. Navigate to the Compare page from the header
2. Search and select up to 3 tools to compare
3. View side-by-side comparison of features, pricing, and ratings

**Comparison Features:**
- Pricing comparison
- Feature highlights (pros/cons)
- User ratings and reviews
- API availability
- Use cases and capabilities

**Tips:**
- Compare tools within the same category for best results
- Check recent reviews for real-world experiences
- Consider your specific use case when evaluating`,
        keywords: ["compare", "comparison", "versus", "vs", "side-by-side"],
      },
      {
        id: "ai-recommendations",
        title: "AI Recommendations",
        content: `**Getting Personalized Recommendations:**
1. Go to the Recommend page
2. Describe your task or project requirements
3. Specify your budget (free, paid, any)
4. Indicate privacy requirements
5. Click "Get Recommendations"

**How It Works:**
Our AI analyzes your requirements and matches them against our database of tools, considering:
- Task compatibility
- Pricing alignment
- Privacy and data handling
- User ratings and reviews
- Feature requirements

**Best Results:**
- Be specific about your use case
- Mention any must-have features
- Include technical requirements (API, integrations)`,
        keywords: ["recommend", "suggestion", "ai", "personalized", "advice"],
      },
      {
        id: "bookmarks-reviews",
        title: "Bookmarks & Reviews",
        content: `**Bookmarking Tools:**
- Click the bookmark icon on any tool card
- Access all bookmarks from your Dashboard
- Organize and manage your saved tools

**Writing Reviews:**
1. Navigate to any tool's detail page
2. Scroll to the Reviews section
3. Click "Write a Review"
4. Rate the tool (1-5 stars)
5. Share your experience and tips

**Review Guidelines:**
- Be honest and constructive
- Include specific use cases
- Mention pros and cons
- Update reviews if your experience changes`,
        keywords: ["bookmark", "save", "review", "rating", "feedback"],
      },
    ],
  },
  {
    id: "admin-manual",
    title: "Admin Manual",
    description: "Guide for administrators to manage content and users",
    icon: <Shield className="h-5 w-5" />,
    audience: "Administrators",
    content: [
      {
        id: "admin-access",
        title: "Accessing Admin Panel",
        content: `**Admin Access Requirements:**
- Must have admin role assigned to your account
- Navigate to /admin or click Admin in your user menu

**Admin Dashboard Overview:**
- Tools Management: Add, edit, delete AI tools
- Reviews Moderation: Approve or remove user reviews
- Blog Management: Create and publish blog posts
- Submissions: Review community tool submissions
- User Management: View and manage user accounts

**Security:**
- Admin actions are logged
- Row-level security protects all data
- Regular audits recommended`,
        keywords: ["admin", "panel", "dashboard", "access", "management"],
      },
      {
        id: "managing-tools",
        title: "Managing Tools",
        content: `**Adding a New Tool:**
1. Go to Admin Panel > Tools
2. Click "Add New Tool"
3. Fill in required fields:
   - Name and description
   - Category and pricing type
   - Website URL
   - Features, pros, cons
4. Upload logo (optional)
5. Click Save

**Editing Tools:**
- Click the edit icon on any tool
- Update any fields as needed
- Changes are reflected immediately

**Deleting Tools:**
- Use with caution - this removes all associated data
- Consider archiving instead when possible`,
        keywords: ["tool", "add", "edit", "delete", "manage", "content"],
      },
      {
        id: "moderating-reviews",
        title: "Moderating Reviews",
        content: `**Review Moderation:**
- Access pending reviews from Admin Panel
- Review content for appropriateness
- Approve or reject submissions

**Moderation Guidelines:**
- Remove spam or promotional content
- Flag inappropriate language
- Verify authenticity when possible
- Respond to user concerns

**Handling Disputes:**
- Contact reviewer for clarification
- Allow tool owners to respond
- Make fair, documented decisions`,
        keywords: ["review", "moderate", "approve", "reject", "content"],
      },
    ],
  },
  {
    id: "developer-guide",
    title: "Developer Guide",
    description: "Technical documentation for developers and contributors",
    icon: <Code className="h-5 w-5" />,
    audience: "Developers",
    content: [
      {
        id: "tech-stack",
        title: "Technology Stack",
        content: `**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui component library
- Framer Motion for animations
- React Query for data fetching

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Edge Functions for serverless logic
- Row Level Security (RLS)

**Integrations:**
- Lovable AI Gateway (Gemini 2.5 Flash)
- Dynamic sitemap generation
- Email notifications`,
        keywords: ["tech", "stack", "react", "supabase", "typescript"],
      },
      {
        id: "project-structure",
        title: "Project Structure",
        content: `\`\`\`
src/
├── components/     # Reusable UI components
│   ├── ui/        # Shadcn/ui base components
│   └── ...        # Feature components
├── pages/         # Route page components
├── hooks/         # Custom React hooks
├── lib/           # Utility functions
├── integrations/  # External service integrations
└── data/          # Static data and types

supabase/
├── functions/     # Edge functions
├── migrations/    # Database migrations
└── config.toml    # Supabase configuration

docs/              # Documentation files
public/            # Static assets
\`\`\``,
        keywords: ["structure", "folder", "organization", "files", "architecture"],
      },
      {
        id: "local-development",
        title: "Local Development",
        content: `**Prerequisites:**
- Node.js 18+ or Bun
- Git

**Setup Steps:**
1. Clone the repository
2. Install dependencies: \`npm install\` or \`bun install\`
3. Copy environment variables
4. Start development server: \`npm run dev\`

**Environment Variables:**
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

**Development Commands:**
- \`npm run dev\` - Start dev server
- \`npm run build\` - Production build
- \`npm run lint\` - Run ESLint`,
        keywords: ["setup", "install", "development", "local", "environment"],
      },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    description: "Database schema and edge function documentation",
    icon: <Server className="h-5 w-5" />,
    audience: "Developers",
    content: [
      {
        id: "database-schema",
        title: "Database Schema",
        content: `**Core Tables:**

**ai_tools** - Main tools table
- id (UUID, primary key)
- name, description, website_url
- category (enum), pricing (enum)
- rating, popularity_score
- pros, cons, use_cases (arrays)
- has_api, api_details

**profiles** - User profiles
- id, user_id, display_name, email, avatar_url

**tool_ratings** - Reviews and ratings
- id, tool_id, user_id, rating, review
- helpful_count, created_at

**bookmarks** - User bookmarks
- id, tool_id, user_id, created_at

**blog_posts** - Blog content
- id, title, slug, content, excerpt
- author_id, is_published, published_at`,
        keywords: ["database", "schema", "table", "column", "structure"],
      },
      {
        id: "edge-functions",
        title: "Edge Functions",
        content: `**Available Functions:**

**recommend-tools**
- Purpose: AI-powered tool recommendations
- Method: POST
- Body: { task, budget, privacy }
- Returns: Array of recommended tools

**generate-sitemap**
- Purpose: Dynamic sitemap generation
- Method: GET
- Returns: XML sitemap

**notify-new-tools**
- Purpose: Email notifications for new tools
- Triggered: On new tool creation

**send-notification-email**
- Purpose: General email sending
- Internal use only`,
        keywords: ["function", "edge", "api", "endpoint", "serverless"],
      },
    ],
  },
  {
    id: "contributing",
    title: "Contributing",
    description: "Guidelines for contributing to the project",
    icon: <GitBranch className="h-5 w-5" />,
    audience: "Contributors",
    content: [
      {
        id: "how-to-contribute",
        title: "How to Contribute",
        content: `**Ways to Contribute:**
1. Report bugs and issues
2. Suggest new features
3. Submit tool additions
4. Improve documentation
5. Fix bugs and implement features

**Contribution Process:**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

**Code Standards:**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Include documentation updates`,
        keywords: ["contribute", "help", "fork", "pull request", "community"],
      },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    description: "Guide for deploying and hosting the application",
    icon: <Rocket className="h-5 w-5" />,
    audience: "DevOps",
    content: [
      {
        id: "deployment-options",
        title: "Deployment Options",
        content: `**Lovable Hosting (Recommended):**
- One-click deployment
- Automatic SSL certificates
- Custom domain support
- Built-in CDN

**Other Options:**
- Vercel
- Netlify
- Cloudflare Pages
- Self-hosted

**Environment Setup:**
- Configure production environment variables
- Set up database connections
- Enable RLS policies
- Configure authentication providers`,
        keywords: ["deploy", "host", "production", "ssl", "domain"],
      },
    ],
  },
];

const Docs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const activeSection = searchParams.get("section") || "user-guide";
  const activeContent = searchParams.get("content") || "";

  const currentSection = docSections.find((s) => s.id === activeSection);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: { section: DocSection; content: DocContent; relevance: number }[] = [];

    docSections.forEach((section) => {
      section.content.forEach((content) => {
        const titleMatch = content.title.toLowerCase().includes(query);
        const contentMatch = content.content.toLowerCase().includes(query);
        const keywordMatch = content.keywords.some((k) => k.includes(query));

        if (titleMatch || contentMatch || keywordMatch) {
          results.push({
            section,
            content,
            relevance: (titleMatch ? 3 : 0) + (keywordMatch ? 2 : 0) + (contentMatch ? 1 : 0),
          });
        }
      });
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  }, [searchQuery]);

  const handleSectionClick = (sectionId: string, contentId?: string) => {
    setSearchQuery("");
    if (contentId) {
      setSearchParams({ section: sectionId, content: contentId });
    } else {
      setSearchParams({ section: sectionId });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about AI Tools Explorer
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-8 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
                <CardContent className="p-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={`${result.section.id}-${result.content.id}`}
                      onClick={() => handleSectionClick(result.section.id, result.content.id)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors flex items-center gap-3"
                    >
                      {result.section.icon}
                      <div>
                        <div className="font-medium">{result.content.title}</div>
                        <div className="text-sm text-muted-foreground">{result.section.title}</div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <Card className="glass sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[60vh]">
                    <nav className="p-4 pt-0 space-y-1">
                      {docSections.map((section) => (
                        <div key={section.id}>
                          <button
                            onClick={() => handleSectionClick(section.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left ${
                              activeSection === section.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted text-foreground"
                            }`}
                          >
                            {section.icon}
                            <span className="font-medium">{section.title}</span>
                          </button>

                          {activeSection === section.id && (
                            <div className="ml-6 mt-1 space-y-1">
                              {section.content.map((content) => (
                                <button
                                  key={content.id}
                                  onClick={() => handleSectionClick(section.id, content.id)}
                                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                                    activeContent === content.id
                                      ? "text-primary font-medium"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {content.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {currentSection && (
                <Card className="glass">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Link to="/docs" className="hover:text-primary">
                        <Home className="h-4 w-4" />
                      </Link>
                      <ChevronRight className="h-4 w-4" />
                      <span>{currentSection.title}</span>
                      {activeContent && (
                        <>
                          <ChevronRight className="h-4 w-4" />
                          <span>
                            {currentSection.content.find((c) => c.id === activeContent)?.title}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {currentSection.icon}
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
                        <CardDescription>{currentSection.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="w-fit mt-2">
                      {currentSection.audience}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {currentSection.content
                        .filter((content) => !activeContent || content.id === activeContent)
                        .map((content) => (
                          <div key={content.id} id={content.id}>
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                              {content.title}
                            </h3>
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                              {content.content.split("\n").map((paragraph, idx) => {
                                if (paragraph.startsWith("```")) {
                                  return null;
                                }
                                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                                  return (
                                    <h4 key={idx} className="font-semibold mt-4 mb-2">
                                      {paragraph.replace(/\*\*/g, "")}
                                    </h4>
                                  );
                                }
                                if (paragraph.startsWith("- ")) {
                                  return (
                                    <li key={idx} className="ml-4">
                                      {paragraph.replace("- ", "")}
                                    </li>
                                  );
                                }
                                if (paragraph.match(/^\d+\./)) {
                                  return (
                                    <li key={idx} className="ml-4 list-decimal">
                                      {paragraph.replace(/^\d+\.\s*/, "")}
                                    </li>
                                  );
                                }
                                if (paragraph.trim()) {
                                  return (
                                    <p key={idx} className="mb-2 text-muted-foreground">
                                      {paragraph}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            <Separator className="mt-6" />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <Card className="glass hover:border-primary/50 transition-colors cursor-pointer">
                  <Link to="/changelog">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Changelog</CardTitle>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardDescription>View version history and updates</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
                <Card className="glass hover:border-primary/50 transition-colors cursor-pointer">
                  <Link to="/contact">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Contact Support</CardTitle>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <CardDescription>Get help from our team</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;
