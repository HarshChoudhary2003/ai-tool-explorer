import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ExternalLink, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryBySlug, getAllCategories } from "@/data/categoryData";
import { useSEO } from "@/hooks/useSEO";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryInfo = slug ? getCategoryBySlug(slug) : undefined;

  useSEO({
    title: categoryInfo ? `${categoryInfo.name} AI Tools` : "Category",
    description: categoryInfo?.longDescription || "Explore AI tools in this category",
  });

  useEffect(() => {
    if (slug) {
      fetchTools();
    }
  }, [slug]);

  const fetchTools = async () => {
    if (!slug) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("category", slug as any)
      .order("popularity_score", { ascending: false });

    if (error) {
      console.error("Error fetching tools:", error);
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const topTools = useMemo(() => {
    return tools.filter((tool) => (tool.rating || 0) >= 4.3).slice(0, 6);
  }, [tools]);

  const allCategories = getAllCategories();

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 flex-1 text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Link to="/tools">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All Tools
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className={`relative py-16 sm:py-24 bg-gradient-to-br ${categoryInfo.color} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/tools"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Categories
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <CategoryIcon className="h-10 w-10 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {tools.length} Tools
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {categoryInfo.name}
            </h1>

            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed">
              {categoryInfo.longDescription}
            </p>

            <div className="flex flex-wrap gap-2">
              {categoryInfo.featuredTasks.map((task) => (
                <Badge
                  key={task}
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 capitalize"
                >
                  {task}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Common Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categoryInfo.useCases.map((useCase, index) => (
              <motion.div
                key={useCase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-4 rounded-xl text-center"
              >
                <span className="text-sm font-medium">{useCase}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Tools */}
      {topTools.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Top Rated {categoryInfo.name} Tools</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Tools */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">
            All {categoryInfo.name} Tools ({tools.length})
          </h2>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5) }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && tools.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                No tools found in this category yet
              </p>
              <Link to="/submit">
                <Button>Submit a Tool</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Browse Other Categories */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse Other Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {allCategories
              .filter((cat) => cat.slug !== slug)
              .slice(0, 12)
              .map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    className="glass p-4 rounded-xl text-center hover:bg-accent/50 transition-colors group"
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium line-clamp-1">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
