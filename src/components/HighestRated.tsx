import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function HighestRated() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHighestRatedTools();
  }, []);

  const fetchHighestRatedTools = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .gte("rating", 4.0)
        .order("rating", { ascending: false })
        .limit(6);

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

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <Star className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 fill-yellow-500" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Highest Rated</h2>
        </div>
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (tools.length === 0) {
    return null;
  }

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
      
      <div className="text-center mt-6 sm:mt-8">
        <Button asChild size="lg" variant="outline" className="glass">
          <Link to="/tools?sort=rating">View All Top Rated</Link>
        </Button>
      </div>
    </section>
  );
}
