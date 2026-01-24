import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardSkeletonGrid } from "@/components/ToolCardSkeleton";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];
import { motion } from "framer-motion";

interface HighestRatedProps {
  categoryFilter?: string | null;
}

export function HighestRated({ categoryFilter }: HighestRatedProps) {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighestRatedTools();
  }, [categoryFilter]);

  const fetchHighestRatedTools = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("ai_tools")
        .select("*")
        .gte("rating", 4.0)
        .order("rating", { ascending: false })
        .limit(6);

      if (categoryFilter) {
        query = query.eq("category", categoryFilter as ToolCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching highest rated tools:", error);
      } else {
        setTools(data || []);
      }
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
        <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 fill-yellow-500" />
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Highest Rated</h2>
      </motion.div>
      
      {loading ? (
        <ToolCardSkeletonGrid count={6} />
      ) : tools.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No highly rated tools found{categoryFilter ? " in this category" : ""}
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
                <div className="absolute top-3 right-3 bg-yellow-500/90 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  {tool.rating?.toFixed(1)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-6 sm:mt-8">
        <Button asChild size="lg" variant="outline" className="glass">
          <Link to="/tools?sort=rating">View All Top Rated</Link>
        </Button>
      </div>
    </section>
  );
}
