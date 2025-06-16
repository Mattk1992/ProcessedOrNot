import { useState } from "react";
import { Share2, Facebook, Twitter, Instagram, Link, Download, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";

interface SocialShareProps {
  productName: string;
  processingScore: number;
  processingExplanation: string;
  barcode: string;
  nutriments?: Record<string, any> | null;
  dataSource: string;
}

export default function SocialShare({
  productName,
  processingScore,
  processingExplanation,
  barcode,
  nutriments,
  dataSource
}: SocialShareProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100';
    if (score <= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 3) return t('social.score.minimal');
    if (score <= 6) return t('social.score.moderate');
    return t('social.score.high');
  };

  const generateShareableCard = async () => {
    setIsGenerating(true);
    
    try {
      // Create a temporary div for the shareable card
      const cardElement = document.createElement('div');
      cardElement.style.cssText = `
        width: 600px;
        padding: 32px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: white;
        position: absolute;
        top: -9999px;
        left: -9999px;
      `;

      cardElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">${productName}</h1>
          <p style="opacity: 0.9; margin: 0; font-size: 14px;">${t('social.analyzed_with')} ProcessedOrNot Scanner</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; padding: 12px 24px; background: rgba(255,255,255,0.2); border-radius: 25px; margin-bottom: 12px;">
              <span style="font-size: 28px; font-weight: bold;">${processingScore}/10</span>
            </div>
            <p style="margin: 0; font-size: 16px; font-weight: 600;">${getScoreLabel(processingScore)}</p>
          </div>
          
          ${nutriments ? `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px;">
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold;">${Math.round(nutriments.energy_100g || 0)}</div>
                <div style="font-size: 12px; opacity: 0.8;">${t('nutrition.energy')} (kcal)</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold;">${Math.round(nutriments.sugars_100g || 0)}g</div>
                <div style="font-size: 12px; opacity: 0.8;">${t('nutrition.sugars')}</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold;">${Math.round(nutriments.fat_100g || 0)}g</div>
                <div style="font-size: 12px; opacity: 0.8;">${t('nutrition.fat')}</div>
              </div>
              <div style="text-align: center;">
                <div style="font-size: 20px; font-weight: bold;">${Math.round(nutriments.proteins_100g || 0)}g</div>
                <div style="font-size: 12px; opacity: 0.8;">${t('nutrition.protein')}</div>
              </div>
            </div>
          ` : ''}
        </div>
        
        <div style="text-align: center; opacity: 0.8;">
          <p style="margin: 0; font-size: 12px;">${t('social.scan_more')} • ProcessedOrNot Scanner</p>
        </div>
      `;

      document.body.appendChild(cardElement);

      // Generate image using html2canvas
      const canvas = await html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });

      document.body.removeChild(cardElement);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_nutrition_analysis.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: t('social.download.success'),
            description: t('social.download.description'),
          });
        }
      }, 'image/png');
      
    } catch (error) {
      console.error('Error generating shareable card:', error);
      toast({
        title: t('social.download.error'),
        description: t('social.download.error_description'),
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${t('social.facebook.text')} "${productName}" - ${t('social.processing_score')}: ${processingScore}/10`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${t('social.twitter.text')} "${productName}" - ${t('social.processing_score')}: ${processingScore}/10 🥗 #NutritionAnalysis #HealthyEating #ProcessedOrNot`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`${t('social.linkedin.title')} ${productName}`);
    const summary = encodeURIComponent(`${t('social.linkedin.summary')} ${processingScore}/10. ${processingExplanation.substring(0, 200)}...`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank', 'width=600,height=400');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      toast({
        title: t('social.link.copied'),
        description: t('social.link.description'),
      });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      toast({
        title: t('social.link.error'),
        description: t('social.link.error_description'),
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('social.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('social.description')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={generateShareableCard}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? t('social.generating') : t('social.download')}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {t('social.share')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={shareToFacebook} className="cursor-pointer">
                  <Facebook className="w-4 h-4 mr-2 text-blue-600" />
                  {t('social.facebook.share')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToTwitter} className="cursor-pointer">
                  <Twitter className="w-4 h-4 mr-2 text-sky-500" />
                  {t('social.twitter.share')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToLinkedIn} className="cursor-pointer">
                  <svg className="w-4 h-4 mr-2 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  {t('social.linkedin.share')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={copyLink} className="cursor-pointer">
                  {linkCopied ? (
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <Link className="w-4 h-4 mr-2" />
                  )}
                  {linkCopied ? t('social.link.copied') : t('social.link.copy')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Preview of sharing content */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
          <div className="flex items-start space-x-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(processingScore)}`}>
              {processingScore}/10
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                "{productName}" - {getScoreLabel(processingScore)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {processingExplanation.substring(0, 120)}...
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}