import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Generate a session ID for anonymous tracking
const getSessionId = () => {
  let sessionId = sessionStorage.getItem("view_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("view_session_id", sessionId);
  }
  return sessionId;
};

export function useToolViews(toolId: string | undefined) {
  const { user } = useAuth();

  useEffect(() => {
    if (!toolId) return;

    const trackView = async () => {
      try {
        const sessionId = getSessionId();

        // Check if already viewed in this session (to avoid duplicates on refresh)
        const viewKey = `viewed_${toolId}_${sessionId}`;
        if (sessionStorage.getItem(viewKey)) {
          return;
        }

        // Insert view record
        const { error } = await supabase.from("tool_views").insert({
          tool_id: toolId,
          user_id: user?.id || null,
          session_id: sessionId,
        });

        if (error) {
          console.error("Error tracking view:", error);
        } else {
          // Mark as viewed in this session
          sessionStorage.setItem(viewKey, "true");
        }
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [toolId, user?.id]);
}
