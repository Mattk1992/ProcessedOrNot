import { useState } from 'react';
import { ChevronDown, User, Settings, Info, HelpCircle, LogIn, UserPlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation } from 'wouter';

export default function HeaderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  const menuItems = [
    {
      label: 'Sign In',
      icon: <LogIn className="w-4 h-4" />,
      action: () => {
        setLocation('/login');
      }
    },
    {
      label: 'Create Account',
      icon: <UserPlus className="w-4 h-4" />,
      action: () => {
        setLocation('/register');
      }
    },
    {
      label: t('dropdown.about') || 'About',
      icon: <Info className="w-4 h-4" />,
      action: () => {
        setLocation('/about');
      }
    },
    {
      label: t('dropdown.help') || 'Help',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => {
        setLocation('/help');
      }
    },
    {
      label: t('dropdown.settings') || 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        console.log('Settings clicked');
      }
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30 shadow-lg"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <User className="w-5 h-5 text-white" />
        <span className="text-white text-sm font-medium">
          {t('dropdown.menu') || 'Menu'}
        </span>
        <ChevronDown className={`w-4 h-4 text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-20 overflow-hidden">
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-500">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">
                      {item.label}
                    </span>
                  </div>

                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {t('dropdown.version')} v1.0.0
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}