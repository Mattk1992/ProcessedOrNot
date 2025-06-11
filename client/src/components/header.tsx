import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";
import LanguageSwitcher from "./language-switcher";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary to-accent text-white shadow-xl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={logoPath} 
              alt="ProcessedOrNot Logo" 
              className="w-12 h-12 rounded-xl shadow-lg floating-animation"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">ProcessedOrNot</h1>
              <p className="text-sm text-white/80">Smart Food Scanner</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}