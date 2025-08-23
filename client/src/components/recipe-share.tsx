import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recipe {
  id: string;
  title: string;
  description?: string;
  image?: string;
  source: string;
}

interface RecipeShareProps {
  recipe: Recipe;
  className?: string;
}

export default function RecipeShare({ recipe, className }: RecipeShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const recipeUrl = `${window.location.origin}/recipes/${recipe.id}`;
  const shareText = `Check out this recipe: ${recipe.title}`;
  
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(recipeUrl);
      setCopied(true);
      toast({
        title: "URL Copied",
        description: "Recipe URL copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = recipeUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast({
        title: "URL Copied",
        description: "Recipe URL copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${recipeUrl}`)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const handleSignalShare = () => {
    // Signal doesn't have a direct web share API, so we copy the URL and show instructions
    handleCopyUrl();
    toast({
      title: "Share via Signal",
      description: "URL copied! Open Signal and paste in your conversation.",
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`px-2 py-1 h-auto min-w-0 shadow-lg bg-white dark:bg-gray-800 ${className}`}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">W</span>
            </div>
            Share on WhatsApp
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">f</span>
            </div>
            Share on Facebook
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSignalShare} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">S</span>
            </div>
            Share via Signal
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopyUrl} className="cursor-pointer">
          <div className="flex items-center gap-2">
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy URL
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}