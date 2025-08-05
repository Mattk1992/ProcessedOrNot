import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
// Simple logo for redirect page
const logoPath = "/generated-icon.png";

export default function Home() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Redirect to product-lookup after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/product-lookup';
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <img 
            src={logoPath} 
            alt="ProcessedOrNot Logo" 
            className="w-16 h-16 mx-auto mb-4 rounded-xl"
          />
          <h1 className="text-3xl font-bold text-foreground mb-4 gradient-text">
            ProcessedOrNot
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Redirecting to scanner...
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Or <a href="/product-lookup" className="text-primary hover:underline">click here</a> to continue manually</p>
        </div>
      </div>
    </div>
  );
}