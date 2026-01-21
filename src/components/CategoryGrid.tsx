import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getAllCategories } from "@/data/categoryData";
import { ArrowRight } from "lucide-react";

export function CategoryGrid() {
  const categories = getAllCategories().slice(0, 12);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Explore by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find the perfect AI tools for your specific needs across 20+ specialized categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className={`group relative block p-6 rounded-2xl bg-gradient-to-br ${category.color} overflow-hidden transition-transform hover:scale-[1.02]`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10">
                    <Icon className="h-8 w-8 text-white mb-3" />
                    <h3 className="font-semibold text-white text-sm sm:text-base mb-1 line-clamp-1">
                      {category.name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm line-clamp-2">
                      {category.description}
                    </p>
                    <ArrowRight className="h-4 w-4 text-white/60 mt-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            View all categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
