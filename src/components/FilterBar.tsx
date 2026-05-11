import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, X, SlidersHorizontal, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

interface FilterBarProps {
  totalCount: number;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "llm", label: "LLMs" },
  { value: "image_generation", label: "Image Generation" },
  { value: "voice", label: "Voice & Audio" },
  { value: "audio", label: "Audio & Music" },
  { value: "automation", label: "Automation" },
  { value: "no_code", label: "No-Code" },
  { value: "video", label: "Video" },
  { value: "productivity", label: "Productivity" },
  { value: "code_assistant", label: "Code Assistants" },
  { value: "data_analysis", label: "Data Analysis" },
];

const pricingOptions = [
  { value: "all", label: "All Pricing" },
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "enterprise", label: "Enterprise" },
];

const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "3", label: "3+ Stars" },
];

const sortOptions = [
  { value: "popularity", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "Name A-Z" },
  { value: "newest", label: "Newest First" },
];

export function FilterBar({ totalCount }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Detect when the bar becomes sticky to upgrade contrast and shadow
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { rootMargin: "-65px 0px 0px 0px", threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Keep local search input synced when URL changes (back/forward, reset)
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParams]);

  // Reset page=1 on any filter mutation
  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    setSearchParams(params);
  };

  // Debounced live search synced to URL
  useEffect(() => {
    const current = searchParams.get("search") || "";
    if (searchInput === current) return;
    const t = setTimeout(() => updateParam("search", searchInput.trim() || null), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleApiToggle = (checked: boolean) => updateParam("hasApi", checked ? "true" : null);

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const activeFilterKeys = Array.from(searchParams.keys()).filter(
    (key) => key !== "search" && key !== "page"
  );
  const activeFilterCount = activeFilterKeys.length + (searchParams.get("search") ? 1 : 0);

  const getFilterLabel = (key: string, value: string): string => {
    switch (key) {
      case "category":
        return categories.find((c) => c.value === value)?.label || value;
      case "pricing":
        return pricingOptions.find((p) => p.value === value)?.label || value;
      case "rating":
        return `${value}+ Stars`;
      case "sort":
        return sortOptions.find((s) => s.value === value)?.label || value;
      case "hasApi":
        return "Has API";
      default:
        return value;
    }
  };

  const FilterControls = ({ stacked = false }: { stacked?: boolean }) => (
    <div className={stacked ? "space-y-4" : "flex gap-2 flex-wrap lg:flex-nowrap"}>
      <Select
        value={searchParams.get("category") || "all"}
        onValueChange={(v) => updateParam("category", v)}
      >
        <SelectTrigger className={stacked ? "w-full" : "w-full lg:w-[170px]"}>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("pricing") || "all"}
        onValueChange={(v) => updateParam("pricing", v)}
      >
        <SelectTrigger className={stacked ? "w-full" : "w-full lg:w-[140px]"}>
          <SelectValue placeholder="Pricing" />
        </SelectTrigger>
        <SelectContent>
          {pricingOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("sort") || "popularity"}
        onValueChange={(v) => updateParam("sort", v === "popularity" ? null : v)}
      >
        <SelectTrigger className={stacked ? "w-full" : "w-full lg:w-[160px]"}>
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const AdvancedControls = ({ stacked = false }: { stacked?: boolean }) => (
    <div className={stacked ? "space-y-4" : "flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap"}>
      <Select
        value={searchParams.get("rating") || "all"}
        onValueChange={(v) => updateParam("rating", v)}
      >
        <SelectTrigger className={stacked ? "w-full" : "w-full sm:w-[150px]"}>
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          {ratingOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg w-full sm:w-auto">
        <Switch
          id="api-filter"
          checked={searchParams.get("hasApi") === "true"}
          onCheckedChange={handleApiToggle}
        />
        <Label htmlFor="api-filter" className="text-sm cursor-pointer">
          Has API Access
        </Label>
      </div>
    </div>
  );

  return (
    <>
      {/* Sentinel sits above the sticky bar; when it scrolls offscreen, bar is stuck */}
      <div ref={sentinelRef} aria-hidden="true" className="h-px -mt-px" />
      <div
        className={cn(
          "sticky top-16 z-30 mb-8 transition-all duration-300",
          isStuck && "pt-2"
        )}
      >
        <div
          className={cn(
            "rounded-2xl space-y-4 transition-all duration-300 border",
            "p-3 sm:p-5",
            isStuck
              ? "bg-background/85 backdrop-blur-xl border-border/70 shadow-elegant"
              : "glass border-border/50 shadow-card"
          )}
        >
        {/* Search row */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search AI tools..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-9"
              aria-label="Search tools"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mobile filter trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden relative shrink-0" aria-label="Open filters">
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:max-w-md flex flex-col p-0 gap-0"
            >
              <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                <SheetTitle className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      {activeFilterCount} active
                    </span>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <FilterControls stacked />
                <div className="border-t pt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                    Advanced
                  </p>
                  <AdvancedControls stacked />
                </div>
              </div>
              <SheetFooter className="px-6 py-4 border-t bg-background/95 backdrop-blur gap-2 flex-row shrink-0">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear
                </Button>
                <SheetClose asChild>
                  <Button className="flex-1">Show {totalCount} results</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop inline controls */}
        <div className="hidden lg:flex flex-col gap-4">
          <FilterControls />

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 -ml-2">
                <SlidersHorizontal className="h-4 w-4" />
                {showAdvanced ? "Hide" : "More"} filters
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <AdvancedControls />
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Results + active filter pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-border/40">
          <div className="flex items-center gap-2 flex-wrap pt-2">
            <span className="text-xs sm:text-sm font-semibold">
              <span className="text-foreground">{totalCount}</span>
              <span className="text-muted-foreground font-medium">
                {" "}
                {totalCount === 1 ? "tool" : "tools"}
              </span>
            </span>
            {activeFilterKeys.length > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                {activeFilterKeys.map((key) => (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="gap-1 text-[10px] sm:text-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15"
                  >
                    {getFilterLabel(key, searchParams.get(key) || "")}
                    <button
                      type="button"
                      onClick={() => updateParam(key, null)}
                      className="ml-0.5 hover:text-foreground"
                      aria-label={`Remove ${key} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </>
            )}
            {searchParams.get("search") && (
              <Badge
                variant="secondary"
                className="gap-1 text-[10px] sm:text-xs bg-primary/10 text-primary border border-primary/30"
              >
                "{searchParams.get("search")}"
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="ml-0.5 hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          {(activeFilterKeys.length > 0 || searchInput) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="pt-2">
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        </div>
      </div>
    </>
  );
}
