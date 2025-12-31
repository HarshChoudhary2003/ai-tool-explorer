import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft, User, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  published_at: string | null;
  created_at: string;
  author_id: string | null;
}

// Placeholder posts for demo
const placeholderPosts: Record<string, BlogPost> = {
  "top-10-ai-tools-content-creation-2024": {
    id: "1",
    title: "Top 10 AI Tools for Content Creation in 2024",
    slug: "top-10-ai-tools-content-creation-2024",
    content: `
# Top 10 AI Tools for Content Creation in 2024

The landscape of content creation has been revolutionized by artificial intelligence. In this comprehensive guide, we'll explore the top 10 AI tools that are transforming how creators, marketers, and businesses produce content.

## 1. ChatGPT by OpenAI

ChatGPT remains the gold standard for AI-powered writing assistance. With GPT-4's capabilities, it can help with everything from blog posts to code to creative writing.

**Best for:** General writing, brainstorming, and code generation

## 2. Midjourney

For visual content, Midjourney stands out with its exceptional artistic quality. It excels at creating stunning, artistic images from text prompts.

**Best for:** Marketing visuals, concept art, and social media graphics

## 3. Claude by Anthropic

Claude offers nuanced, thoughtful responses with an impressive 200K context window, making it perfect for analyzing long documents or creating extensive content pieces.

**Best for:** Long-form content, document analysis, and research

## 4. Jasper

Jasper is specifically designed for marketing teams, offering templates and workflows optimized for creating marketing copy, social media posts, and ad content.

**Best for:** Marketing copy, email campaigns, and ad content

## 5. Copy.ai

Copy.ai simplifies the copywriting process with dozens of templates for different use cases, from product descriptions to email subject lines.

**Best for:** Quick copy generation and e-commerce content

## 6. Runway

For video content, Runway's Gen-2 model offers impressive video generation and editing capabilities, making professional-quality video accessible to everyone.

**Best for:** Video generation, editing, and visual effects

## 7. ElevenLabs

When it comes to voice content, ElevenLabs produces remarkably realistic text-to-speech and voice cloning, perfect for podcasts, audiobooks, and voiceovers.

**Best for:** Voiceovers, audiobook narration, and podcasts

## 8. Canva Magic Studio

Canva's Magic Studio integrates AI throughout the design process, making it easy to create professional graphics, presentations, and social media content.

**Best for:** Quick designs and social media graphics

## 9. Notion AI

For teams using Notion, the built-in AI assistant helps with writing, summarizing, and brainstorming directly within your workspace.

**Best for:** Team collaboration and documentation

## 10. Stable Diffusion

As an open-source option, Stable Diffusion offers unlimited creativity with the ability to run locally and customize models for specific needs.

**Best for:** Custom image generation and technical users

## Conclusion

These tools represent the cutting edge of AI-assisted content creation. The key is to find the right combination that fits your workflow and creative needs. Start with one or two and gradually expand your AI toolkit as you become more comfortable with the technology.

*What AI tools are you using for content creation? Share your experiences in the comments!*
    `,
    excerpt: "Discover the most powerful AI tools that can supercharge your content creation workflow, from writing to image generation.",
    cover_image: null,
    category: "guides",
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    author_id: null,
  },
  "choose-right-ai-tool-business": {
    id: "2",
    title: "How to Choose the Right AI Tool for Your Business",
    slug: "choose-right-ai-tool-business",
    content: `
# How to Choose the Right AI Tool for Your Business

With hundreds of AI tools flooding the market, choosing the right one for your business can feel overwhelming. This guide will help you navigate the selection process and make informed decisions.

## Understanding Your Needs

Before diving into tool comparisons, take time to understand exactly what problems you're trying to solve:

### Key Questions to Ask

1. **What tasks do you want to automate?**
2. **Who will be using the tool?**
3. **What's your budget?**
4. **Do you need API access for integration?**
5. **What security requirements do you have?**

## Evaluating AI Tools

### 1. Ease of Use

The best AI tool is one your team will actually use. Consider:
- Learning curve
- User interface design
- Available documentation and support
- Training resources

### 2. Pricing Models

AI tools typically offer several pricing structures:
- **Free tiers** - Good for testing but often limited
- **Freemium** - Basic features free, advanced features paid
- **Subscription** - Monthly or annual plans
- **Pay-per-use** - Charges based on usage (API calls, tokens, etc.)

### 3. Integration Capabilities

Consider how the tool fits into your existing workflow:
- Does it offer APIs?
- Are there native integrations with tools you already use?
- Can it connect through automation platforms like Zapier?

### 4. Security and Compliance

For business use, security is paramount:
- Data handling policies
- Compliance certifications (SOC 2, GDPR, etc.)
- On-premise options if needed

## Making the Decision

### Start Small

Don't commit to an enterprise plan immediately:
1. Use free trials extensively
2. Test with a small team first
3. Gather feedback before scaling

### Calculate ROI

Consider both tangible and intangible benefits:
- Time saved
- Quality improvements
- Employee satisfaction
- Competitive advantage

## Conclusion

Choosing the right AI tool is about matching capabilities to your specific needs. Take the time to evaluate options thoroughly, involve key stakeholders, and start with pilot programs before full implementation.

*Need help comparing AI tools? Check out our comparison feature to see tools side by side!*
    `,
    excerpt: "A comprehensive guide to evaluating and selecting AI tools that match your business needs and budget.",
    cover_image: null,
    category: "business",
    published_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    author_id: null,
  },
  "future-ai-assistants-2025": {
    id: "3",
    title: "The Future of AI Assistants: What to Expect in 2025",
    slug: "future-ai-assistants-2025",
    content: `
# The Future of AI Assistants: What to Expect in 2025

The AI assistant landscape is evolving at breakneck speed. Here's what we predict for the coming year and beyond.

## Multimodal Capabilities

### Beyond Text

The next generation of AI assistants will seamlessly handle:
- Text, images, and video in single conversations
- Real-time audio processing
- Document understanding at scale
- Code generation and debugging

### Unified Experiences

Expect to see AI assistants that can:
- Switch between modes naturally
- Understand context across media types
- Generate content in any format from any input

## Personalization at Scale

### Learning Your Preferences

AI assistants will become more personalized:
- Remembering your communication style
- Adapting to your workflow
- Proactively suggesting relevant actions

### Custom Models

We'll see more options for:
- Fine-tuned models for specific industries
- Personal AI that learns from your data
- Team-specific assistants

## Integration Everywhere

### Native AI

AI will be built into:
- Operating systems
- Productivity software
- Communication platforms
- Development environments

### Agentic Capabilities

AI will move from assistant to agent:
- Completing multi-step tasks autonomously
- Managing workflows end-to-end
- Coordinating with other AI systems

## Challenges Ahead

### Trust and Verification

As AI becomes more capable, we'll need:
- Better ways to verify AI-generated content
- Clearer boundaries between AI and human work
- Improved transparency in AI decision-making

### Cost and Accessibility

The industry must address:
- Making advanced AI accessible to all
- Balancing capability with affordability
- Sustainable compute usage

## Conclusion

2025 promises to be a transformative year for AI assistants. The tools will become more capable, more personal, and more integrated into our daily lives. The key will be adopting these technologies thoughtfully while maintaining human oversight and creativity.

*Stay tuned to AI Tools Explorer for updates on the latest developments in the AI space!*
    `,
    excerpt: "Explore upcoming trends in AI assistants and how they will transform the way we work and live.",
    cover_image: null,
    category: "trends",
    published_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    author_id: null,
  },
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    setLoading(true);
    
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", postSlug)
      .eq("is_published", true)
      .maybeSingle();

    if (data) {
      setPost(data);
    } else if (placeholderPosts[postSlug]) {
      setPost(placeholderPosts[postSlug]);
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

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-6 mb-1">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-semibold my-2">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('*') && line.endsWith('*')) {
          return <p key={index} className="italic text-muted-foreground my-4">{line.slice(1, -1)}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        // Handle inline formatting
        const formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        return <p key={index} className="my-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
          <div className="container mx-auto px-4">
            <Link
              to="/blog"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              {post.category && (
                <Badge className="mb-4">{post.category}</Badge>
              )}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(post.published_at || post.created_at)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {estimateReadTime(post.content)} min read
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  AI Tools Team
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div className="container mx-auto px-4 -mt-4">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full max-w-4xl mx-auto rounded-xl shadow-lg aspect-video object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            {renderContent(post.content)}
          </div>
        </article>

        {/* Related posts CTA */}
        <div className="container mx-auto px-4 py-12 border-t">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Explore More Articles</h2>
            <p className="text-muted-foreground mb-6">
              Discover more insights about AI tools and stay updated with the latest trends.
            </p>
            <Button asChild>
              <Link to="/blog">View All Articles</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}