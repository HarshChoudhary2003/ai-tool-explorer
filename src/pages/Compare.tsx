import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, ExternalLink, Check, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

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
    { label: "Popularity", key: "popularity_score", format: (val: number) => val?.toLocaleString() },
  ];

  // Get dynamic grid columns based on selected tools count
  const getGridCols = () => {
    const count = selectedTools.length;
    if (count === 2) return "grid-cols-1 md:grid-cols-3";
    if (count === 3) return "grid-cols-1 md:grid-cols-4";
    return "grid-cols-1 md:grid-cols-3";
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
      <div className="container mx-auto px-4 py-6 sm:py-8 flex-1">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold gradient-text mb-2 sm:mb-4">Compare AI Tools</h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
            Select up to 3 tools to compare their features side-by-side
          </p>
        </div>

        {/* Tool Selection */}
        <Card className="glass card-shadow mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Selected Tools ({selectedTools.length}/3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  {selectedTools[index] ? (
                    <div className="glass p-3 sm:p-4 rounded-lg">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{selectedTools[index].name}</h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
                          onClick={() => removeTool(selectedTools[index].id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Badge className="text-xs">{selectedTools[index].category}</Badge>
                    </div>
                  ) : (
                    <Select onValueChange={addTool}>
                      <SelectTrigger className="h-16 sm:h-20 border-dashed border-2">
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
          <div className="space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <Card className="glass card-shadow overflow-hidden">
              {/* Mobile: Stacked Cards */}
              <div className="block md:hidden">
                <div className="p-4 bg-muted/20 border-b border-border">
                  <h3 className="font-semibold text-lg">Tool Overview</h3>
                </div>
                <div className="divide-y divide-border">
                  {selectedTools.map((tool) => (
                    <div key={tool.id} className="p-4">
                      <Link to={`/tools/${tool.id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-semibold text-lg mb-2">{tool.name}</h3>
                      </Link>
                      <Button asChild size="sm" variant="outline">
                        <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Visit
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop: Grid Layout */}
              <div className={`hidden md:grid ${getGridCols()} divide-x divide-border`}>
                <div className="p-4 lg:p-6 bg-muted/20">
                  <h3 className="font-semibold text-base lg:text-lg">Tool</h3>
                </div>
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="p-4 lg:p-6">
                    <Link to={`/tools/${tool.id}`} className="hover:text-primary transition-colors">
                      <h3 className="font-semibold text-base lg:text-lg mb-2">{tool.name}</h3>
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
                {/* Mobile: Stacked Layout */}
                <div className="block md:hidden">
                  <div className="p-4 bg-muted/20 border-b border-border">
                    <h4 className="font-semibold">{row.label}</h4>
                  </div>
                  <div className="divide-y divide-border">
                    {selectedTools.map((tool: any) => {
                      const value = tool[row.key];
                      const displayValue = row.format ? row.format(value) : value;

                      return (
                        <div key={tool.id} className="p-4 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{tool.name}</span>
                          {typeof value === "boolean" ? (
                            value ? (
                              <Check className="h-5 w-5 text-primary" />
                            ) : (
                              <Minus className="h-5 w-5 text-muted-foreground" />
                            )
                          ) : (
                            <span className={`text-sm ${!displayValue || displayValue === "null" ? "text-muted-foreground" : ""}`}>
                              {displayValue || "N/A"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Desktop: Grid Layout */}
                <div className={`hidden md:grid ${getGridCols()} divide-x divide-border`}>
                  <div className="p-4 lg:p-6 bg-muted/20 flex items-center">
                    <h4 className="font-semibold text-sm lg:text-base">{row.label}</h4>
                  </div>
                  {selectedTools.map((tool: any) => {
                    const value = tool[row.key];
                    const displayValue = row.format ? row.format(value) : value;

                    return (
                      <div key={tool.id} className="p-4 lg:p-6 flex items-center">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <Minus className="h-5 w-5 text-muted-foreground" />
                          )
                        ) : (
                          <span className={`text-sm lg:text-base ${!displayValue || displayValue === "null" ? "text-muted-foreground" : ""}`}>
                            {displayValue || "N/A"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}

            {/* Tasks/Capabilities */}
            <Card className="glass card-shadow overflow-hidden">
              {/* Mobile: Stacked Layout */}
              <div className="block md:hidden">
                <div className="p-4 bg-muted/20 border-b border-border">
                  <h4 className="font-semibold">Capabilities</h4>
                </div>
                <div className="divide-y divide-border">
                  {selectedTools.map((tool) => (
                    <div key={tool.id} className="p-4">
                      <span className="text-sm text-muted-foreground block mb-2">{tool.name}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {tool.tasks?.map((task: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {task}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop: Grid Layout */}
              <div className={`hidden md:grid ${getGridCols()} divide-x divide-border`}>
                <div className="p-4 lg:p-6 bg-muted/20">
                  <h4 className="font-semibold text-sm lg:text-base">Capabilities</h4>
                </div>
                {selectedTools.map((tool) => (
                  <div key={tool.id} className="p-4 lg:p-6">
                    <div className="flex flex-wrap gap-1.5 lg:gap-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="glass card-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="text-primary text-lg sm:text-xl">Pros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTools.map((tool) => (
                      <div key={tool.id}>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">{tool.name}</h4>
                        <ul className="space-y-1.5">
                          {tool.pros?.map((pro: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
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
                <CardHeader className="pb-4">
                  <CardTitle className="text-destructive text-lg sm:text-xl">Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTools.map((tool) => (
                      <div key={tool.id}>
                        <h4 className="font-semibold mb-2 text-sm sm:text-base">{tool.name}</h4>
                        <ul className="space-y-1.5">
                          {tool.cons?.map((con: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
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
            <CardContent className="py-12 sm:py-16 text-center">
              <p className="text-muted-foreground text-base sm:text-lg">
                Select at least 2 tools to start comparing
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}
