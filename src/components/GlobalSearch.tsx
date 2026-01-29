import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
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

  const { data: tools = [] } = useQuery({
    queryKey: ["global-search-tools", search, selectedCategory],
    queryFn: async () => {
      if (!search.trim() && !selectedCategory) return [];
      
      let query = supabase
        .from("ai_tools")
        .select("id, name, category, description");

      if (search.trim()) {
        query = query.ilike("name", `%${search}%`);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query.limit(8);

      if (error) throw error;
      return data || [];
    },
    enabled: search.length > 1 || !!selectedCategory,
  });

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
        {tools.length > 0 && (
          <CommandGroup heading="Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.id}
                value={tool.name}
                onSelect={() => handleSelect(`/tools/${tool.id}`, search)}
                className="cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <div className="flex flex-col flex-1">
                  <span>{tool.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCategory(tool.category)}
                  </span>
                </div>
              </CommandItem>
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
