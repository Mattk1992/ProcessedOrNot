import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import LanguageSwitcher from "./language-switcher";
import HeaderDropdown from "./header-dropdown";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-accent text-white shadow-xl">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <img 
              src={logoPath} 
              alt="ProcessedOrNot Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg floating-animation"
            />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-white">ProcessedOrNot</h1>
              {/* Hide brand subtitle on mobile */}
              <p className="hidden sm:block text-sm text-white/80">Smart Food Scanner</p>
            </div>
          </div>
          
          {/* Rearrange for mobile: language switcher and dropdown with better spacing */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <LanguageSwitcher />
            <HeaderDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}