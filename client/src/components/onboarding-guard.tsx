import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import OnboardingPopup from "./onboarding-popup";

export default function OnboardingGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showOnboardingPopup, setShowOnboardingPopup] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);

  // Check if we should show the onboarding popup
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !hasShownPopup) {
      // Show popup if user is authenticated and onboarding is not completed
      const shouldShowPopup = !user.onboardingCompleted;
      
      if (shouldShowPopup) {
        setShowOnboardingPopup(true);
        setHasShownPopup(true);
      }
    }
  }, [isLoading, isAuthenticated, user, hasShownPopup]);

  const handleContinueOnboarding = () => {
    setShowOnboardingPopup(false);
    setLocation("/onboarding");
  };

  const handleSkipOnboarding = () => {
    setShowOnboardingPopup(false);
    // User can continue using the app without onboarding
    // The popup won't show again until they log in again
  };

  const handleClosePopup = () => {
    setShowOnboardingPopup(false);
  };

  // Don't render anything while loading or if user is not authenticated
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  return (
    <OnboardingPopup
      isOpen={showOnboardingPopup}
      onClose={handleClosePopup}
      onContinue={handleContinueOnboarding}
      onSkip={handleSkipOnboarding}
    />
  );
}