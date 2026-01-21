import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  rating: number;
  popularity_score: number;
  has_api: boolean;
  website_url: string;
  tasks: string[];
  created_at: string;
}

export function FeaturedTools() {
  const [featuredTools, setFeaturedTools] = useState<FeaturedTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTools();
  }, []);

  const fetchFeaturedTools = async () => {
    try {
      // Get tools added in the last 30 days with high ratings, ordered by popularity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from("ai_tools")
        .select("*")
        .gte("rating", 4.3)
        .gte("popularity_score", 30000)
        .order("popularity_score", { ascending: false })
        .limit(6);

      if (error) throw error;
      if (data) setFeaturedTools(data);
    } catch (error) {
      console.error("Error fetching featured tools:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || featuredTools.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-10"
      >
        <Badge className="mb-4 glass border-primary/30 text-primary">
          <Star className="h-4 w-4 mr-2 fill-primary" />
          Featured Collection
        </Badge>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
          Featured AI Tools
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Discover the most popular and highly-rated AI tools curated by our team
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {featuredTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div className="relative">
              {index < 3 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Top Pick
                  </Badge>
                </div>
              )}
              <ToolCard tool={tool} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-8"
      >
        <Button asChild size="lg" className="group">
          <Link to="/tools">
            Explore All Tools
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
