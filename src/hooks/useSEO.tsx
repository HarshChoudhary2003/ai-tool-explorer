import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "AI Tools Explorer - Discover, Compare & Find Best AI Tools";
const DEFAULT_DESCRIPTION = "Explore the ultimate directory of AI tools. Compare features, pricing, and capabilities to find the perfect AI solutions for your needs.";
const DEFAULT_IMAGE = "/og-image.png";

export function useSEO({
  title,
  description,
  image,
  url,
  type = "website",
  noIndex = false,
}: SEOProps = {}) {
  useEffect(() => {
    // Store original values for cleanup
    const originalTitle = document.title;
    
    // Update title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, content: string, attributeName = "content") => {
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (meta) {
        meta.setAttribute(attributeName, content);
      } else {
        meta = document.createElement("meta");
        const [attr, value] = selector.replace("meta[", "").replace("]", "").split("=");
        meta.setAttribute(attr, value.replace(/"/g, ""));
        meta.setAttribute(attributeName, content);
        document.head.appendChild(meta);
      }
      return meta;
    };

    // Helper to update or create link tag
    const updateLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (link) {
        link.href = href;
      } else {
        link = document.createElement("link");
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
      }
      return link;
    };

    // Update meta description
    if (description) {
      updateMetaTag('meta[name="description"]', description);
    }

    // Update Open Graph tags
    if (title) {
      updateMetaTag('meta[property="og:title"]', title);
    }
    if (description) {
      updateMetaTag('meta[property="og:description"]', description);
    }
    if (image) {
      const fullImageUrl = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      updateMetaTag('meta[property="og:image"]', fullImageUrl);
    }
    if (url) {
      updateMetaTag('meta[property="og:url"]', url);
    }
    if (type) {
      updateMetaTag('meta[property="og:type"]', type);
    }

    // Update Twitter Card tags
    if (title) {
      updateMetaTag('meta[name="twitter:title"]', title);
    }
    if (description) {
      updateMetaTag('meta[name="twitter:description"]', description);
    }
    if (image) {
      const fullImageUrl = image.startsWith("http") ? image : `${window.location.origin}${image}`;
      updateMetaTag('meta[name="twitter:image"]', fullImageUrl);
    }

    // Update canonical URL
    if (url) {
      updateLinkTag("canonical", url);
    }

    // Handle noIndex
    if (noIndex) {
      updateMetaTag('meta[name="robots"]', "noindex, nofollow");
    }

    // Cleanup on unmount - restore defaults
    return () => {
      document.title = originalTitle;
      
      // Reset to defaults
      const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
      if (descMeta) descMeta.content = DEFAULT_DESCRIPTION;
      
      const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
      if (ogTitle) ogTitle.content = DEFAULT_TITLE;
      
      const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
      if (ogDesc) ogDesc.content = DEFAULT_DESCRIPTION;
      
      const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
      if (ogImage) ogImage.content = `${window.location.origin}${DEFAULT_IMAGE}`;
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement;
      if (twitterTitle) twitterTitle.content = DEFAULT_TITLE;
      
      const twitterDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement;
      if (twitterDesc) twitterDesc.content = DEFAULT_DESCRIPTION;
      
      const twitterImage = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement;
      if (twitterImage) twitterImage.content = `${window.location.origin}${DEFAULT_IMAGE}`;

      // Remove noindex if it was added
      if (noIndex) {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) robotsMeta.remove();
      }

      // Remove canonical if it was added
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical && url) canonical.remove();
    };
  }, [title, description, image, url, type, noIndex]);
}

// Helper to generate JSON-LD for a tool
export function generateToolJsonLd(tool: {
  id: string;
  name: string;
  description: string;
  rating?: number;
  pricing?: string;
  website_url?: string;
  category?: string;
}) {
  const baseUrl = window.location.origin;
  
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "url": `${baseUrl}/tools/${tool.id}`,
    "applicationCategory": tool.category || "AI Tool",
    ...(tool.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": tool.rating,
        "bestRating": 5,
        "worstRating": 1
      }
    }),
    ...(tool.pricing && {
      "offers": {
        "@type": "Offer",
        "price": tool.pricing === "Free" ? "0" : undefined,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }),
    ...(tool.website_url && {
      "sameAs": tool.website_url
    })
  };
}
