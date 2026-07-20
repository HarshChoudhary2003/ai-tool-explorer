import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardSkeleton } from "@/components/ToolCardSkeleton";
import { FilterBar } from "@/components/FilterBar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Sparkles, SearchX, GitCompare, X, ArrowRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;
const MAX_COMPARE = 3;

export default function Tools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareTools, setCompareTools] = useState<any[]>([]);

  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const pricing = searchParams.get("pricing");
  const rating = searchParams.get("rating");
  const hasApi = searchParams.get("hasApi");
  const sort = searchParams.get("sort");
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from("ai_tools")
      .select("*")
      .order("popularity_score", { ascending: false });

    if (error) {
      console.error("Error fetching tools:", error);
    } else {
      setTools(data || []);
    }
    setLoading(false);
  };

  const isInitialLoading = loading && tools.length === 0;

  const toggleCompare = (tool: any) => {
    setCompareTools((prev) => {
      if (prev.find((t) => t.id === tool.id)) {
        return prev.filter((t) => t.id !== tool.id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, tool];
    });
  };
  const compareIds = compareTools.map((t) => t.id);

  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Category filter
    if (category) {
      filtered = filtered.filter((tool) => tool.category === category);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          tool.tasks?.some((task: string) => task.toLowerCase().includes(searchLower))
      );
    }

    // Pricing filter
    if (pricing) {
      filtered = filtered.filter((tool) => tool.pricing === pricing);
    }

    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating);
      filtered = filtered.filter((tool) => (tool.rating || 0) >= minRating);
    }

    // API availability filter
    if (hasApi === "true") {
      filtered = filtered.filter((tool) => tool.has_api === true);
    }

    // Sorting
    const priceRank: Record<string, number> = { free: 0, freemium: 1, paid: 2, enterprise: 3 };
    switch (sort) {
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "newest_2026": {
        const score = (t: any) => {
          const hay = `${t.name} ${t.description}`.toLowerCase();
          let s = 0;
          if (/\b2026\b/.test(hay)) s += 3;
          if (/\b(gpt-?5|claude 4|sora 2|grok 4|veo 3|kling 2|gemini 2|llama 4|mistral large 3|deepseek v3|qwen 3|flux\.?1\.?1|midjourney v7|ideogram 3|suno v5|udio v2|elevenlabs v3)\b/.test(hay)) s += 2;
          return s;
        };
        filtered.sort((a, b) => {
          const d = score(b) - score(a);
          if (d !== 0) return d;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
      }
      case "price_asc":
        filtered.sort((a, b) => (priceRank[a.pricing] ?? 99) - (priceRank[b.pricing] ?? 99) || (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
      case "price_desc":
        filtered.sort((a, b) => (priceRank[b.pricing] ?? -1) - (priceRank[a.pricing] ?? -1) || (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
      case "api_first":
        filtered.sort((a, b) => Number(!!b.has_api) - Number(!!a.has_api) || (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
      case "popularity":
      default:
        filtered.sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
        break;
    }

    return filtered;
  }, [tools, category, search, pricing, rating, hasApi, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTools = useMemo(
    () => filteredTools.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredTools, safePage]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [safePage]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    setSearchParams(params);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];
    const add = (n: number) => pages.push(n);
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) add(i);
    } else {
      add(1);
      if (safePage > 3) pages.push("ellipsis");
      const start = Math.max(2, safePage - 1);
      const end = Math.min(totalPages - 1, safePage + 1);
      for (let i = start; i <= end; i++) add(i);
      if (safePage < totalPages - 2) pages.push("ellipsis");
      add(totalPages);
    }
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Ambient mesh background */}
      <div className="absolute inset-0 mesh-bg opacity-60 pointer-events-none" aria-hidden="true" />
      <div
        className="absolute -top-40 -right-32 h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl animate-float pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -left-40 h-[360px] w-[360px] rounded-full bg-accent/20 blur-3xl animate-float pointer-events-none"
        style={{ animationDelay: "1.5s" }}
        aria-hidden="true"
      />

      <Header />

      <main className="container mx-auto px-4 py-8 sm:py-12 flex-1 relative z-10">
        {/* Hero header */}
        <div className="mb-8 sm:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass mb-4 text-xs sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-glow" />
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold">{tools.length}</span> tools and counting
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            <span className="shimmer-text">AI Tools Directory</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl">
            Explore the most powerful, cutting-edge AI tools across every category — curated, ranked, and updated weekly.
          </p>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <FilterBar totalCount={filteredTools.length} />
        </div>

        {isInitialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ToolCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-fade-in">
            <div className="h-16 w-16 rounded-2xl glass flex items-center justify-center mb-4">
              <SearchX className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No tools match your filters</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Try removing a filter or broadening your search to discover more AI tools.
            </p>
            <Button variant="outline" onClick={() => setSearchParams({})}>
              Reset filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {paginatedTools.map((tool, index) => (
                <div
                  key={tool.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 50, 400)}ms`, animationFillMode: "backwards" }}
                >
                  <ToolCard
                    tool={tool}
                    compareSelected={compareIds.includes(tool.id)}
                    compareDisabled={compareTools.length >= MAX_COMPARE}
                    onToggleCompare={toggleCompare}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 sm:mt-12 animate-fade-in">
                <Pagination>
                  <PaginationContent className="flex-wrap justify-center gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={(e) => {
                          e.preventDefault();
                          if (safePage > 1) goToPage(safePage - 1);
                        }}
                        className={
                          safePage <= 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-primary/10"
                        }
                      />
                    </PaginationItem>

                    {pageNumbers.map((p, idx) =>
                      p === "ellipsis" ? (
                        <PaginationItem key={`e-${idx}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={p}>
                          <PaginationLink
                            isActive={p === safePage}
                            onClick={(e) => {
                              e.preventDefault();
                              goToPage(p);
                            }}
                            className={
                              p === safePage
                                ? "cursor-pointer bg-primary/15 border-primary/40 text-primary font-semibold"
                                : "cursor-pointer hover:bg-primary/10"
                            }
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={(e) => {
                          e.preventDefault();
                          if (safePage < totalPages) goToPage(safePage + 1);
                        }}
                        className={
                          safePage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-primary/10"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
                <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filteredTools.length)} of {filteredTools.length}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating compare bar */}
      {compareTools.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl px-3 sm:px-0 animate-fade-in">
          <div className="glass shadow-card rounded-2xl p-3 sm:p-4 flex items-center gap-3 border border-primary/30">
            <div className="hidden sm:flex h-9 w-9 rounded-xl bg-primary/15 items-center justify-center shrink-0">
              <GitCompare className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold mb-1">
                Comparing {compareTools.length} of {MAX_COMPARE}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {compareTools.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs bg-muted/70 rounded-full pl-2 pr-1 py-0.5"
                  >
                    <span className="truncate max-w-[100px] sm:max-w-[160px]">{t.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleCompare(t)}
                      className="rounded-full hover:bg-background p-0.5"
                      aria-label={`Remove ${t.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareTools([])}
                className="hidden sm:inline-flex"
              >
                Clear
              </Button>
              <Button asChild size="sm" disabled={compareTools.length < 2}>
                <Link to={`/compare?tools=${compareIds.join(",")}`}>
                  Compare
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
