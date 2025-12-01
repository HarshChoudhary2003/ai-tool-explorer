import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, GitCompare, Zap, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTools, setTrendingTools] = useState<any[]>([]);

  useEffect(() => {
    fetchTrendingTools();
  }, []);

  const fetchTrendingTools = async () => {
    const { data } = await supabase
      .from("ai_tools")
      .select("*")
      .order("popularity_score", { ascending: false })
      .limit(6);

    if (data) setTrendingTools(data);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/tools?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/tools");
    }
  };

  const categories = [
    { name: "LLMs", value: "llm", icon: Sparkles },
    { name: "Image Gen", value: "image_generation", icon: Sparkles },
    { name: "Voice", value: "voice", icon: Zap },
    { name: "Automation", value: "automation", icon: Zap },
    { name: "No-Code", value: "no_code", icon: Sparkles },
    { name: "Video", value: "video", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="mb-4 glass border-primary/30 text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              30+ AI Tools Curated
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Discover the{" "}
              <span className="gradient-text">Best AI Tools</span>{" "}
              for Your Needs
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore, compare, and find the perfect AI tools for your projects. 
              From LLMs to image generators, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto flex gap-2">
              <Input
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-14 text-lg glass"
              />
              <Button onClick={handleSearch} size="lg" className="h-14 px-8">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild variant="outline" className="glass">
                <Link to="/tools">
                  Browse All Tools
                </Link>
              </Button>
              <Button asChild variant="outline" className="glass">
                <Link to="/compare">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Tools
                </Link>
              </Button>
              <Button asChild variant="outline" className="glass">
                <Link to="/recommend">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Recommendation
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex gap-3 justify-center flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.value}
              asChild
              variant="outline"
              className="glass hover:scale-105 transition-all"
            >
              <Link to={`/tools?category=${category.value}`}>
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* Trending Tools */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="h-8 w-8 text-primary" />
          <h2 className="text-4xl font-bold">Trending AI Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild size="lg" variant="outline" className="glass">
            <Link to="/tools">View All Tools</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold">Advanced Search</h3>
            <p className="text-muted-foreground">
              Filter by category, pricing, API availability, and more to find exactly what you need.
            </p>
          </div>

          <div className="glass p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow">
            <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center">
              <GitCompare className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold">Side-by-Side Compare</h3>
            <p className="text-muted-foreground">
              Compare up to 3 AI tools at once to make informed decisions for your projects.
            </p>
          </div>

          <div className="glass p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow">
            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-2xl font-bold">AI Recommendations</h3>
            <p className="text-muted-foreground">
              Get personalized tool suggestions based on your specific needs and budget.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
