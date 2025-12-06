import { Link } from "react-router-dom";
import { Sparkles, Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/NewsletterForm";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/90 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Tools Explorer
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your ultimate destination for discovering, comparing, and finding the perfect AI tools 
              for your projects. Curated with care by industry experts.
            </p>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full glass">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full glass">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full glass">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full glass">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/tools" className="text-muted-foreground hover:text-primary transition-colors">Browse Tools</Link>
              <Link to="/compare" className="text-muted-foreground hover:text-primary transition-colors">Compare Tools</Link>
              <Link to="/recommend" className="text-muted-foreground hover:text-primary transition-colors">Get Recommendations</Link>
              <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Categories</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link to="/tools?category=llm" className="text-muted-foreground hover:text-primary transition-colors">Language Models</Link>
              <Link to="/tools?category=image_generation" className="text-muted-foreground hover:text-primary transition-colors">Image Generation</Link>
              <Link to="/tools?category=voice" className="text-muted-foreground hover:text-primary transition-colors">Voice & Audio</Link>
              <Link to="/tools?category=automation" className="text-muted-foreground hover:text-primary transition-colors">Automation</Link>
              <Link to="/tools?category=code_assistant" className="text-muted-foreground hover:text-primary transition-colors">Code Assistants</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Stay Updated</h4>
            <p className="text-muted-foreground text-sm">Get the latest AI tools delivered to your inbox weekly.</p>
            <NewsletterForm />
          </div>
        </div>

        <div className="border-t border-border/30 mt-10 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} AI Tools Explorer. All rights reserved.
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Developed with <Heart className="h-4 w-4 text-red-500 mx-1" /> by{" "}
              <span className="font-semibold text-primary ml-1">CodeMeetsData</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;