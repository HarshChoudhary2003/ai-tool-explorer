import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Fuse, { FuseResultMatch } from "fuse.js";
import { supabase } from "@/integrations/supabase/client";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { categoryData } from "@/data/categoryData";
import type { Database } from "@/integrations/supabase/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/RatingStars";
import {
  Search,
  Sparkles,
  Book,
  FileText,
  TrendingUp,
  GitCompare,
  Lightbulb,
  PenTool,
  History,
  X,
  Clock,
  Filter,
} from "lucide-react";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const docPages = [
  { title: "Getting Started", path: "/docs?section=user-guide&content=getting-started", icon: Book },
  { title: "Browsing Tools", path: "/docs?section=user-guide&content=browsing-tools", icon: Search },
  { title: "Comparing Tools", path: "/docs?section=user-guide&content=comparing-tools", icon: GitCompare },
  { title: "AI Recommendations", path: "/docs?section=user-guide&content=ai-recommendations", icon: Lightbulb },
  { title: "Admin Panel", path: "/docs?section=admin-manual&content=admin-access", icon: FileText },
  { title: "Developer Guide", path: "/docs?section=developer-guide&content=tech-stack", icon: FileText },
  { title: "API Reference", path: "/docs?section=api-reference&content=database-schema", icon: FileText },
];

const quickLinks = [
  { title: "Browse All Tools", path: "/tools", icon: Sparkles },
  { title: "Trending Tools", path: "/trending", icon: TrendingUp },
  { title: "Compare Tools", path: "/compare", icon: GitCompare },
  { title: "Get Recommendations", path: "/recommend", icon: Lightbulb },
  { title: "Submit a Tool", path: "/submit", icon: PenTool },
  { title: "Changelog", path: "/changelog", icon: History },
];

type ToolCategory = Database["public"]["Enums"]["tool_category"];

// Get categories for filter chips
const categories = Object.entries(categoryData).map(([slug, data]) => ({
  slug: slug as ToolCategory,
  name: data.name,
  icon: data.icon,
}));

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  // Fetch all tools for fuzzy search (cached)
  const { data: allTools = [] } = useQuery({
    queryKey: ["global-search-all-tools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("id, name, category, description, pricing, rating");

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fuse.js configuration for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(allTools, {
      keys: ["name", "description"],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      distance: 100,
      includeScore: true,
      includeMatches: true, // Enable match info for highlighting
    });
  }, [allTools]);

  // Fuzzy search results with match info
  const toolsWithMatches = useMemo(() => {
    let results: { item: typeof allTools[0]; matches?: readonly FuseResultMatch[] }[] = [];

    // Apply fuzzy search if there's a search query
    if (search.trim()) {
      const fuseResults = fuse.search(search);
      results = fuseResults.map((result) => ({
        item: result.item,
        matches: result.matches,
      }));
    } else {
      results = allTools.map((item) => ({ item, matches: undefined }));
    }

    // Filter by category if selected
    if (selectedCategory) {
      results = results.filter((r) => r.item.category === selectedCategory);
    }

    return results.slice(0, 8);
  }, [search, selectedCategory, fuse, allTools]);

  // Helper function to highlight matched text
  const highlightMatch = (text: string, matches: readonly FuseResultMatch[] | undefined, key: string) => {
    if (!matches || !search.trim()) return text;

    const match = matches.find((m) => m.key === key);
    if (!match || !match.indices.length) return text;

    const indices = [...match.indices].sort((a, b) => a[0] - b[0]);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    indices.forEach(([start, end], i) => {
      // Add non-matched text before this match
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      // Add highlighted matched text
      parts.push(
        <span key={i} className="text-searchHighlight bg-searchHighlight-bg/20 font-semibold px-0.5 rounded-sm">
          {text.slice(start, end + 1)}
        </span>
      );
      lastIndex = end + 1;
    });

    // Add remaining non-matched text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
  };

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedCategory(null);
    }
  }, [open]);

  const handleSelect = (path: string, searchQuery?: string) => {
    if (searchQuery) {
      addSearch(searchQuery);
    }
    onOpenChange(false);
    setSearch("");
    setSelectedCategory(null);
    navigate(path);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearch(query);
  };

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleCategory = (slug: ToolCategory) => {
    setSelectedCategory((prev) => (prev === slug ? null : slug));
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tools, documentation..."
        value={search}
        onValueChange={setSearch}
      />
      
      {/* Category Filter Chips */}
      <div className="border-b px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filter by category:</span>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1 text-xs"
              onClick={() => setSelectedCategory(null)}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {categories.slice(0, 12).map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.slug;
            return (
              <Badge
                key={cat.slug}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer text-xs py-0.5 hover:bg-primary/10 transition-colors"
                onClick={() => toggleCategory(cat.slug)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {cat.name.length > 15 ? cat.name.slice(0, 15) + "..." : cat.name}
              </Badge>
            );
          })}
        </div>
      </div>

      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Recent Searches */}
        {!search && !selectedCategory && recentSearches.length > 0 && (
          <>
            <CommandGroup heading={
              <div className="flex items-center justify-between w-full">
                <span>Recent Searches</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSearches();
                  }}
                >
                  Clear all
                </Button>
              </div>
            }>
              {recentSearches.map((query) => (
                <CommandItem
                  key={query}
                  value={`recent-${query}`}
                  onSelect={() => handleRecentSearchClick(query)}
                  className="cursor-pointer group"
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1">{query}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSearch(query);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Tool Results */}
        {(search.trim() || selectedCategory) && toolsWithMatches.length > 0 && (
          <CommandGroup heading="Tools">
            {toolsWithMatches.map(({ item: tool, matches }) => (
              <HoverCard key={tool.id} openDelay={300} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <CommandItem
                    value={tool.name}
                    onSelect={() => handleSelect(`/tools/${tool.id}`, search)}
                    className="cursor-pointer"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    <div className="flex flex-col flex-1">
                      <span>{highlightMatch(tool.name, matches, "name")}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCategory(tool.category)}
                      </span>
                    </div>
                  </CommandItem>
                </HoverCardTrigger>
                <HoverCardContent 
                  side="right" 
                  align="start" 
                  className="w-80 p-4"
                  sideOffset={8}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">{tool.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description.length > 150 
                        ? tool.description.slice(0, 150) + "..." 
                        : tool.description}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <RatingStars rating={tool.rating || 0} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {tool.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {tool.pricing}
                      </Badge>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                        {formatCategory(tool.category)}
                      </span>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </CommandGroup>
        )}

        {!search && !selectedCategory && (
          <>
            <CommandGroup heading="Quick Links">
              {quickLinks.map((link) => (
                <CommandItem
                  key={link.path}
                  value={link.title}
                  onSelect={() => handleSelect(link.path)}
                  className="cursor-pointer"
                >
                  <link.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{link.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Documentation">
              {docPages.map((doc) => (
                <CommandItem
                  key={doc.path}
                  value={doc.title}
                  onSelect={() => handleSelect(doc.path)}
                  className="cursor-pointer"
                >
                  <doc.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{doc.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function GlobalSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
