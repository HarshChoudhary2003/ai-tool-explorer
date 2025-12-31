import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { FilterBar } from "@/components/FilterBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

export default function Tools() {
  const [searchParams] = useSearchParams();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const pricing = searchParams.get("pricing");
  const rating = searchParams.get("rating");
  const hasApi = searchParams.get("hasApi");
  const sort = searchParams.get("sort");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .order("popularity_score", { ascending: false });

    if (error) {
      console.error("Error fetching tools:", error);
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Category filter
    if (category) {
      filtered = filtered.filter((tool) => tool.category === category);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          tool.tasks?.some((task: string) => task.toLowerCase().includes(searchLower))
      );
    }

    // Pricing filter
    if (pricing) {
      filtered = filtered.filter((tool) => tool.pricing === pricing);
    }

    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating);
      filtered = filtered.filter((tool) => (tool.rating || 0) >= minRating);
    }

    // API availability filter
    if (hasApi === "true") {
      filtered = filtered.filter((tool) => tool.has_api === true);
    }

    // Sorting
    switch (sort) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "popularity":
      default:
        filtered.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
    }

    return filtered;
  }, [tools, category, search, pricing, rating, hasApi, sort]);

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2 sm:mb-4">AI Tools Directory</h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Explore {tools.length} cutting-edge AI tools across all categories
          </p>
        </div>

        <FilterBar totalCount={filteredTools.length} />

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {!loading && filteredTools.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No tools found matching your criteria</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
