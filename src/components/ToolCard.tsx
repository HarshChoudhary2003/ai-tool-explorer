import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Zap, ArrowUpRight, GitCompare, Check } from "lucide-react";
import { BookmarkButton } from "@/components/BookmarkButton";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: any;
  compareSelected?: boolean;
  onToggleCompare?: (tool: any) => void;
  compareDisabled?: boolean;
}

export function ToolCard({ tool, compareSelected, onToggleCompare, compareDisabled }: ToolCardProps) {
  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="group relative h-full [perspective:1200px]">
      {/* Animated gradient border on hover */}
      <div
        className={cn(
          "absolute -inset-px rounded-sm bg-gradient-to-br transition-all duration-500 blur-sm",
          compareSelected
            ? "from-primary/70 via-secondary/70 to-accent/70 opacity-100"
            : "from-primary/0 via-secondary/0 to-accent/0 opacity-0 group-hover:from-primary/60 group-hover:via-secondary/60 group-hover:to-accent/60 group-hover:opacity-100"
        )}
      />

      <div
        className={cn(
          "gallery-card relative flex flex-col h-full glass rounded-sm p-5 sm:p-6 overflow-hidden",
          compareSelected && "ring-2 ring-primary/60"
        )}
      >
        <div className="absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-primary/80 to-transparent" />
        <div className="absolute right-4 top-3 font-display text-5xl text-foreground/5 transition-colors group-hover:text-primary/10" aria-hidden="true">
          {String(tool.name || "AI").slice(0, 2).toUpperCase()}
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex-1 min-w-0">
            <Link to={`/tools/${tool.id}`} className="block">
              <h3 className="font-display text-2xl sm:text-3xl font-normal leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">
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
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20">
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
          {onToggleCompare && (
            <Button
              type="button"
              variant={compareSelected ? "default" : "outline"}
              size="icon"
              className="shrink-0"
              onClick={() => onToggleCompare(tool)}
              disabled={!compareSelected && compareDisabled}
              aria-pressed={compareSelected}
              aria-label={compareSelected ? `Remove ${tool.name} from compare` : `Add ${tool.name} to compare`}
              title={
                !compareSelected && compareDisabled
                  ? "You can compare up to 3 tools"
                  : compareSelected
                  ? "Remove from compare"
                  : "Add to compare"
              }
            >
              {compareSelected ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
            </Button>
          )}
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
