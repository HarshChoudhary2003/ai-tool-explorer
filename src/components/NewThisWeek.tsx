import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardSkeletonGrid } from "@/components/ToolCardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];
import { motion } from "framer-motion";

interface NewThisWeekProps {
  categoryFilter?: string | null;
}

export function NewThisWeek({ categoryFilter }: NewThisWeekProps) {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewTools();
  }, [categoryFilter]);

  const fetchNewTools = async () => {
    setLoading(true);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let query = supabase
      .from("ai_tools")
      .select("*")
      .gte("created_at", oneWeekAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(6);

    if (categoryFilter) {
      query = query.eq("category", categoryFilter as ToolCategory);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching new tools:", error);
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">New This Week</h2>
            <p className="text-muted-foreground text-sm">
              Fresh AI tools added in the last 7 days
            </p>
          </div>
        </div>
        <Button asChild variant="outline" className="glass w-fit">
          <Link to="/tools?sort=newest">
            View All New Tools
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </motion.div>

      {loading ? (
        <ToolCardSkeletonGrid count={6} />
      ) : tools.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No new tools added this week{categoryFilter ? " in this category" : ""}
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
              className="relative"
            >
              <Badge className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white border-0">
                New
              </Badge>
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
