import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { usePaidUserNavigation } from './use-paid-user-navigation';

/**
 * Hook that automatically modifies the current URL to include account type suffixes
 * This runs on route changes and ensures URLs always have the proper account type parameter
 */
export function useAutoUrlModifier() {
  const [location, setLocation] = useLocation();
  const { generatePaidUserUrl, hasAccountTypeSuffix } = usePaidUserNavigation();

  useEffect(() => {
    // Only modify URL if we have an account type that should modify URLs
    if (!hasAccountTypeSuffix) return;

    // Parse current URL to check if it already has account type parameters
    const url = new URL(location, window.location.origin);
    const hasAccountParam = url.searchParams.has('paiduser') || 
                           url.searchParams.has('regularuser') || 
                           url.searchParams.has('adminuser');

    // If URL doesn't have account type parameter, add it
    if (!hasAccountParam) {
      const modifiedPath = generatePaidUserUrl(location);
      
      // Only update if the URL actually changed
      if (modifiedPath !== location) {
        // Use replace to avoid adding history entries
        setLocation(modifiedPath, { replace: true });
      }
    }
  }, [location, generatePaidUserUrl, hasAccountTypeSuffix, setLocation]);
}