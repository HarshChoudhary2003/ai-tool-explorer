import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: tools = [] } = useQuery({
    queryKey: ["global-search-tools", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      
      const { data, error } = await supabase
        .from("ai_tools")
        .select("id, name, category, description")
        .ilike("name", `%${search}%`)
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: search.length > 1,
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

  const handleSelect = (path: string) => {
    onOpenChange(false);
    setSearch("");
    navigate(path);
  };

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tools, documentation..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {tools.length > 0 && (
          <CommandGroup heading="Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.id}
                value={tool.name}
                onSelect={() => handleSelect(`/tools/${tool.id}`)}
                className="cursor-pointer"
              >
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span>{tool.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatCategory(tool.category)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!search && (
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
