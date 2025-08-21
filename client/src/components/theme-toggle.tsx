import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
        <Sun className={`w-3 h-3 transition-colors ${theme === 'light' ? 'text-white' : 'text-white/60'}`} />
        <Switch 
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
          className="scale-[0.6] mobile-touch-friendly touch-action-manipulation"
        />
        <Moon className={`w-3 h-3 transition-colors ${theme === 'dark' ? 'text-white' : 'text-white/60'}`} />
    </>
  );
}