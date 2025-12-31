import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FilterBarProps {
  totalCount: number;
}

export function FilterBar({ totalCount }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "llm", label: "LLMs" },
    { value: "image_generation", label: "Image Generation" },
    { value: "voice", label: "Voice & Audio" },
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

  const handleSearch = () => {
    if (searchInput.trim()) {
      searchParams.set("search", searchInput.trim());
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    setSearchParams(searchParams);
  };

  const handlePricingChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("pricing");
    } else {
      searchParams.set("pricing", value);
    }
    setSearchParams(searchParams);
  };

  const handleRatingChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("rating");
    } else {
      searchParams.set("rating", value);
    }
    setSearchParams(searchParams);
  };

  const handleSortChange = (value: string) => {
    if (value === "popularity") {
      searchParams.delete("sort");
    } else {
      searchParams.set("sort", value);
    }
    setSearchParams(searchParams);
  };

  const handleApiToggle = (checked: boolean) => {
    if (checked) {
      searchParams.set("hasApi", "true");
    } else {
      searchParams.delete("hasApi");
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const activeFilters = Array.from(searchParams.keys()).filter(
    (key) => key !== "search"
  );

  const getFilterLabel = (key: string, value: string): string => {
    switch (key) {
      case "category":
        return categories.find(c => c.value === value)?.label || value;
      case "pricing":
        return pricingOptions.find(p => p.value === value)?.label || value;
      case "rating":
        return `${value}+ Stars`;
      case "sort":
        return sortOptions.find(s => s.value === value)?.label || value;
      case "hasApi":
        return "Has API";
      default:
        return value;
    }
  };

  return (
    <div className="glass p-4 sm:p-6 rounded-xl mb-8 space-y-4">
      {/* Main search and filters row */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search AI tools by name, description, or task..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap lg:flex-nowrap">
          <Select
            value={searchParams.get("category") || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-full lg:w-[180px]">
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
            onValueChange={handlePricingChange}
          >
            <SelectTrigger className="w-full lg:w-[150px]">
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
        </div>
      </div>

      {/* Advanced filters toggle */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? "Hide" : "Show"} Advanced Filters
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            {/* Rating filter */}
            <Select
              value={searchParams.get("rating") || "all"}
              onValueChange={handleRatingChange}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
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

            {/* Sort by */}
            <Select
              value={searchParams.get("sort") || "popularity"}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
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

            {/* API availability toggle */}
            <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg">
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
        </CollapsibleContent>
      </Collapsible>

      {/* Results count and active filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">
            {totalCount} tools found
          </span>
          {activeFilters.length > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="gap-1">
                  {getFilterLabel(filter, searchParams.get(filter) || "")}
                </Badge>
              ))}
            </>
          )}
        </div>
        {(activeFilters.length > 0 || searchInput) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}