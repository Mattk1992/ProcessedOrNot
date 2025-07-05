import { useState } from 'react';
import { ChevronDown, User, Settings, Info, HelpCircle, LogIn, UserPlus, LogOut, Shield, Globe, PlayCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import LanguageSwitcher from './language-switcher';

interface HeaderDropdownProps {
  onStartTutorial?: () => void;
}

export default function HeaderDropdown({ onStartTutorial }: HeaderDropdownProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  // Menu items for non-authenticated users
  const guestMenuItems = [
    {
      label: 'Sign In',
      icon: <LogIn className="w-4 h-4" />,
      action: () => setLocation('/login')
    },
    {
      label: 'Create Account',
      icon: <UserPlus className="w-4 h-4" />,
      action: () => setLocation('/register')
    },
    {
      label: t('dropdown.about') || 'About us',
      icon: <Info className="w-4 h-4" />,
      action: () => setLocation('/about')
    },
    {
      label: t('dropdown.help') || 'Help',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => setLocation('/help')
    },
    ...(onStartTutorial ? [{
      label: 'Take Tour',
      icon: <PlayCircle className="w-4 h-4" />,
      action: () => {
        onStartTutorial();
        setIsOpen(false);
      }
    }] : [])
  ];

  // Menu items for authenticated users
  const userMenuItems = [
    ...((user as any)?.role === 'Admin' ? [{
      label: 'Admin Panel',
      icon: <Shield className="w-4 h-4" />,
      action: () => setLocation('/admin')
    }] : []),
    {
      label: t('dropdown.settings') || 'Settings',
      icon: <Settings className="w-4 h-4" />,
      action: () => setLocation('/settings')
    },
    {
      label: t('dropdown.about') || 'About us',
      icon: <Info className="w-4 h-4" />,
      action: () => setLocation('/about')
    },
    {
      label: t('dropdown.help') || 'Help',
      icon: <HelpCircle className="w-4 h-4" />,
      action: () => setLocation('/help')
    },
    ...(onStartTutorial ? [{
      label: 'Take Tour',
      icon: <PlayCircle className="w-4 h-4" />,
      action: () => {
        onStartTutorial();
        setIsOpen(false);
      }
    }] : []),
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      action: handleLogout
    }
  ];

  const menuItems = isAuthenticated ? userMenuItems : guestMenuItems;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center space-x-1 sm:space-x-3 px-2 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 dropdown-button-glow touch-action-manipulation ${isOpen ? 'from-white/25 to-white/15 scale-105' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-300 group-hover:scale-110" />
          {isAuthenticated && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          )}
        </div>
        <span className="text-white text-xs sm:text-sm font-semibold tracking-wide hidden xs:inline">
          {isAuthenticated ? (user as any)?.username || 'User' : t('dropdown.menu') || 'Menu'}
        </span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-white/80 transition-all duration-300 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
      </button>

      {isOpen && (
        <>
          {/* Enhanced Backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Enhanced Dropdown Menu */}
          <div className="absolute left-0 mt-3 w-72 max-w-[calc(100vw-2rem)] sm:max-w-[18rem] mobile-dropdown bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-800/90 rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 z-50 overflow-hidden backdrop-blur-xl dropdown-menu-enhanced">
            
            {/* Header with user info */}
            {isAuthenticated && (
              <div className="px-6 py-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-white/20 dark:border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center user-avatar-glow">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(user as any)?.firstName && (user as any)?.lastName ? 
                        `${(user as any).firstName} ${(user as any).lastName}` : 
                        (user as any)?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(user as any)?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Menu Items */}
            <div className="py-3">
              {/* Language Switcher for mobile */}
              <div className="px-6 py-3 sm:hidden">
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                      Language
                    </span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
              
              {/* Divider for mobile */}
              <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 mx-6 my-2"></div>
              
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="group flex items-center w-full px-6 py-3 text-left transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:scale-[1.02] relative overflow-hidden dropdown-item-hover-effect dropdown-item-stagger"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center"></div>
                  
                  <div className="flex items-center space-x-4 relative z-10">
                    <div className={`p-2 rounded-lg transition-all duration-200 ${
                      item.label === 'Sign Out' ? 
                        'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/30' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-primary/20 group-hover:text-primary'
                    }`}>
                      {item.icon}
                    </div>
                    <div>
                      <span className={`text-sm font-medium transition-colors duration-200 ${
                        item.label === 'Sign Out' ? 
                          'text-red-700 dark:text-red-300 group-hover:text-red-800 dark:group-hover:text-red-200' :
                          'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                  
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
            
            {/* Enhanced Footer */}
            <div className="border-t border-white/20 dark:border-gray-700/50 px-6 py-4 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  ProcessedOrNot v1.0.0
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full status-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}