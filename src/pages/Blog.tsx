import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Loader2, Star } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  is_featured: boolean | null;
  published_at: string | null;
  created_at: string;
}

const categories = [
  { value: "all", label: "All Posts" },
  { value: "guides", label: "Guides" },
  { value: "tutorials", label: "Tutorials" },
  { value: "news", label: "News" },
  { value: "trends", label: "Trends" },
  { value: "business", label: "Business" },
  { value: "reviews", label: "Reviews" },
];

// Placeholder posts when database is empty
const placeholderPosts: BlogPost[] = [
  {
    id: "1",
    title: "Top 10 AI Tools for Content Creation in 2024",
    slug: "top-10-ai-tools-content-creation-2024",
    excerpt: "Discover the most powerful AI tools that can supercharge your content creation workflow, from writing to image generation.",
    cover_image: null,
    category: "guides",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "How to Choose the Right AI Tool for Your Business",
    slug: "choose-right-ai-tool-business",
    excerpt: "A comprehensive guide to evaluating and selecting AI tools that match your business needs and budget.",
    cover_image: null,
    category: "business",
    is_featured: true,
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "3",
    title: "The Future of AI Assistants: What to Expect in 2025",
    slug: "future-ai-assistants-2025",
    excerpt: "Explore upcoming trends in AI assistants and how they will transform the way we work and live.",
    cover_image: null,
    category: "trends",
    is_featured: false,
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get("category") || "all";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, category, is_featured, published_at, created_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (data && data.length > 0) {
      setPosts(data);
    } else {
      setPosts(placeholderPosts);
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

  const handleCategoryChange = (category: string) => {
    if (category === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", category);
    }
    setSearchParams(searchParams);
  };

  const filteredPosts = selectedCategory === "all"
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const featuredPosts = posts.filter(post => post.is_featured);
  const regularPosts = selectedCategory === "all"
    ? filteredPosts.filter(post => !post.is_featured)
    : filteredPosts;

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge className="mb-4 glass border-primary/30 text-primary">
            Latest Updates
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Blog & Insights
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, tutorials, and insights about AI tools
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Featured posts section */}
            {selectedCategory === "all" && featuredPosts.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {featuredPosts.slice(0, 2).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass card-shadow hover:scale-[1.02] transition-all group h-full">
                        {post.cover_image && (
                          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            {post.category && (
                              <Badge variant="secondary">{post.category}</Badge>
                            )}
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {formatDate(post.published_at || post.created_at)}
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors text-xl">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="line-clamp-3 mb-4 text-base">
                            {post.excerpt}
                          </CardDescription>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
                          >
                            Read Article
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* All posts grid */}
            <section>
              {selectedCategory === "all" && featuredPosts.length > 0 && (
                <h2 className="text-2xl font-bold mb-6">All Articles</h2>
              )}
              {regularPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass card-shadow hover:scale-105 transition-all group h-full">
                        {post.cover_image && (
                          <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <CardHeader>
                          {post.category && (
                            <Badge variant="secondary" className="w-fit mb-2">
                              {post.category}
                            </Badge>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}