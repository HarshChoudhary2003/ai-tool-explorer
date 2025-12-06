import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  toolId: string;
  variant?: "default" | "icon";
  className?: string;
}

export function BookmarkButton({ toolId, variant = "icon", className }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(toolId);

  return (
    <Button
      variant="ghost"
      size={variant === "icon" ? "icon" : "sm"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(toolId);
      }}
      className={cn(
        "transition-all",
        bookmarked && "text-primary",
        className
      )}
      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Bookmark
        className={cn(
          "h-4 w-4",
          bookmarked && "fill-primary"
        )}
      />
      {variant === "default" && (
        <span className="ml-2">{bookmarked ? "Saved" : "Save"}</span>
      )}
    </Button>
  );
}