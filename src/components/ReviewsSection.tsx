import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ReviewCard } from "@/components/ReviewCard";
import { ReviewForm } from "@/components/ReviewForm";
import { Star, MessageSquare, Loader2 } from "lucide-react";

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

interface ReviewsSectionProps {
  toolId: string;
  toolName: string;
}

export function ReviewsSection({ toolId, toolName }: ReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "highest" | "lowest">("recent");
  const [showForm, setShowForm] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    average: 0,
    distribution: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    fetchReviews();
  }, [toolId, sortBy]);

  const fetchReviews = async () => {
    setLoading(true);

    // Build query based on sort
    let query = supabase
      .from("tool_ratings")
      .select("*")
      .eq("tool_id", toolId);

    switch (sortBy) {
      case "recent":
        query = query.order("created_at", { ascending: false });
        break;
      case "helpful":
        query = query.order("helpful_count", { ascending: false });
        break;
      case "highest":
        query = query.order("rating", { ascending: false });
        break;
      case "lowest":
        query = query.order("rating", { ascending: true });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles for all reviewers
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const reviewsWithProfiles = data.map((review) => ({
        ...review,
        profile: profiles?.find((p) => p.user_id === review.user_id),
      }));

      setReviews(reviewsWithProfiles);

      // Calculate stats
      const total = data.length;
      const sum = data.reduce((acc, r) => acc + r.rating, 0);
      const average = total > 0 ? sum / total : 0;
      const distribution = [0, 0, 0, 0, 0];
      data.forEach((r) => {
        distribution[r.rating - 1]++;
      });

      setStats({ total, average, distribution });

      // Check if current user has a review
      if (user) {
        const existing = reviewsWithProfiles.find((r) => r.user_id === user.id);
        setUserReview(existing || null);
      }
    } else {
      setReviews([]);
      setStats({ total: 0, average: 0, distribution: [0, 0, 0, 0, 0] });
    }

    setLoading(false);
  };

  const handleHelpfulVote = (reviewId: string, newCount: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpful_count: newCount } : r))
    );
  };

  const handleReviewSubmitted = () => {
    setShowForm(false);
    fetchReviews();
  };

  return (
    <Card className="glass card-shadow">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Reviews & Ratings
          </CardTitle>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
            {user && !userReview && (
              <Button onClick={() => setShowForm(!showForm)}>
                Write a Review
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">{stats.average.toFixed(1)}</div>
              <div className="flex items-center justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(stats.average)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats.total} {stats.total === 1 ? "review" : "reviews"}
              </p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-3">{star}</span>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Progress
                    value={stats.total > 0 ? (stats.distribution[star - 1] / stats.total) * 100 : 0}
                    className="h-2 flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {stats.distribution[star - 1]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Form */}
          {(showForm || userReview) && (
            <ReviewForm
              toolId={toolId}
              onReviewSubmitted={handleReviewSubmitted}
              existingReview={userReview}
            />
          )}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onHelpfulVote={handleHelpfulVote}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to share your experience!</p>
            {user && !showForm && (
              <Button onClick={() => setShowForm(true)} className="mt-4">
                Write a Review
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
