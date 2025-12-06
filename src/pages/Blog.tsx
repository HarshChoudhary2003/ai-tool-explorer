import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Loader2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, published_at, created_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (data && data.length > 0) {
      setPosts(data);
    } else {
      // Placeholder posts
      setPosts([
        {
          id: "1",
          title: "Top 10 AI Tools for Content Creation in 2024",
          slug: "top-10-ai-tools-content-creation-2024",
          excerpt: "Discover the most powerful AI tools that can supercharge your content creation workflow, from writing to image generation.",
          cover_image: null,
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "How to Choose the Right AI Tool for Your Business",
          slug: "choose-right-ai-tool-business",
          excerpt: "A comprehensive guide to evaluating and selecting AI tools that match your business needs and budget.",
          cover_image: null,
          published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
        {
          id: "3",
          title: "The Future of AI Assistants: What to Expect in 2025",
          slug: "future-ai-assistants-2025",
          excerpt: "Explore upcoming trends in AI assistants and how they will transform the way we work and live.",
          cover_image: null,
          published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ]);
    }
    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <Badge className="mb-4 glass border-primary/30 text-primary">
            Latest Updates
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Blog & Updates
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, tutorials, and insights about AI tools
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {posts.map((post) => (
              <Card key={post.id} className="glass card-shadow hover:scale-105 transition-all group">
                {post.cover_image && (
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(post.published_at || post.created_at)}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">
                    {post.excerpt}
                  </CardDescription>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}