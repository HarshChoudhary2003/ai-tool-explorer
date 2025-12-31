import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Loader2, Save, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Constants } from "@/integrations/supabase/types";

const CATEGORIES = Constants.public.Enums.tool_category;

interface UserInterest {
  id: string;
  category: string;
  email_notifications: boolean;
}

export function CategoryPreferences() {
  const { user } = useAuth();
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [emailEnabled, setEmailEnabled] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInterests();
    }
  }, [user]);

  const fetchInterests = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("user_category_interests")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching interests:", error);
    } else if (data) {
      setInterests(data);
      setSelectedCategories(new Set(data.map((i) => i.category)));
      setEmailEnabled(data.some((i) => i.email_notifications));
    }

    setLoading(false);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // Delete existing interests
      await supabase
        .from("user_category_interests")
        .delete()
        .eq("user_id", user.id);

      // Insert new interests
      if (selectedCategories.size > 0) {
        const insertData = Array.from(selectedCategories).map((category) => ({
          user_id: user.id,
          category: category as typeof CATEGORIES[number],
          email_notifications: emailEnabled,
        }));

        const { error } = await supabase
          .from("user_category_interests")
          .insert(insertData);

        if (error) throw error;
      }

      toast({
        title: "Preferences saved!",
        description: emailEnabled && selectedCategories.size > 0
          ? "You'll receive email notifications for new tools in your selected categories."
          : "Your category preferences have been updated.",
      });

      fetchInterests();
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCategory = (cat: string) => {
    return cat.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  if (loading) {
    return (
      <Card className="glass">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Category Notifications
        </CardTitle>
        <CardDescription>
          Get notified when new AI tools are added in categories you're interested in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {emailEnabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive emails about new tools in your categories
              </p>
            </div>
          </div>
          <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
        </div>

        {/* Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-medium">Select Categories</p>
            <Badge variant="secondary">
              {selectedCategories.size} selected
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {CATEGORIES.map((category) => (
              <label
                key={category}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedCategories.has(category)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Checkbox
                  checked={selectedCategories.has(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span className="text-sm">{formatCategory(category)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>

        {/* Currently Following */}
        {interests.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Currently following:</p>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Badge key={interest.id} variant="secondary" className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {formatCategory(interest.category)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
