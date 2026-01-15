import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Generate JSON-LD structured data for BreadcrumbList
  const generateBreadcrumbJsonLd = () => {
    const itemListElement = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `${baseUrl}${item.href}` }),
      })),
    ];

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  };

  // Inject JSON-LD into document head
  useEffect(() => {
    const jsonLd = generateBreadcrumbJsonLd();

    // Remove any existing breadcrumb JSON-LD
    const existingScript = document.querySelector('script[data-breadcrumb-jsonld]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-breadcrumb-jsonld", "true");
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.querySelector('script[data-breadcrumb-jsonld]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items, baseUrl]);

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 sm:mb-6 ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 text-sm text-muted-foreground">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
              {isLast || !item.href ? (
                <span
                  className={isLast ? "text-foreground font-medium truncate max-w-[200px] sm:max-w-none" : ""}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
