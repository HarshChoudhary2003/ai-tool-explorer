import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-secondary flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="text-center max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-8xl sm:text-9xl font-bold gradient-text mb-6"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            404
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">
            Page Not Found
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="glow">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="glass">
              <Link to="/tools">
                <Search className="h-4 w-4 mr-2" />
                Browse Tools
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Tried to access: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;