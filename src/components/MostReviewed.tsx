import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardSkeletonGrid } from "@/components/ToolCardSkeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];
import { motion } from "framer-motion";

interface ToolWithReviewCount {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  website_url: string;
  logo_url: string | null;
  rating: number | null;
  popularity_score: number | null;
  has_api: boolean;
  review_count: number;
}

interface MostReviewedProps {
  categoryFilter?: string | null;
}

export function MostReviewed({ categoryFilter }: MostReviewedProps) {
  const [tools, setTools] = useState<ToolWithReviewCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMostReviewedTools();
  }, [categoryFilter]);

  const fetchMostReviewedTools = async () => {
    setLoading(true);
    try {
      // Get review counts per tool
      const { data: reviewCounts, error: reviewError } = await supabase
        .from("tool_ratings")
        .select("tool_id");

      if (reviewError) {
        console.error("Error fetching review counts:", reviewError);
        setLoading(false);
        return;
      }

      // Count reviews per tool
      const countMap: Record<string, number> = {};
      reviewCounts?.forEach((review) => {
        countMap[review.tool_id] = (countMap[review.tool_id] || 0) + 1;
      });

      // Get tool IDs sorted by review count
      const sortedToolIds = Object.entries(countMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 12)
        .map(([id]) => id);

      if (sortedToolIds.length === 0) {
        setTools([]);
        setLoading(false);
        return;
      }

      // Fetch tool details
      let query = supabase
        .from("ai_tools")
        .select("*")
        .in("id", sortedToolIds);

      if (categoryFilter) {
        query = query.eq("category", categoryFilter as ToolCategory);
      }

      const { data: toolsData, error: toolsError } = await query;

      if (toolsError) {
        console.error("Error fetching tools:", toolsError);
        setLoading(false);
        return;
      }

      // Combine and sort by review count
      const toolsWithCounts = toolsData
        ?.map((tool) => ({
          ...tool,
          review_count: countMap[tool.id] || 0,
        }))
        .sort((a, b) => b.review_count - a.review_count)
        .slice(0, 6);

      setTools(toolsWithCounts || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6 sm:mb-8"
      >
        <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Most Reviewed</h2>
      </motion.div>
      
      {loading ? (
        <ToolCardSkeletonGrid count={6} />
      ) : tools.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No reviewed tools found{categoryFilter ? " in this category" : ""}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="relative">
                <ToolCard tool={tool} />
                <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {tool.review_count} {tool.review_count === 1 ? "review" : "reviews"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-6 sm:mt-8">
        <Button asChild size="lg" variant="outline" className="glass">
          <Link to="/tools">Explore All Tools</Link>
        </Button>
      </div>
    </section>
  );
}
