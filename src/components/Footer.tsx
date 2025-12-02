import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Tools Explorer
            </span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <Link to="/tools" className="hover:text-primary transition-colors">Tools</Link>
            <Link to="/compare" className="hover:text-primary transition-colors">Compare</Link>
            <Link to="/recommend" className="hover:text-primary transition-colors">Recommend</Link>
          </nav>
          
          <div className="text-sm text-muted-foreground">
            Developed by <span className="font-semibold text-primary">CodeMeetsData</span>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border/30 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AI Tools Explorer. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
