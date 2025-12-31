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

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
            <Flame className="h-3 w-3 sm:h-4 sm:w-4" />
            Trending Now
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
            Discover What's <span className="text-primary">Hot</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">
            See the most popular AI tools based on views, bookmarks, and ratings from our community.
          </p>
        </motion.div>

        {/* Time Range Filter */}
        <div className="flex justify-center sm:justify-end mb-4 sm:mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] sm:w-[180px] glass">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 Hours</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="trending" className="space-y-6 sm:space-y-8">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-2xl mx-auto glass gap-1">
            <TabsTrigger value="trending" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Trending</span>
              <span className="xs:hidden">Hot</span>
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Most Saved</span>
              <span className="xs:hidden">Saved</span>
            </TabsTrigger>
            <TabsTrigger value="rated" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Top Rated</span>
              <span className="xs:hidden">Top</span>
            </TabsTrigger>
            <TabsTrigger value="rising" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Rising Stars</span>
              <span className="xs:hidden">New</span>
            </TabsTrigger>
          </TabsList>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-4 sm:space-y-6">
            <Card className="glass card-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  Trending This Week
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tools with the highest engagement based on views, bookmarks, and ratings
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {trendingTools.map((item, index) => (
                    <motion.div
                      key={item.tool_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.tool && (
                        <Card className="glass hover:border-primary/50 transition-all">
                          <CardContent className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              <Badge className={`${getRankBadge(index)} text-base sm:text-lg font-bold w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full flex-shrink-0 self-start sm:self-center`}>
                                {index + 1}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-base sm:text-lg truncate">{item.tool.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {item.tool.category.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                  {item.tool.description}
                                </p>
                                {/* Mobile Stats */}
                                <div className="flex items-center gap-4 mt-2 sm:hidden text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>{item.view_count}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Bookmark className="h-3 w-3" />
                                    <span>{item.bookmark_count}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    <span>{item.tool.rating}</span>
                                  </div>
                                </div>
                              </div>
                              {/* Desktop Stats */}
                              <div className="hidden md:flex items-center gap-4 lg:gap-6 text-sm text-muted-foreground">
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
                              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                                <div className="flex items-center gap-1 text-primary">
                                  <ArrowUp className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="font-bold text-sm sm:text-base">{Math.round(item.trending_score)}</span>
                                </div>
                                <Button asChild size="sm" className="text-xs sm:text-sm">
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Bookmark className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Most Bookmarked
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Tools that users save the most for later reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                {mostBookmarked.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mostBookmarked.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                    No bookmark data available for this time range
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Rated Tab */}
          <TabsContent value="rated">
            <Card className="glass card-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Top Rated Tools
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Highest-rated AI tools by our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  Rising Stars
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  New tools that are quickly gaining traction
                </CardDescription>
              </CardHeader>
              <CardContent>
                {risingStars.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {risingStars.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
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
