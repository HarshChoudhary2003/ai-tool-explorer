import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the base URL from request or use default
    const url = new URL(req.url);
    const baseUrl = url.searchParams.get('base_url') || 'https://id-preview--188adf73-1cb7-490d-adc8-2edfced31e9b.lovable.app';

    // Fetch all AI tools
    const { data: tools, error: toolsError } = await supabase
      .from('ai_tools')
      .select('id, name, updated_at')
      .order('updated_at', { ascending: false });

    if (toolsError) {
      console.error('Error fetching tools:', toolsError);
      throw new Error('Failed to fetch tools');
    }

    // Fetch all published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (blogError) {
      console.error('Error fetching blog posts:', blogError);
      // Continue without blog posts if error
    }

    const today = new Date().toISOString().split('T')[0];

    // Static pages with priorities
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/tools', priority: '0.9', changefreq: 'daily' },
      { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
      { loc: '/trending', priority: '0.8', changefreq: 'daily' },
      { loc: '/compare', priority: '0.7', changefreq: 'weekly' },
      { loc: '/recommend', priority: '0.7', changefreq: 'monthly' },
      { loc: '/submit', priority: '0.5', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.4', changefreq: 'monthly' },
      { loc: '/privacy', priority: '0.3', changefreq: 'yearly' },
      { loc: '/terms', priority: '0.3', changefreq: 'yearly' },
    ];

    // Build XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

    // Add static pages
    for (const page of staticPages) {
      xml += `  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add tool pages
    if (tools && tools.length > 0) {
      for (const tool of tools) {
        const lastmod = tool.updated_at 
          ? new Date(tool.updated_at).toISOString().split('T')[0] 
          : today;
        xml += `  <url>
    <loc>${baseUrl}/tools/${tool.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    // Add blog post pages
    if (blogPosts && blogPosts.length > 0) {
      for (const post of blogPosts) {
        const lastmod = post.updated_at 
          ? new Date(post.updated_at).toISOString().split('T')[0]
          : post.published_at
          ? new Date(post.published_at).toISOString().split('T')[0]
          : today;
        xml += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
      }
    }

    xml += '</urlset>';

    console.log(`Generated sitemap with ${staticPages.length} static pages, ${tools?.length || 0} tools, and ${blogPosts?.length || 0} blog posts`);

    return new Response(xml, {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>`,
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
