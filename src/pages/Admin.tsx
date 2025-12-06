import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, Shield, Users, Wrench, Mail, FileText, MessageSquare } from "lucide-react";

const CATEGORIES = [
  "llm", "image_generation", "voice", "automation", "no_code", "video",
  "audio", "productivity", "code_assistant", "data_analysis", "writing",
  "research", "customer_support", "marketing", "design", "education",
  "sales", "hr_recruiting", "legal", "finance", "healthcare"
];

const PRICING_TYPES = ["free", "freemium", "paid", "enterprise"];

export default function Admin() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editingTool, setEditingTool] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "llm",
    pricing: "freemium",
    website_url: "",
    has_api: false,
    api_details: "",
    pricing_details: "",
    rating: 4.5,
    popularity_score: 1000,
    tasks: "",
    pros: "",
    cons: "",
    use_cases: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    
    const [toolsRes, contactsRes, subscribersRes, profilesRes] = await Promise.all([
      supabase.from("ai_tools").select("*").order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    if (toolsRes.data) setTools(toolsRes.data);
    if (contactsRes.data) setContacts(contactsRes.data);
    if (subscribersRes.data) setSubscribers(subscribersRes.data);
    if (profilesRes.data) setUsers(profilesRes.data);
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "llm",
      pricing: "freemium",
      website_url: "",
      has_api: false,
      api_details: "",
      pricing_details: "",
      rating: 4.5,
      popularity_score: 1000,
      tasks: "",
      pros: "",
      cons: "",
      use_cases: "",
    });
    setEditingTool(null);
  };

  const handleEdit = (tool: any) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      pricing: tool.pricing,
      website_url: tool.website_url,
      has_api: tool.has_api || false,
      api_details: tool.api_details || "",
      pricing_details: tool.pricing_details || "",
      rating: tool.rating || 4.5,
      popularity_score: tool.popularity_score || 1000,
      tasks: tool.tasks?.join(", ") || "",
      pros: tool.pros?.join(", ") || "",
      cons: tool.cons?.join(", ") || "",
      use_cases: tool.use_cases?.join(", ") || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    const toolData = {
      name: formData.name,
      description: formData.description,
      category: formData.category as any,
      pricing: formData.pricing as any,
      website_url: formData.website_url,
      has_api: formData.has_api,
      api_details: formData.api_details || null,
      pricing_details: formData.pricing_details || null,
      rating: formData.rating,
      popularity_score: formData.popularity_score,
      tasks: formData.tasks.split(",").map((t) => t.trim()).filter(Boolean),
      pros: formData.pros.split(",").map((t) => t.trim()).filter(Boolean),
      cons: formData.cons.split(",").map((t) => t.trim()).filter(Boolean),
      use_cases: formData.use_cases.split(",").map((t) => t.trim()).filter(Boolean),
    };

    let error;
    if (editingTool) {
      const res = await supabase.from("ai_tools").update(toolData).eq("id", editingTool.id);
      error = res.error;
    } else {
      const res = await supabase.from("ai_tools").insert([toolData]);
      error = res.error;
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Tool ${editingTool ? "updated" : "created"} successfully` });
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    
    const { error } = await supabase.from("ai_tools").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Tool deleted successfully" });
      fetchData();
    }
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

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Shield className="h-8 w-8" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground mt-1">Manage tools, users, and content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Wrench className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{tools.length}</p>
                  <p className="text-sm text-muted-foreground">Tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                  <p className="text-sm text-muted-foreground">Messages</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{subscribers.length}</p>
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tools" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
            <TabsTrigger value="contacts">Messages</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>AI Tools</CardTitle>
                  <CardDescription>Manage your AI tools directory</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Tool
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingTool ? "Edit Tool" : "Add New Tool"}</DialogTitle>
                      <DialogDescription>Fill in the tool details below</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Website URL *</Label>
                          <Input value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description *</Label>
                        <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat.replace("_", " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Pricing</Label>
                          <Select value={formData.pricing} onValueChange={(v) => setFormData({ ...formData, pricing: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {PRICING_TYPES.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Rating (0-5)</Label>
                          <Input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Popularity Score</Label>
                          <Input type="number" value={formData.popularity_score} onChange={(e) => setFormData({ ...formData, popularity_score: parseInt(e.target.value) })} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={formData.has_api} onCheckedChange={(c) => setFormData({ ...formData, has_api: c })} />
                        <Label>Has API</Label>
                      </div>
                      {formData.has_api && (
                        <div className="space-y-2">
                          <Label>API Details</Label>
                          <Input value={formData.api_details} onChange={(e) => setFormData({ ...formData, api_details: e.target.value })} />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Pricing Details</Label>
                        <Input value={formData.pricing_details} onChange={(e) => setFormData({ ...formData, pricing_details: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Tasks (comma-separated)</Label>
                        <Input value={formData.tasks} onChange={(e) => setFormData({ ...formData, tasks: e.target.value })} placeholder="text generation, summarization, translation" />
                      </div>
                      <div className="space-y-2">
                        <Label>Pros (comma-separated)</Label>
                        <Input value={formData.pros} onChange={(e) => setFormData({ ...formData, pros: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Cons (comma-separated)</Label>
                        <Input value={formData.cons} onChange={(e) => setFormData({ ...formData, cons: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Use Cases (comma-separated)</Label>
                        <Input value={formData.use_cases} onChange={(e) => setFormData({ ...formData, use_cases: e.target.value })} />
                      </div>
                      <Button onClick={handleSave} className="w-full">{editingTool ? "Update Tool" : "Create Tool"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>API</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tools.slice(0, 20).map((tool) => (
                        <TableRow key={tool.id}>
                          <TableCell className="font-medium">{tool.name}</TableCell>
                          <TableCell><Badge variant="secondary">{tool.category}</Badge></TableCell>
                          <TableCell>{tool.pricing}</TableCell>
                          <TableCell>{tool.rating}</TableCell>
                          <TableCell>{tool.has_api ? "Yes" : "No"}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(tool)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(tool.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="contacts">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>Messages from the contact form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <Card key={contact.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(contact.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {contact.subject && <p className="text-sm font-medium mb-2">{contact.subject}</p>}
                      <p className="text-sm text-muted-foreground">{contact.message}</p>
                    </Card>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No messages yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Newsletter Subscribers</CardTitle>
                <CardDescription>Email subscribers list</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>{new Date(sub.subscribed_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={sub.is_active ? "default" : "secondary"}>
                            {sub.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>{u.display_name || "—"}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}