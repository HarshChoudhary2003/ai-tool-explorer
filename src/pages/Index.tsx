import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, GitCompare, Zap, TrendingUp, MousePointer, Filter, Bot, ArrowRight, Image, Mic, Video, Code, PenTool, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Testimonials } from "@/components/Testimonials";
import { FAQSection } from "@/components/FAQSection";
import { motion } from "framer-motion";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface CategoryCount {
  category: string;
  count: number;
}

export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [trendingTools, setTrendingTools] = useState<any[]>([]);
  const [toolCount, setToolCount] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  
  const { count: animatedCount } = useAnimatedCounter(toolCount, 2000);

  useEffect(() => {
    fetchTrendingTools();
    fetchToolCount();
    fetchCategoryCounts();
  }, []);

  // Scroll to hash on navigation
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location.hash]);

  const fetchToolCount = async () => {
    const { count } = await supabase
      .from("ai_tools")
      .select("*", { count: "exact", head: true });

    if (count) setToolCount(count);
  };

  const fetchCategoryCounts = async () => {
    const { data } = await supabase
      .from("ai_tools")
      .select("category");

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((item) => {
        counts[item.category] = (counts[item.category] || 0) + 1;
      });
      
      const sortedCounts = Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      
      setCategoryCounts(sortedCounts);
    }
  };

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

  const categoryIcons: Record<string, any> = {
    llm: Sparkles,
    image_generation: Image,
    voice: Mic,
    automation: Zap,
    no_code: Code,
    video: Video,
    audio: Mic,
    productivity: BarChart3,
    code_assistant: Code,
    data_analysis: BarChart3,
    writing: PenTool,
  };

  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const categories = [
    { name: "LLMs", value: "llm", icon: Sparkles },
    { name: "Image Gen", value: "image_generation", icon: Image },
    { name: "Voice", value: "voice", icon: Mic },
    { name: "Automation", value: "automation", icon: Zap },
    { name: "No-Code", value: "no_code", icon: Code },
    { name: "Video", value: "video", icon: Video },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      title: "Browse & Search",
      description: "Explore our curated collection of 500+ AI tools. Filter by category, pricing, or search for specific features.",
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 glass border-primary/30 text-primary text-base sm:text-lg px-4 py-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="font-bold tabular-nums">
                  {animatedCount > 0 ? animatedCount : "500"}+
                </span>
                <span className="ml-1">AI Tools Curated</span>
              </Badge>
            </motion.div>
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

      {/* Category Breakdown Stats */}
      {categoryCounts.length > 0 && (
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">Tools by Category</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Explore our collection across {categoryCounts.length}+ categories
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {categoryCounts.map((item, index) => {
              const IconComponent = categoryIcons[item.category] || Sparkles;
              return (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to={`/tools?category=${item.category}`}
                    className="block glass p-4 sm:p-6 rounded-xl text-center hover:border-primary/50 transition-all card-shadow group"
                  >
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                      {item.count}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {formatCategory(item.category)}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

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
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 glass border-secondary/30 text-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Simple Process
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Finding the right AI tool has never been easier. Follow these simple steps
            to discover the perfect solution for your needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {howItWorksSteps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass p-6 sm:p-8 rounded-xl space-y-4 card-shadow relative group cursor-pointer"
            >
              <motion.div
                className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.15 + 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {item.step}
              </motion.div>
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
              {index < howItWorksSteps.length - 1 && (
                <motion.div
                  className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.4, duration: 0.3 }}
                >
                  <ArrowRight className="h-6 w-6 text-primary/50" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-10 sm:mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button asChild size="lg" className="px-8">
            <Link to="/recommend">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Exploring
            </Link>
          </Button>
        </motion.div>
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

      {/* Testimonials */}
      <Testimonials />

      {/* FAQ */}
      <FAQSection />

      <Footer />
    </div>
  );
}
