import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  mobile?: boolean;
}

export default function ThemeToggle({ mobile = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  if (mobile) {
    // Mobile header version
    return (
      <div className="bg-white/10 hover:bg-white/20 rounded-xl p-2 transition-all duration-300 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:scale-105">
        <div className="flex items-center space-x-2">
          <Sun className={`w-3 h-3 transition-colors ${theme === 'light' ? 'text-white' : 'text-white/60'}`} />
          <Switch 
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="scale-75 mobile-touch-friendly touch-action-manipulation"
          />
          <Moon className={`w-3 h-3 transition-colors ${theme === 'dark' ? 'text-white' : 'text-white/60'}`} />
        </div>
      </div>
    );
  }

  // Desktop floating version (hidden on mobile since it's in header)
  return (
    <div className="fixed bottom-4 left-4 z-50 hidden sm:block">
      <div className="bg-background/80 backdrop-blur-md border border-border/20 rounded-full p-2 sm:p-3 shadow-lg">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Sun className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
          <Switch 
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="scale-75 sm:scale-75 mobile-touch-friendly touch-action-manipulation"
          />
          <Moon className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </div>
  );
}