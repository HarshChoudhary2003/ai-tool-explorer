import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Zap, ArrowUpRight } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";

interface ToolCardProps {
  tool: any;
}

export function ToolCard({ tool }: ToolCardProps) {
  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="group relative h-full">
      {/* Animated gradient border on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/0 via-secondary/0 to-accent/0 group-hover:from-primary/60 group-hover:via-secondary/60 group-hover:to-accent/60 transition-all duration-500 opacity-0 group-hover:opacity-100 blur-sm" />

      <div className="relative flex flex-col h-full glass rounded-2xl p-5 sm:p-6 hover-lift overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-primary opacity-10 blur-3xl group-hover:opacity-30 transition-opacity duration-500" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex-1 min-w-0">
            <Link to={`/tools/${tool.id}`} className="block">
              <h3 className="text-lg sm:text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {tool.name}
              </h3>
            </Link>
            <div className="flex gap-1.5 flex-wrap">
              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] sm:text-xs">
                {formatCategory(tool.category)}
              </Badge>
              <Badge variant="outline" className="border-border/60 text-[10px] sm:text-xs capitalize">
                {tool.pricing}
              </Badge>
              {tool.has_api && (
                <Badge className="bg-secondary/15 text-secondary border-secondary/30 text-[10px] sm:text-xs">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  API
                </Badge>
              )}
            </div>
          </div>
          <BookmarkButton toolId={tool.id} />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mt-3 relative z-10">
          {tool.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-4 relative z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <Star className="h-3.5 w-3.5 text-primary fill-primary" />
            <span className="font-semibold text-sm">{tool.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {tool.popularity_score?.toLocaleString() ?? 0} users
          </span>
        </div>

        {/* Tasks */}
        {tool.tasks && tool.tasks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 relative z-10">
            {tool.tasks.slice(0, 3).map((task: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs font-normal">
                {task}
              </Badge>
            ))}
            {tool.tasks.length > 3 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                +{tool.tasks.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 mt-auto pt-5 relative z-10">
          <Button asChild className="flex-1 group/btn">
            <Link to={`/tools/${tool.id}`}>
              View Details
              <ArrowUpRight className="h-4 w-4 ml-1 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="icon" className="shrink-0">
            <a href={tool.website_url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${tool.name}`}>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
