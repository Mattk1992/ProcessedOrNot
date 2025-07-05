import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import LanguageSwitcher from "./language-switcher";
import HeaderDropdown from "./header-dropdown";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-accent text-white shadow-xl">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <img 
              src={logoPath} 
              alt="ProcessedOrNot Logo" 
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl shadow-lg floating-animation flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-white truncate">ProcessedOrNot</h1>
              <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Smart Food Scanner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <HeaderDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}