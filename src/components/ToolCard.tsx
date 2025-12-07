import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Zap } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";

interface ToolCardProps {
  tool: any;
}

export function ToolCard({ tool }: ToolCardProps) {
  const categoryColors: Record<string, string> = {
    llm: "bg-primary/20 text-primary border-primary/30",
    image_generation: "bg-secondary/20 text-secondary border-secondary/30",
    voice: "bg-accent/20 text-accent border-accent/30",
    automation: "bg-primary/20 text-primary border-primary/30",
    no_code: "bg-secondary/20 text-secondary border-secondary/30",
    video: "bg-accent/20 text-accent border-accent/30",
    audio: "bg-primary/20 text-primary border-primary/30",
    productivity: "bg-secondary/20 text-secondary border-secondary/30",
    code_assistant: "bg-accent/20 text-accent border-accent/30",
    data_analysis: "bg-primary/20 text-primary border-primary/30",
  };

  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card className="glass card-shadow hover:scale-105 transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
              {tool.name}
            </CardTitle>
            <div className="flex gap-2 flex-wrap mb-2">
              <Badge className={categoryColors[tool.category]}>
                {formatCategory(tool.category)}
              </Badge>
              <Badge variant="outline" className="border-primary/30">
                {tool.pricing}
              </Badge>
              {tool.has_api && (
                <Badge variant="outline" className="border-secondary/30">
                  <Zap className="h-3 w-3 mr-1" />
                  API
                </Badge>
              )}
            </div>
          </div>
          <BookmarkButton toolId={tool.id} />
        </div>
        <CardDescription className="line-clamp-2">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-primary fill-primary" />
          <span className="font-semibold">{tool.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({tool.popularity_score.toLocaleString()} users)
          </span>
        </div>
        {tool.tasks && tool.tasks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tool.tasks.slice(0, 3).map((task: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {task}
              </Badge>
            ))}
            {tool.tasks.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tool.tasks.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild variant="default" className="flex-1">
          <Link to={`/tools/${tool.id}`}>View Details</Link>
        </Button>
        <Button asChild variant="outline" size="icon">
          <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
