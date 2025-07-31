import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: ReactNode;
  onStartTutorial?: () => void;
  showHeader?: boolean;
}

export default function Layout({ children, onStartTutorial, showHeader = false }: LayoutProps) {
  const { isAuthenticated, user } = useAuth();
  
  // Check if sidebar should be shown (only for authenticated admins)
  const showSidebar = isAuthenticated && (user as any)?.accountType === 'Admin';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onStartTutorial={onStartTutorial} />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 ease-in-out min-h-screen ${
        showSidebar ? 'ml-0 md:ml-72' : 'ml-0'
      }`}>
        {showHeader && <Header />}
        <div className="pt-16 md:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}