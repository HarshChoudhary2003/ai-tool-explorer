import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Star, Zap, DollarSign, Check, X } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ToolDetails() {
  const { id } = useParams();
  const [tool, setTool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchTool();
  }, [id]);

  const fetchTool = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching tool:", error);
    } else {
      setTool(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Tool Not Found</h1>
          <Button asChild>
            <Link to="/tools">Back to Tools</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatCategory = (cat: string) => {
    return cat.split("_").map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/tools">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass card-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-4xl mb-4">{tool.name}</CardTitle>
                    <div className="flex gap-2 flex-wrap mb-4">
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {formatCategory(tool.category)}
                      </Badge>
                      <Badge variant="outline">{tool.pricing}</Badge>
                      {tool.has_api && (
                        <Badge variant="outline" className="border-secondary/30">
                          <Zap className="h-3 w-3 mr-1" />
                          API Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary fill-primary" />
                    <span className="text-2xl font-bold">{tool.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground text-lg">{tool.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    What It Can Do
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.tasks?.map((task: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {task}
                      </Badge>
                    ))}
                  </div>
                </div>

                {tool.use_cases && tool.use_cases.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Use Cases</h3>
                      <ul className="space-y-2">
                        {tool.use_cases.map((useCase: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{useCase}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <Separator />

                <div className="grid md:grid-cols-2 gap-6">
                  {tool.pros && tool.pros.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-primary">Pros</h3>
                      <ul className="space-y-2">
                        {tool.pros.map((pro: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tool.cons && tool.cons.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3 text-destructive">Cons</h3>
                      <ul className="space-y-2">
                        {tool.cons.map((con: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="glass card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="mb-3 text-lg px-4 py-2">{tool.pricing}</Badge>
                {tool.pricing_details && (
                  <p className="text-muted-foreground">{tool.pricing_details}</p>
                )}
              </CardContent>
            </Card>

            {tool.has_api && tool.api_details && (
              <Card className="glass card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-secondary" />
                    API Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{tool.api_details}</p>
                </CardContent>
              </Card>
            )}

            <Card className="glass card-shadow">
              <CardHeader>
                <CardTitle>Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary mb-2">
                  {tool.popularity_score.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Button asChild className="w-full" size="lg">
              <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                Visit Website
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>

            <Button asChild variant="outline" className="w-full glass" size="lg">
              <Link to={`/compare?tools=${tool.id}`}>
                Compare with Others
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
