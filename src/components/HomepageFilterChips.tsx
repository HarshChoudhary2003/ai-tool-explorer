import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { getAllCategories } from "@/data/categoryData";

interface HomepageFilterChipsProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function HomepageFilterChips({ selectedCategory, onCategoryChange }: HomepageFilterChipsProps) {
  const categories = getAllCategories().slice(0, 10);

  return (
    <section className="container mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-xl p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Filter all sections by category:</span>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange(null)}
              className="h-6 px-2 text-xs ml-auto"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filter
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.slug;
            const Icon = category.icon;
            
            return (
              <Button
                key={category.slug}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(isSelected ? null : category.slug)}
                className={`
                  h-8 text-xs sm:text-sm transition-all
                  ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "glass hover:border-primary/50"}
                `}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {category.name}
              </Button>
            );
          })}
        </div>
        
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-border/50"
          >
            <Badge variant="secondary" className="text-xs">
              Showing tools in: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
            </Badge>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
