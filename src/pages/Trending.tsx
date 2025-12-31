import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolCard } from "@/components/ToolCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TrendingUp, Flame, Star, Bookmark, Eye, ArrowUp, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface TrendingTool {
  tool_id: string;
  tool_name: string;
  view_count: number;
  bookmark_count: number;
  rating_count: number;
  trending_score: number;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  pricing: string;
  rating: number;
  website_url: string;
  logo_url?: string;
  has_api?: boolean;
  popularity_score?: number;
}

export default function Trending() {
  const [trendingTools, setTrendingTools] = useState<(TrendingTool & { tool?: Tool })[]>([]);
  const [mostBookmarked, setMostBookmarked] = useState<Tool[]>([]);
  const [topRated, setTopRated] = useState<Tool[]>([]);
  const [risingStars, setRisingStars] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    fetchTrendingData();
  }, [timeRange]);

  const fetchTrendingData = async () => {
    setLoading(true);

    // Fetch trending tools using database function
    const { data: trendingData, error: trendingError } = await supabase
      .rpc("get_trending_tools", { 
        days_back: parseInt(timeRange), 
        limit_count: 10 
      });

    if (trendingError) {
      console.error("Error fetching trending:", trendingError);
    }

    // Fetch full tool data for trending tools
    if (trendingData && trendingData.length > 0) {
      const toolIds = trendingData.map((t: TrendingTool) => t.tool_id);
      const { data: toolsData } = await supabase
        .from("ai_tools")
        .select("*")
        .in("id", toolIds);

      const enrichedTrending = trendingData.map((t: TrendingTool) => ({
        ...t,
        tool: toolsData?.find((tool: Tool) => tool.id === t.tool_id),
      }));
      setTrendingTools(enrichedTrending);
    } else {
      // Fallback: show top tools by rating if no trending data
      const { data: fallbackData } = await supabase
        .from("ai_tools")
        .select("*")
        .order("rating", { ascending: false })
        .limit(10);

      if (fallbackData) {
        setTrendingTools(fallbackData.map((tool: Tool) => ({
          tool_id: tool.id,
          tool_name: tool.name,
          view_count: 0,
          bookmark_count: 0,
          rating_count: 0,
          trending_score: tool.rating * 10,
          tool,
        })));
      }
    }

    // Fetch most bookmarked (by total bookmarks count)
    const { data: bookmarkCounts } = await supabase
      .from("bookmarks")
      .select("tool_id")
      .gte("created_at", new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString());

    if (bookmarkCounts && bookmarkCounts.length > 0) {
      const toolBookmarks: Record<string, number> = {};
      bookmarkCounts.forEach((b: { tool_id: string }) => {
        toolBookmarks[b.tool_id] = (toolBookmarks[b.tool_id] || 0) + 1;
      });

      const sortedToolIds = Object.entries(toolBookmarks)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([id]) => id);

      if (sortedToolIds.length > 0) {
        const { data: bookmarkedToolsData } = await supabase
          .from("ai_tools")
          .select("*")
          .in("id", sortedToolIds);

        if (bookmarkedToolsData) {
          // Sort by bookmark count
          setMostBookmarked(
            sortedToolIds
              .map(id => bookmarkedToolsData.find((t: Tool) => t.id === id))
              .filter(Boolean) as Tool[]
          );
        }
      }
    }

    // Fetch top rated tools
    const { data: topRatedData } = await supabase
      .from("ai_tools")
      .select("*")
      .order("rating", { ascending: false })
      .limit(6);

    if (topRatedData) setTopRated(topRatedData);

    // Fetch rising stars (new tools with high engagement)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: newToolsData } = await supabase
      .from("ai_tools")
      .select("*")
      .gte("created_at", oneWeekAgo)
      .order("rating", { ascending: false })
      .limit(6);

    if (newToolsData) setRisingStars(newToolsData);

    setLoading(false);
  };

  const getRankBadge = (rank: number) => {
    const colors = [
      "bg-yellow-500 text-yellow-950",
      "bg-gray-400 text-gray-950",
      "bg-amber-600 text-amber-950",
    ];
    return colors[rank] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Flame className="h-4 w-4" />
            Trending Now
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover What's <span className="text-primary">Hot</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See the most popular AI tools based on views, bookmarks, and ratings from our community.
          </p>
        </motion.div>

        {/* Time Range Filter */}
        <div className="flex justify-end mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] glass">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="trending" className="space-y-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-2xl mx-auto glass">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Most Saved
            </TabsTrigger>
            <TabsTrigger value="rated" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Top Rated
            </TabsTrigger>
            <TabsTrigger value="rising" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Rising Stars
            </TabsTrigger>
          </TabsList>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <Card className="glass card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Trending This Week
                </CardTitle>
                <CardDescription>
                  Tools with the highest engagement based on views, bookmarks, and ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trendingTools.map((item, index) => (
                    <motion.div
                      key={item.tool_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.tool && (
                        <Card className="glass hover:border-primary/50 transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Badge className={`${getRankBadge(index)} text-lg font-bold w-10 h-10 flex items-center justify-center rounded-full`}>
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg">{item.tool.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {item.tool.category.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {item.tool.description}
                                </p>
                              </div>
                              <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{item.view_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Bookmark className="h-4 w-4" />
                                  <span>{item.bookmark_count}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>{item.tool.rating}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-primary">
                                  <ArrowUp className="h-4 w-4" />
                                  <span className="font-bold">{Math.round(item.trending_score)}</span>
                                </div>
                                <Button asChild size="sm">
                                  <a href={`/tools/${item.tool_id}`}>View</a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Most Bookmarked Tab */}
          <TabsContent value="bookmarked">
            <Card className="glass card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  Most Bookmarked
                </CardTitle>
                <CardDescription>
                  Tools that users save the most for later reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mostBookmarked.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mostBookmarked.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No bookmark data available for this time range
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Rated Tab */}
          <TabsContent value="rated">
            <Card className="glass card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Top Rated Tools
                </CardTitle>
                <CardDescription>
                  Highest-rated AI tools by our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topRated.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rising Stars Tab */}
          <TabsContent value="rising">
            <Card className="glass card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  Rising Stars
                </CardTitle>
                <CardDescription>
                  New tools that are quickly gaining traction
                </CardDescription>
              </CardHeader>
              <CardContent>
                {risingStars.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {risingStars.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No new tools added this week
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
