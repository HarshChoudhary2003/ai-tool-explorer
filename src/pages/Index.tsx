import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, GitCompare, Zap, TrendingUp, MousePointer, Filter, Bot, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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

  const howItWorksSteps = [
    {
      step: "01",
      title: "Browse & Search",
      description: "Explore our curated collection of 200+ AI tools. Filter by category, pricing, or search for specific features.",
      icon: Search,
    },
    {
      step: "02",
      title: "Compare Tools",
      description: "Select up to 3 tools to compare side-by-side. See features, pricing, pros & cons at a glance.",
      icon: GitCompare,
    },
    {
      step: "03",
      title: "Get AI Recommendations",
      description: "Tell us your needs and budget. Our AI will suggest the best tools tailored specifically for you.",
      icon: Bot,
    },
    {
      step: "04",
      title: "Make Your Choice",
      description: "With all the information at hand, confidently choose the perfect AI tool for your project.",
      icon: MousePointer,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <Badge className="mb-4 glass border-primary/30 text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              200+ AI Tools Curated
            </Badge>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight">
              Discover the{" "}
              <span className="gradient-text">Best AI Tools</span>{" "}
              for Your Needs
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Explore, compare, and find the perfect AI tools for your projects. 
              From LLMs to image generators, we've got you covered.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 px-4">
              <Input
                placeholder="Search AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="h-12 sm:h-14 text-base sm:text-lg glass"
              />
              <Button onClick={handleSearch} size="lg" className="h-12 sm:h-14 px-6 sm:px-8">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 sm:gap-4 justify-center flex-wrap px-4">
              <Button asChild variant="outline" className="glass text-sm sm:text-base">
                <Link to="/tools">
                  Browse All Tools
                </Link>
              </Button>
              <Button asChild variant="outline" className="glass text-sm sm:text-base">
                <Link to="/compare">
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare Tools
                </Link>
              </Button>
              <Button asChild variant="outline" className="glass text-sm sm:text-base">
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
      <section className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.value}
              asChild
              variant="outline"
              size="sm"
              className="glass hover:scale-105 transition-all text-xs sm:text-sm"
            >
              <Link to={`/tools?category=${category.value}`}>
                <category.icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {category.name}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      {/* Trending Tools */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Trending AI Tools</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {trendingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
        <div className="text-center mt-6 sm:mt-8">
          <Button asChild size="lg" variant="outline" className="glass">
            <Link to="/tools">View All Tools</Link>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-12">
          <Badge className="mb-4 glass border-secondary/30 text-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Simple Process
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Finding the right AI tool has never been easier. Follow these simple steps 
            to discover the perfect solution for your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {howItWorksSteps.map((item, index) => (
            <div 
              key={item.step} 
              className="glass p-6 sm:p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow relative group"
            >
              <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {item.step}
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
              {index < howItWorksSteps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary/50" />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <Button asChild size="lg" className="px-8">
            <Link to="/recommend">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Exploring
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="glass p-6 sm:p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Advanced Search</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Filter by category, pricing, API availability, and more to find exactly what you need.
            </p>
          </div>

          <div className="glass p-6 sm:p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow">
            <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center">
              <GitCompare className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Side-by-Side Compare</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Compare up to 3 AI tools at once to make informed decisions for your projects.
            </p>
          </div>

          <div className="glass p-6 sm:p-8 rounded-xl space-y-4 hover:scale-105 transition-all card-shadow sm:col-span-2 lg:col-span-1">
            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">AI Recommendations</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Get personalized tool suggestions based on your specific needs and budget.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
