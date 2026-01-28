import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Bug, Zap, Shield, Layout, Database } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  changes: {
    category: "feature" | "improvement" | "bugfix" | "security" | "ui" | "database";
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "2.0.0",
    date: "2025-01-28",
    type: "major",
    changes: [
      { category: "feature", description: "Added comprehensive in-app documentation with search functionality" },
      { category: "feature", description: "New changelog page to track platform updates" },
      { category: "feature", description: "Homepage quick filter chips for category-based filtering" },
      { category: "ui", description: "Skeleton loading states for all homepage sections" },
      { category: "improvement", description: "Enhanced breadcrumb navigation with structured data" },
    ],
  },
  {
    version: "1.5.0",
    date: "2025-01-20",
    type: "minor",
    changes: [
      { category: "feature", description: "Dynamic sitemap generation for improved SEO" },
      { category: "feature", description: "SEO meta tags and JSON-LD structured data" },
      { category: "improvement", description: "Enhanced tool details page with better organization" },
      { category: "ui", description: "Improved mobile responsiveness across all pages" },
    ],
  },
  {
    version: "1.4.0",
    date: "2025-01-15",
    type: "minor",
    changes: [
      { category: "feature", description: "AI-powered tool recommendations using Gemini 2.5 Flash" },
      { category: "feature", description: "Tool comparison feature - compare up to 3 tools side-by-side" },
      { category: "database", description: "Added tool_comparisons table for tracking comparisons" },
      { category: "improvement", description: "Enhanced search with full-text capabilities" },
    ],
  },
  {
    version: "1.3.0",
    date: "2025-01-10",
    type: "minor",
    changes: [
      { category: "feature", description: "User bookmarks system for saving favorite tools" },
      { category: "feature", description: "Review and rating system with helpful votes" },
      { category: "security", description: "Row-level security policies for user data" },
      { category: "database", description: "Added bookmarks and tool_ratings tables" },
    ],
  },
  {
    version: "1.2.0",
    date: "2025-01-05",
    type: "minor",
    changes: [
      { category: "feature", description: "Blog system with markdown support" },
      { category: "feature", description: "Newsletter subscription functionality" },
      { category: "feature", description: "Tool submission form for community contributions" },
      { category: "ui", description: "Dark mode support with theme toggle" },
    ],
  },
  {
    version: "1.1.0",
    date: "2024-12-28",
    type: "minor",
    changes: [
      { category: "feature", description: "Trending tools page with real-time popularity tracking" },
      { category: "feature", description: "Category pages with dedicated tool listings" },
      { category: "improvement", description: "Enhanced filtering by pricing, API availability" },
      { category: "database", description: "Added tool_views table for analytics" },
    ],
  },
  {
    version: "1.0.0",
    date: "2024-12-20",
    type: "major",
    changes: [
      { category: "feature", description: "Initial release of AI Tools Explorer" },
      { category: "feature", description: "Browse and search 50+ AI tools across 20 categories" },
      { category: "feature", description: "User authentication with email signup" },
      { category: "feature", description: "Admin panel for content management" },
      { category: "database", description: "Core database schema with ai_tools, profiles tables" },
    ],
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "feature":
      return <Sparkles className="h-4 w-4" />;
    case "improvement":
      return <Zap className="h-4 w-4" />;
    case "bugfix":
      return <Bug className="h-4 w-4" />;
    case "security":
      return <Shield className="h-4 w-4" />;
    case "ui":
      return <Layout className="h-4 w-4" />;
    case "database":
      return <Database className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "feature":
      return "bg-primary/10 text-primary border-primary/20";
    case "improvement":
      return "bg-accent/10 text-accent border-accent/20";
    case "bugfix":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "security":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "ui":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    case "database":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getVersionBadge = (type: string) => {
  switch (type) {
    case "major":
      return "bg-primary text-primary-foreground";
    case "minor":
      return "bg-accent text-accent-foreground";
    case "patch":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const Changelog = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Changelog
            </h1>
            <p className="text-muted-foreground text-lg">
              Track all updates, new features, and improvements to AI Tools Explorer
            </p>
          </div>

          <div className="space-y-8">
            {changelog.map((entry, index) => (
              <Card key={entry.version} className="glass border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl">v{entry.version}</CardTitle>
                      <Badge className={getVersionBadge(entry.type)}>
                        {entry.type}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {entry.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start gap-3">
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(change.category)} flex items-center gap-1.5 shrink-0`}
                        >
                          {getCategoryIcon(change.category)}
                          {change.category}
                        </Badge>
                        <span className="text-foreground/90">{change.description}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Changelog;
