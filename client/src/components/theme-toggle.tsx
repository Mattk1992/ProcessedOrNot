import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-background/80 backdrop-blur-md border border-border/20 rounded-full p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <Sun className={`w-4 h-4 transition-colors ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
          <Switch 
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="scale-75"
          />
          <Moon className={`w-4 h-4 transition-colors ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
      </div>
    </div>
  );
}