import { ReactNode } from "react";
import Header from "./header";
import MobileFloatingControls from "./mobile-floating-controls";

interface LayoutProps {
  children: ReactNode;
  onStartTutorial?: () => void;
}

export default function Layout({ children, onStartTutorial }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header is now always shown */}
      <Header onStartTutorial={onStartTutorial} />
      
      {/* Mobile Floating Controls for authenticated users */}
      <MobileFloatingControls />
      
      {/* Main Content Area - no sidebar margin needed */}
      <main className="min-h-screen">
        <div className="pt-12 sm:pt-14 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}