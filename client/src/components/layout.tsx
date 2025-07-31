import { ReactNode } from "react";
import Header from "./header";

interface LayoutProps {
  children: ReactNode;
  onStartTutorial?: () => void;
}

export default function Layout({ children, onStartTutorial }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header is now always shown */}
      <Header onStartTutorial={onStartTutorial} />
      
      {/* Main Content Area - no sidebar margin needed */}
      <main className="min-h-screen">
        <div className="pt-16 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}