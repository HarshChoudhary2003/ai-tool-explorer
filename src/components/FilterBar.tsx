import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  totalCount: number;
}

export function FilterBar({ totalCount }: FilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

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

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const activeFilters = Array.from(searchParams.keys()).filter(
    (key) => key !== "search"
  );

  return (
    <div className="glass p-6 rounded-xl mb-8 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search AI tools..."
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
            <SelectTrigger className="w-full lg:w-[200px]">
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
            <SelectTrigger className="w-full lg:w-[200px]">
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

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {totalCount} tools found
          </span>
          {activeFilters.length > 0 && (
            <>
              <span className="text-muted-foreground">•</span>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary">
                  {filter}: {searchParams.get(filter)}
                </Badge>
              ))}
            </>
          )}
        </div>
        {(activeFilters.length > 0 || searchInput) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
