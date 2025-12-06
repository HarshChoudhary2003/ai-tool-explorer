import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export function useBookmarks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    } else {
      setBookmarks([]);
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("bookmarks")
      .select("tool_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching bookmarks:", error);
    } else {
      setBookmarks(data?.map((b) => b.tool_id) || []);
    }
    setLoading(false);
  };

  const toggleBookmark = async (toolId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to bookmark tools.",
        variant: "destructive",
      });
      return;
    }

    const isBookmarked = bookmarks.includes(toolId);

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("tool_id", toolId);

      if (error) {
        toast({ title: "Error", description: "Failed to remove bookmark", variant: "destructive" });
      } else {
        setBookmarks((prev) => prev.filter((id) => id !== toolId));
        toast({ title: "Removed", description: "Tool removed from bookmarks" });
      }
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, tool_id: toolId });

      if (error) {
        toast({ title: "Error", description: "Failed to add bookmark", variant: "destructive" });
      } else {
        setBookmarks((prev) => [...prev, toolId]);
        toast({ title: "Saved", description: "Tool added to bookmarks" });
      }
    }
  };

  const isBookmarked = (toolId: string) => bookmarks.includes(toolId);

  return { bookmarks, loading, toggleBookmark, isBookmarked, refetch: fetchBookmarks };
}