import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ExternalLink, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Recommend() {
  const [task, setTask] = useState("");
  const [budget, setBudget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

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
      }
    } catch (error: any) {
      console.error("Recommendation error:", error);
      toast.error(error.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const formatCategory = (cat: string) => {
    return cat.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <Badge className="mb-4 glass border-primary/30 text-primary">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2 sm:mb-4">
              Get Personalized Tool Recommendations
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Tell us what you need, and our AI will suggest the best tools for you
            </p>
          </div>

          <Card className="glass card-shadow mb-8">
            <CardHeader>
              <CardTitle>What are you trying to achieve?</CardTitle>
              <CardDescription>
                Provide details about your project and requirements
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
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free only</SelectItem>
                        <SelectItem value="under_20">Under $20/month</SelectItem>
                        <SelectItem value="under_50">Under $50/month</SelectItem>
                        <SelectItem value="under_100">Under $100/month</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Special Requirements</Label>
                    <Input
                      id="requirements"
                      placeholder="E.g., API access required"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Get Recommendations
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {recommendations.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Top Recommendations</h2>
                <p className="text-muted-foreground">
                  Based on your requirements, here are the best tools for you
                </p>
              </div>

              {recommendations.map((rec: any, index: number) => (
                <Card key={rec.tool.id} className="glass card-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-primary/20 text-primary text-lg px-4 py-1">
                            #{index + 1}
                          </Badge>
                          <CardTitle className="text-2xl">{rec.tool.name}</CardTitle>
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
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold">{rec.tool.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {rec.tool.popularity_score.toLocaleString()} users
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Why This Tool?
                      </h4>
                      <p className="text-muted-foreground">{rec.reasoning}</p>
                    </div>

                    {rec.tool.pricing_details && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-secondary" />
                          Pricing
                        </h4>
                        <p className="text-muted-foreground">{rec.tool.pricing_details}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button asChild className="flex-1">
                        <Link to={`/tools/${rec.tool.id}`}>View Details</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <a href={rec.tool.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Website
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
