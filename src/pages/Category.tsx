import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, ArrowLeft, Search, Sparkles, X, ArrowUpDown, List, Infinity } from "lucide-react";
import { motion } from "framer-motion";
import { getCategoryBySlug, getAllCategories } from "@/data/categoryData";
import { useSEO } from "@/hooks/useSEO";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

const ITEMS_PER_PAGE = 12;

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"pagination" | "infinite">("pagination");
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

  const categoryInfo = slug ? getCategoryBySlug(slug) : undefined;

  useSEO({
    title: categoryInfo ? `${categoryInfo.name} AI Tools` : "Category",
    description: categoryInfo?.longDescription || "Explore AI tools in this category",
  });

  useEffect(() => {
    if (slug) {
      fetchTools();
    }
  }, [slug]);

  const fetchTools = async () => {
    if (!slug) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .eq("category", slug as any)
      .order("popularity_score", { ascending: false });

    if (error) {
      console.error("Error fetching tools:", error);
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const filteredAndSortedTools = useMemo(() => {
    let result = tools;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case "rating":
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        result = [...result].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "popularity":
      default:
        result = [...result].sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
    }
    
    return result;
  }, [tools, searchQuery, sortBy]);

  const topTools = useMemo(() => {
    return filteredAndSortedTools.filter((tool) => (tool.rating || 0) >= 4.3).slice(0, 6);
  }, [filteredAndSortedTools]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTools.length / ITEMS_PER_PAGE);
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTools.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTools, currentPage]);

  // Infinite scroll
  const infiniteTools = useMemo(() => {
    return filteredAndSortedTools.slice(0, displayedCount);
  }, [filteredAndSortedTools, displayedCount]);

  const hasMore = displayedCount < filteredAndSortedTools.length;
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // Simulate slight delay for smoother UX
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedTools.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, filteredAndSortedTools.length]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  // Reset to page 1 and displayed count when filters change
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchQuery, sortBy]);

  const allCategories = getAllCategories();

  if (!categoryInfo) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 flex-1 text-center">
          <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Link to="/tools">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All Tools
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className={`relative py-16 sm:py-24 bg-gradient-to-br ${categoryInfo.color} overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/tools"
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Categories
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <CategoryIcon className="h-10 w-10 text-white" />
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {tools.length} Tools
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              {categoryInfo.name}
            </h1>

            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed">
              {categoryInfo.longDescription}
            </p>

            <div className="flex flex-wrap gap-2">
              {categoryInfo.featuredTasks.map((task) => (
                <Badge
                  key={task}
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 capitalize"
                >
                  {task}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Common Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categoryInfo.useCases.map((useCase, index) => (
              <motion.div
                key={useCase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass p-4 rounded-xl text-center"
              >
                <span className="text-sm font-medium">{useCase}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated Tools */}
      {topTools.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Top Rated {categoryInfo.name} Tools</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ToolCard tool={tool} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold">
                All {categoryInfo.name} Tools ({filteredAndSortedTools.length})
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-44">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                  </SelectContent>
                </Select>
                {/* View Mode Toggle */}
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("pagination")}
                    className={`px-3 py-2 flex items-center gap-1 text-sm transition-colors ${
                      viewMode === "pagination"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                    title="Pagination"
                  >
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Pages</span>
                  </button>
                  <button
                    onClick={() => setViewMode("infinite")}
                    className={`px-3 py-2 flex items-center gap-1 text-sm transition-colors ${
                      viewMode === "infinite"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                    title="Infinite Scroll"
                  >
                    <Infinity className="h-4 w-4" />
                    <span className="hidden sm:inline">Scroll</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "pagination" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          // Show first, last, current, and neighbors
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - currentPage) <= 1) return true;
                          return false;
                        })
                        .map((page, index, arr) => {
                          // Add ellipsis
                          const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1;
                          return (
                            <span key={page} className="flex items-center">
                              {showEllipsisBefore && (
                                <PaginationItem>
                                  <span className="px-2 text-muted-foreground">...</span>
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </span>
                          );
                        })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {infiniteTools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.3) }}
                  >
                    <ToolCard tool={tool} />
                  </motion.div>
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                {isLoadingMore && (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                )}
                {!hasMore && infiniteTools.length > 0 && (
                  <p className="text-muted-foreground text-sm">You've seen all {filteredAndSortedTools.length} tools</p>
                )}
              </div>
            </>
          )}

          {!loading && filteredAndSortedTools.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                {searchQuery ? "No tools match your search" : "No tools found in this category yet"}
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear Search
                </Button>
              ) : (
                <Link to="/submit">
                  <Button>Submit a Tool</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Browse Other Categories */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Browse Other Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {allCategories
              .filter((cat) => cat.slug !== slug)
              .slice(0, 12)
              .map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    className="glass p-4 rounded-xl text-center hover:bg-accent/50 transition-colors group"
                  >
                    <Icon className="h-6 w-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium line-clamp-1">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
