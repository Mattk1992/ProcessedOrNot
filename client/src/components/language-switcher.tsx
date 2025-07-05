import { useLanguage } from '@/contexts/LanguageContext';
import { languages, Language } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLanguage, setHoveredLanguage] = useState<Language | null>(null);
  const [justChanged, setJustChanged] = useState(false);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
    setJustChanged(true);
    setTimeout(() => setJustChanged(false), 600);
  };

  useEffect(() => {
    if (justChanged) {
      // Trigger flag bounce animation when language changes
      const flagElement = document.querySelector('.language-flag-current');
      if (flagElement) {
        flagElement.classList.add('language-flag-bounce');
        setTimeout(() => {
          flagElement.classList.remove('language-flag-bounce');
        }, 600);
      }
    }
  }, [justChanged]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 sm:gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg group overflow-hidden relative language-selector-glow px-2 sm:px-3"
        >
          <Globe className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-300 group-hover:rotate-12" />
          {/* Always show flag on mobile, name on larger screens */}
          <span className={`text-lg sm:text-xl transition-transform duration-300 group-hover:scale-110 flag-transition language-flag-current ${justChanged ? 'language-flag-bounce' : ''}`}>
            {languages[language].flag}
          </span>
          <span className="hidden lg:inline transition-all duration-300 group-hover:text-primary text-sm">
            {languages[language].name}
          </span>
          {justChanged && (
            <Sparkles className="h-3 w-3 text-yellow-500 animate-spin absolute -top-1 -right-1" />
          )}
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-72 p-3 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 language-dropdown-enter glass-card border-2 border-primary/20"
      >
        <div className="mb-3 px-3 py-2 text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-3 w-3 animate-pulse" />
          {t('language.select')}
        </div>
        {Object.entries(languages).map(([code, { name, flag }], index) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            onMouseEnter={() => setHoveredLanguage(code as Language)}
            onMouseLeave={() => setHoveredLanguage(null)}
            className="flex items-center gap-4 cursor-pointer p-4 rounded-xl transition-all duration-300 hover:bg-primary/10 hover:scale-[1.02] hover:shadow-lg group relative overflow-hidden language-item-hover"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Flag with enhanced animations */}
            <div className="relative">
              <span 
                className={`text-3xl transition-all duration-400 flag-transition ${
                  hoveredLanguage === code ? 'scale-125 rotate-6' : 'scale-100'
                } ${language === code ? 'language-flag-pulse' : ''}`}
              >
                {flag}
              </span>
              {hoveredLanguage === code && (
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              )}
            </div>
            
            {/* Language name with enhanced slide animation */}
            <div className="flex-1">
              <span 
                className={`font-semibold text-base transition-all duration-300 block ${
                  hoveredLanguage === code ? 'translate-x-2 text-primary' : 'translate-x-0'
                }`}
              >
                {name}
              </span>
              {hoveredLanguage === code && (
                <span className="text-xs text-muted-foreground opacity-0 animate-in slide-in-from-left-2 duration-300 opacity-100">
                  Click to switch
                </span>
              )}
            </div>
            
            {/* Enhanced check mark with glow effect */}
            {language === code && (
              <div className="relative">
                <Check className="h-5 w-5 text-green-500 animate-in zoom-in-50 bounce-in-50 duration-300" />
                <div className="absolute inset-0 rounded-full bg-green-500/30 animate-pulse" />
              </div>
            )}
            
            {/* Active language indicator with gradient */}
            {language === code && (
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-green-400 via-blue-500 to-purple-600 rounded-r-xl shadow-lg" />
            )}
            
            {/* Enhanced hover effects */}
            <div 
              className={`absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 transition-all duration-400 ${
                hoveredLanguage === code ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`} 
            />
            
            {/* Shimmer effect on hover */}
            {hoveredLanguage === code && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            )}
          </DropdownMenuItem>
        ))}
        
        {/* Enhanced current language display at bottom */}
        <div className="mt-4 pt-3 border-t border-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
          <div className="flex items-center justify-center gap-3 px-3 py-2 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground">{t('language.current')}:</span>
            <div className="flex items-center gap-2">
              <span className="text-xl language-flag-pulse">{languages[language].flag}</span>
              <span className="font-bold text-primary text-sm">{languages[language].name}</span>
            </div>
            {justChanged && (
              <div className="flex items-center gap-1 text-green-500 animate-in slide-in-from-right-2 duration-300">
                <Check className="h-3 w-3" />
                <span className="text-xs font-medium">Updated!</span>
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}