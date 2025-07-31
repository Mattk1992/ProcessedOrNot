import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";

interface LayoutProps {
  children: ReactNode;
  onStartTutorial?: () => void;
  showHeader?: boolean;
}

export default function Layout({ children, onStartTutorial, showHeader = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onStartTutorial={onStartTutorial} />
      
      {/* Main Content Area */}
      <main className="ml-0 md:ml-72 transition-all duration-300 ease-in-out min-h-screen">
        {showHeader && <Header />}
        <div className="pt-16 md:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}