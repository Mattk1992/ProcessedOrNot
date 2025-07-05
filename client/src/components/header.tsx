import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import LanguageSwitcher from "./language-switcher";
import HeaderDropdown from "./header-dropdown";
import { Scan, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="relative bg-gradient-to-r from-primary via-primary/90 to-accent text-white shadow-2xl border-b border-white/10">
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 animate-pulse-slow" />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      
      {/* Animated beam effect */}
      <div className="header-beam" />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            {/* Enhanced logo with glow effect */}
            <div className="relative">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl shadow-2xl floating-animation flex-shrink-0 ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300 logo-glow"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
            </div>
            
            {/* Enhanced title section */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-3xl font-bold text-white truncate tracking-tight text-shadow">
                  ProcessedOrNot
                </h1>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse hidden sm:block drop-shadow-lg" />
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Scan className="w-3 h-3 sm:w-4 sm:h-4 text-white/80 hidden md:block" />
                <p className="text-xs sm:text-sm text-white/90 hidden md:block font-medium text-shadow">
                  Smart Food Scanner & Analyzer
                </p>
              </div>
            </div>
          </div>
          
          {/* Enhanced navigation section */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="hidden sm:block">
              <div className="header-glass rounded-lg p-1 transition-all duration-300">
                <LanguageSwitcher />
              </div>
            </div>
            <div className="header-glass rounded-lg transition-all duration-300 hover:scale-105">
              <HeaderDropdown />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </header>
  );
}