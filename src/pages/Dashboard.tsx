import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBookmarks } from "@/hooks/useBookmarks";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/ToolCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CategoryPreferences } from "@/components/CategoryPreferences";
import { Loader2, Bookmark, Clock, Star, Settings, LogOut, Bell } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const { bookmarks } = useBookmarks();
  const [profile, setProfile] = useState<any>(null);
  const [bookmarkedTools, setBookmarkedTools] = useState<any[]>([]);
  const [recentTools, setRecentTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, bookmarks]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    
    if (profileData) setProfile(profileData);

    // Fetch bookmarked tools
    if (bookmarks.length > 0) {
      const { data: toolsData } = await supabase
        .from("ai_tools")
        .select("*")
        .in("id", bookmarks);
      
      if (toolsData) setBookmarkedTools(toolsData);
    } else {
      setBookmarkedTools([]);
    }

    // Get recently viewed from localStorage
    const recentlyViewed = JSON.parse(localStorage.getItem("recently_viewed_tools") || "[]");
    if (recentlyViewed.length > 0) {
      const { data: recentData } = await supabase
        .from("ai_tools")
        .select("*")
        .in("id", recentlyViewed.slice(0, 6));
      
      if (recentData) setRecentTools(recentData);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="glass card-shadow mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {(profile?.display_name || user.email)?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-1">
                  {profile?.display_name || "User"}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <Badge variant="secondary">
                    <Bookmark className="h-3 w-3 mr-1" />
                    {bookmarks.length} Bookmarks
                  </Badge>
                  {isAdmin && (
                    <Badge className="bg-primary">Admin</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Button asChild variant="outline">
                    <Link to="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Bookmarked Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{bookmarks.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Recently Viewed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{recentTools.length}</div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Member Since</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookmarked Tools */}
        <Card className="glass card-shadow mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Saved Tools
            </CardTitle>
            <CardDescription>Your bookmarked AI tools for quick access</CardDescription>
          </CardHeader>
          <CardContent>
            {bookmarkedTools.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarkedTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No bookmarked tools yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/tools">Browse Tools</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recently Viewed */}
        {recentTools.length > 0 && (
          <Card className="glass card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />
                Recently Viewed
              </CardTitle>
              <CardDescription>Tools you've looked at recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Notification Preferences */}
        <CategoryPreferences />
      </main>

      <Footer />
    </div>
  );
}