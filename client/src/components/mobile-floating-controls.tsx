import { Sun, Moon, Globe } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import LanguageSwitcher from './language-switcher';

export default function MobileFloatingControls() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Only show for authenticated users on mobile
  if (!isAuthenticated) {
    return null;
  }

  // Hide on product-lookup page
  if (location === '/product-lookup' || location.startsWith('/product-lookup?')) {
    return null;
  }

  return (
    <>
      {/* Dark/Light Theme Toggle - Bottom Left */}
      <div className="fixed bottom-4 left-4 z-50 sm:hidden">
        <div className="bg-background/80 backdrop-blur-md border border-border/20 rounded-full p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <Sun className={`w-3 h-3 transition-colors ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
            <Switch 
              checked={theme === 'dark'}
              onCheckedChange={toggleTheme}
              className="scale-[0.6] mobile-touch-friendly touch-action-manipulation"
            />
            <Moon className={`w-3 h-3 transition-colors ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </div>
      </div>

      {/* Language Switcher - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50 sm:hidden">
        <div className="bg-background/80 backdrop-blur-md border border-border/20 rounded-full p-2 shadow-lg">
          <div className="flex items-center space-x-2">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <div className="text-xs">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}