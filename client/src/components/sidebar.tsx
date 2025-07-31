import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Camera, 
  BarChart3,
  Shield,
  Info,
  Share2,
  Lock,
  FileText,
  LogIn,
  LogOut,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface SidebarProps {
  onStartTutorial?: () => void;
}

export default function Sidebar({ onStartTutorial }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleNavigation = (path: string) => {
    setLocation(path);
    setIsMobileOpen(false); // Close mobile menu on navigation
  };

  // Navigation items for non-authenticated users
  const guestMenuItems = [
    { type: 'section', label: 'Navigation' },
    {
      label: 'Home',
      icon: Home,
      path: '/',
      description: 'Return to homepage'
    },
    {
      label: 'Product Scanner',
      icon: Camera,
      path: '/product-lookup',
      description: 'Scan product barcodes'
    },
    { type: 'divider' },
    
    { type: 'section', label: 'Account' },
    {
      label: 'Sign In',
      icon: LogIn,
      path: '/login',
      description: 'Access your account'
    },
    { type: 'divider' },
    ...(onStartTutorial ? [
      { type: 'divider' },
      {
        label: 'Take Tour',
        icon: PlayCircle,
        action: () => {
          onStartTutorial();
          setIsMobileOpen(false);
        },
        description: 'Learn how to use the app'
      }
    ] : [])
  ];

  // Navigation items for authenticated users
  const userMenuItems = [
    { type: 'section', label: 'Navigation' },
    {
      label: 'Home',
      icon: Home,
      path: '/',
      description: 'Return to homepage'
    },
    {
      label: 'Product Scanner',
      icon: Camera,
      path: '/product-lookup',
      description: 'Scan product barcodes'
    },
    { type: 'divider' },
    
    { type: 'section', label: 'Nutrition Tracking' },
    {
      label: 'Dashboard',
      icon: BarChart3,
      path: '/nutri-dashboard',
      description: 'Your nutrition overview'
    },
    { type: 'divider' },
    
    // Admin Panel (if admin)
    ...(user?.accountType === 'Admin' ? [
      { type: 'section', label: 'Administration' },
      {
        label: 'Admin Panel',
        icon: Shield,
        path: '/admin',
        description: 'System administration'
      },
      { type: 'divider' }
    ] : []),
    ...(onStartTutorial ? [
      { type: 'divider' },
      {
        label: 'Take Tour',
        icon: PlayCircle,
        action: () => {
          onStartTutorial();
          setIsMobileOpen(false);
        },
        description: 'Learn how to use the app'
      }
    ] : []),
    { type: 'divider' },
    {
      label: 'Sign Out',
      icon: LogOut,
      action: handleLogout,
      description: 'Leave your account'
    }
  ];

  const menuItems = isAuthenticated ? userMenuItems : guestMenuItems;

  const renderMenuItem = (item: any, index: number) => {
    if (item.type === 'section') {
      return (
        <div key={index} className={`px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed && item.label}
        </div>
      );
    }

    if (item.type === 'divider') {
      return <div key={index} className="mx-4 my-2 border-t border-border/50" />;
    }

    const isActive = item.path && location === item.path;
    const IconComponent = item.icon;

    const handleClick = () => {
      if (item.action) {
        item.action();
      } else if (item.path) {
        handleNavigation(item.path);
      }
    };

    return (
      <button
        key={index}
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group
          ${isActive 
            ? 'bg-primary/10 text-primary border-r-2 border-primary font-medium' 
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }
          ${isCollapsed ? 'justify-center px-2' : ''}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <IconComponent 
          className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} 
        />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{item.label}</div>
            {item.description && (
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                {item.description}
              </div>
            )}
          </div>
        )}
      </button>
    );
  };

  // Hide sidebar for non-authenticated users and regular users (only show for admins)
  if (!isAuthenticated || (user as any)?.accountType !== 'Admin') {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-primary text-white p-3 rounded-xl shadow-lg hover:bg-primary/90 transition-colors"
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full bg-background/95 backdrop-blur-sm border-r border-border shadow-lg z-40
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-72'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className={`p-4 border-b border-border flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src={logoPath} 
                alt="ProcessedOrNot Logo" 
                className="w-8 h-8 rounded-lg flex-shrink-0"
              />
              <div className="min-w-0">
                <h2 className="font-bold text-sm truncate">ProcessedOrNot</h2>
                <p className="text-xs text-muted-foreground">Smart Food Scanner</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <img 
              src={logoPath} 
              alt="ProcessedOrNot Logo" 
              className="w-8 h-8 rounded-lg"
            />
          )}
          
          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-accent transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && (
          <div className={`p-4 border-b border-border ${isCollapsed ? 'text-center' : ''}`}>
            {!isCollapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">
                    {user?.firstName || user?.username || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {user?.accountType || 'Regular'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-border text-center ${isCollapsed ? 'px-2' : ''}`}>
          <div className="text-xs text-muted-foreground">
            {!isCollapsed && 'ProcessedOrNot Scanner'}
          </div>
        </div>
      </aside>
    </>
  );
}