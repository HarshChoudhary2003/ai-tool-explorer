import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { FilterBar } from "@/components/FilterBar";
import { Loader2 } from "lucide-react";

export default function Tools() {
  const [searchParams] = useSearchParams();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTools, setFilteredTools] = useState<any[]>([]);

  const category = searchParams.get("category");
  const search = searchParams.get("search");

  useEffect(() => {
    fetchTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [tools, category, search]);

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

  const filterTools = () => {
    let filtered = [...tools];

    if (category) {
      filtered = filtered.filter((tool) => tool.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTools(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">AI Tools Directory</h1>
          <p className="text-muted-foreground text-lg">
            Explore {tools.length} cutting-edge AI tools across all categories
          </p>
        </div>

        <FilterBar totalCount={filteredTools.length} />

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
