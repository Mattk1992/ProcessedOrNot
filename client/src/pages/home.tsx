import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

export default function Home() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Redirect to marketing page after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = '/marketing';
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
            className="w-24 h-24 mx-auto mb-6 rounded-2xl shadow-lg glow-effect floating-animation"
          />
          <h1 className="text-4xl font-bold text-foreground mb-4 gradient-text text-shadow">
            ProcessedOrNot
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Redirecting to marketing page...
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Or <a href="/marketing" className="text-primary hover:underline">click here</a> to continue manually</p>
        </div>
      </div>
    </div>
  );
}