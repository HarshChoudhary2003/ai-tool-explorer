import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, ExternalLink, Check, Minus } from "lucide-react";
import { Link } from "react-router-dom";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [allTools, setAllTools] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTools();
  }, []);

  useEffect(() => {
    const toolIds = searchParams.get("tools")?.split(",") || [];
    if (toolIds.length > 0 && allTools.length > 0) {
      const tools = allTools.filter((t) => toolIds.includes(t.id));
      setSelectedTools(tools);
    }
  }, [searchParams, allTools]);

  const fetchAllTools = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ai_tools")
      .select("*")
      .order("name");

    if (data) setAllTools(data);
    setLoading(false);
  };

  const addTool = (toolId: string) => {
    if (selectedTools.length >= 3) return;
    const tool = allTools.find((t) => t.id === toolId);
    if (tool && !selectedTools.find((t) => t.id === toolId)) {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const removeTool = (toolId: string) => {
    setSelectedTools(selectedTools.filter((t) => t.id !== toolId));
  };

  const comparisonRows: Array<{ label: string; key: string; format?: (val: any) => string }> = [
    { label: "Category", key: "category", format: (val: string) => val.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") },
    { label: "Rating", key: "rating" },
    { label: "Pricing", key: "pricing" },
    { label: "Pricing Details", key: "pricing_details" },
    { label: "API Available", key: "has_api", format: (val: boolean) => val ? "Yes" : "No" },
    { label: "API Details", key: "api_details" },
    { label: "Popularity", key: "popularity_score", format: (val: number) => val.toLocaleString() },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Compare AI Tools</h1>
          <p className="text-muted-foreground text-lg">
            Select up to 3 tools to compare their features side-by-side
          </p>
        </div>

        {/* Tool Selection */}
        <Card className="glass card-shadow mb-8">
          <CardHeader>
            <CardTitle>Selected Tools ({selectedTools.length}/3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  {selectedTools[index] ? (
                    <div className="glass p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{selectedTools[index].name}</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeTool(selectedTools[index].id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge>{selectedTools[index].category}</Badge>
                    </div>
                  ) : (
                    <Select onValueChange={addTool}>
                      <SelectTrigger className="h-20 border-dashed border-2">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          <SelectValue placeholder="Add tool" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {allTools
                          .filter((t) => !selectedTools.find((st) => st.id === t.id))
                          .map((tool) => (
                            <SelectItem key={tool.id} value={tool.id}>
                              {tool.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedTools.length >= 2 && (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="glass card-shadow overflow-hidden">
              <div className="grid grid-cols-4 divide-x divide-border">
                <div className="p-6 bg-muted/20">
                  <h3 className="font-semibold text-lg">Tool</h3>
                </div>
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="p-6">
                    <Link to={`/tools/${tool.id}`} className="hover:text-primary transition-colors">
                      <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                    </Link>
                    <Button asChild size="sm" variant="outline" className="mt-2">
                      <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Visit
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Comparison Rows */}
            {comparisonRows.map((row) => (
              <Card key={row.key} className="glass card-shadow overflow-hidden">
                <div className="grid grid-cols-4 divide-x divide-border">
                  <div className="p-6 bg-muted/20 flex items-center">
                    <h4 className="font-semibold">{row.label}</h4>
                  </div>
                  {selectedTools.map((tool: any) => {
                    const value = tool[row.key];
                    const displayValue = row.format ? row.format(value) : value;
                    
                    return (
                      <div key={tool.id} className="p-6 flex items-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <Minus className="h-5 w-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className={!displayValue || displayValue === "null" ? "text-muted-foreground" : ""}>
                            {displayValue || "N/A"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}

            {/* Tasks */}
            <Card className="glass card-shadow overflow-hidden">
              <div className="grid grid-cols-4 divide-x divide-border">
                <div className="p-6 bg-muted/20">
                  <h4 className="font-semibold">Capabilities</h4>
                </div>
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {tool.tasks?.map((task: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {task}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pros & Cons */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass card-shadow">
                <CardHeader>
                  <CardTitle className="text-primary">Pros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTools.map((tool) => (
                      <div key={tool.id}>
                        <h4 className="font-semibold mb-2">{tool.name}</h4>
                        <ul className="space-y-1">
                          {tool.pros?.map((pro: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass card-shadow">
                <CardHeader>
                  <CardTitle className="text-destructive">Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTools.map((tool) => (
                      <div key={tool.id}>
                        <h4 className="font-semibold mb-2">{tool.name}</h4>
                        <ul className="space-y-1">
                          {tool.cons?.map((con: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {selectedTools.length < 2 && (
          <Card className="glass card-shadow">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                Select at least 2 tools to start comparing
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
