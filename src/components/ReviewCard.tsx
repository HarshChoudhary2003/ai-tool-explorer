import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  helpful_count: number;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewCardProps {
  review: Review;
  onHelpfulVote: (reviewId: string, newCount: number) => void;
}

export function ReviewCard({ review, onHelpfulVote }: ReviewCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpfulClick = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to vote on reviews",
        variant: "destructive",
      });
      return;
    }

    if (voting || hasVoted) return;

    setVoting(true);

    try {
      // Check if already voted
      const { data: existingVote } = await supabase
        .from("review_helpful_votes")
        .select("id")
        .eq("review_id", review.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingVote) {
        // Remove vote
        await supabase
          .from("review_helpful_votes")
          .delete()
          .eq("id", existingVote.id);

        // Update count
        await supabase
          .from("tool_ratings")
          .update({ helpful_count: Math.max(0, review.helpful_count - 1) })
          .eq("id", review.id);

        onHelpfulVote(review.id, Math.max(0, review.helpful_count - 1));
        setHasVoted(false);
        toast({ title: "Vote removed" });
      } else {
        // Add vote
        await supabase
          .from("review_helpful_votes")
          .insert({ review_id: review.id, user_id: user.id });

        // Update count
        await supabase
          .from("tool_ratings")
          .update({ helpful_count: review.helpful_count + 1 })
          .eq("id", review.id);

        onHelpfulVote(review.id, review.helpful_count + 1);
        setHasVoted(true);
        toast({ title: "Thanks for your feedback!" });
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    } finally {
      setVoting(false);
    }
  };

  const displayName = review.profile?.display_name || "Anonymous User";
  const avatarUrl = review.profile?.avatar_url;
  const reviewText = review.review || "";
  const isLongReview = reviewText.length > 200;

  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {displayName[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-medium">{displayName}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>

            {/* Review Text */}
            {reviewText && (
              <div className="mb-3">
                <p className={`text-muted-foreground ${!expanded && isLongReview ? "line-clamp-3" : ""}`}>
                  {reviewText}
                </p>
                {isLongReview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-auto p-0 text-primary"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" />
                        Read more
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Helpful Button */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 ${hasVoted ? "text-primary" : ""}`}
                onClick={handleHelpfulClick}
                disabled={voting}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${hasVoted ? "fill-primary" : ""}`} />
                Helpful ({review.helpful_count})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
