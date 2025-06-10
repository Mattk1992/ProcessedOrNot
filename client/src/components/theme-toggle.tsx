import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass-effect rounded-full px-4 py-3 shadow-lg pt-[8px] pb-[8px] ml-[0px] mr-[0px] mt-[29px] mb-[29px] pl-[67px] pr-[67px]">
        <div className="flex items-center space-x-3">
          <Sun className={`w-4 h-4 transition-colors ${
            theme === 'light' ? 'text-yellow-500' : 'text-muted-foreground'
          }`} />
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-primary"
          />
          <Moon className={`w-4 h-4 transition-colors ${
            theme === 'dark' ? 'text-blue-400' : 'text-muted-foreground'
          }`} />
        </div>
      </div>
    </div>
  );
}