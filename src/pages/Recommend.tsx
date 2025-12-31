import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2, ExternalLink, TrendingUp, DollarSign, Check, X, ArrowRight, Lightbulb, RefreshCw, Bookmark, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useBookmarks } from "@/hooks/useBookmarks";
import { motion, AnimatePresence } from "framer-motion";

const TASK_EXAMPLES = [
  "I need to generate blog posts and social media content for my marketing campaign",
  "Create professional product images for my e-commerce store",
  "Build a chatbot for customer support on my website",
  "Transcribe and summarize long video meetings",
  "Generate code documentation and explain complex algorithms",
];

export default function Recommend() {
  const [task, setTask] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) {
      toast.error("Please describe your task");
      return;
    }

    setLoading(true);
    setRecommendations([]);

    try {
      const { data, error } = await supabase.functions.invoke("recommend-tools", {
        body: { task, budget, requirements },
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        // Add to search history
        setSearchHistory(prev => {
          const updated = [task, ...prev.filter(t => t !== task)].slice(0, 5);
          return updated;
        });
      }
    } catch (error: any) {
      console.error("Recommendation error:", error);
      toast.error(error.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setTask(example);
  };

  const handleHistoryClick = (query: string) => {
    setTask(query);
  };

  const formatCategory = (cat: string) => {
    return cat.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 75) return "text-primary";
    if (score >= 60) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <Badge className="mb-4 glass border-primary/30 text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Recommendations
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2 sm:mb-4">
              Find Your Perfect AI Tool
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
              Describe your task and let our AI analyze 200+ tools to find the best matches for your needs
            </p>
          </motion.div>

          <Card className="glass card-shadow mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                What are you trying to achieve?
              </CardTitle>
              <CardDescription>
                Be specific about your project, requirements, and constraints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="task">Task Description *</Label>
                  <Textarea
                    id="task"
                    placeholder="E.g., I need to generate blog posts and social media content for my marketing campaign"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    rows={4}
                    required
                    className="resize-none"
                  />
                  
                  {/* Example prompts */}
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Try an example:</p>
                    <div className="flex flex-wrap gap-2">
                      {TASK_EXAMPLES.slice(0, 3).map((example, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1.5 px-3"
                          onClick={() => handleExampleClick(example)}
                        >
                          {example.slice(0, 40)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free only</SelectItem>
                        <SelectItem value="under_20">Under $20/month</SelectItem>
                        <SelectItem value="under_50">Under $50/month</SelectItem>
                        <SelectItem value="under_100">Under $100/month</SelectItem>
                        <SelectItem value="flexible">Flexible / Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Special Requirements</Label>
                    <Input
                      id="requirements"
                      placeholder="E.g., API access, privacy focus, offline use"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                    />
                  </div>
                </div>

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Recent searches:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((query, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto py-1 px-2 text-muted-foreground hover:text-foreground"
                          onClick={() => handleHistoryClick(query)}
                        >
                          {query.slice(0, 30)}...
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing 200+ AI Tools...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Loading Animation */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="text-lg font-medium mb-2">Analyzing your requirements...</p>
                <p className="text-muted-foreground text-sm">Our AI is comparing features across 200+ tools</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {recommendations.length > 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">Top Recommendations</h2>
                  <p className="text-muted-foreground">
                    Based on your requirements, here are the best tools for you
                  </p>
                </div>

                {recommendations.map((rec: any, index: number) => (
                  <motion.div
                    key={rec.tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="glass card-shadow overflow-hidden">
                      {/* Match Score Bar */}
                      <div className="h-1 bg-muted">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${rec.match_score || 85}%` }}
                        />
                      </div>
                      
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <Badge className="bg-primary/20 text-primary text-lg px-4 py-1">
                                #{index + 1}
                              </Badge>
                              <CardTitle className="text-xl sm:text-2xl">{rec.tool.name}</CardTitle>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleBookmark(rec.tool.id)}
                              >
                                <Bookmark 
                                  className={`h-4 w-4 ${isBookmarked(rec.tool.id) ? 'fill-primary text-primary' : ''}`} 
                                />
                              </Button>
                            </div>
                            <div className="flex gap-2 flex-wrap mb-3">
                              <Badge variant="outline">{formatCategory(rec.tool.category)}</Badge>
                              <Badge variant="outline">{rec.tool.pricing}</Badge>
                              {rec.tool.has_api && (
                                <Badge variant="outline" className="border-secondary/30">
                                  API Available
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-base">
                              {rec.tool.description}
                            </CardDescription>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-center">
                              <div className={`text-2xl sm:text-3xl font-bold ${getMatchScoreColor(rec.match_score || 85)}`}>
                                {rec.match_score || 85}%
                              </div>
                              <span className="text-xs text-muted-foreground">Match</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              <span className="font-medium">{rec.tool.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* AI Reasoning */}
                        <div className="bg-primary/5 rounded-lg p-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Why This Tool?
                          </h4>
                          <p className="text-muted-foreground">{rec.reasoning}</p>
                        </div>

                        {/* Pros and Cons */}
                        {(rec.pros?.length > 0 || rec.cons?.length > 0) && (
                          <div className="grid sm:grid-cols-2 gap-4">
                            {rec.pros?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Advantages
                                </h4>
                                <ul className="space-y-1">
                                  {rec.pros.map((pro: string, idx: number) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <Check className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {rec.cons?.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  Considerations
                                </h4>
                                <ul className="space-y-1">
                                  {rec.cons.map((con: string, idx: number) => (
                                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <X className="h-3 w-3 text-orange-500 mt-1 shrink-0" />
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pricing Details */}
                        {rec.tool.pricing_details && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-secondary" />
                              Pricing Details
                            </h4>
                            <p className="text-muted-foreground text-sm">{rec.tool.pricing_details}</p>
                          </div>
                        )}

                        {/* Alternatives */}
                        {rec.alternatives?.length > 0 && (
                          <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2 text-sm text-muted-foreground">
                              Also Consider:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {rec.alternatives.map((alt: any) => (
                                <Link 
                                  key={alt.id} 
                                  to={`/tools/${alt.id}`}
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  {alt.name}
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Button asChild className="flex-1">
                            <Link to={`/tools/${rec.tool.id}`}>
                              View Full Details
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="flex-1">
                            <a href={rec.tool.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Visit Website
                            </a>
                          </Button>
                          {recommendations.length >= 2 && (
                            <Button asChild variant="secondary" className="flex-1">
                              <Link to={`/compare?tools=${recommendations.map(r => r.tool.id).join(',')}`}>
                                <Scale className="h-4 w-4 mr-2" />
                                Compare All
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Try Again */}
                <div className="text-center pt-6">
                  <p className="text-muted-foreground mb-4">Not what you're looking for?</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setRecommendations([]);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try a Different Query
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
}
