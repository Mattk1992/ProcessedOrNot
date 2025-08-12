import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for handling URL navigation with automatic "=paiduser" suffix for paid users
 */
export function usePaidUserNavigation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  /**
   * Navigate to a URL with automatic "=paiduser" suffix for paid users
   * @param path - The base path to navigate to
   * @param options - Additional navigation options
   */
  const navigateWithPaidUserSuffix = useCallback((path: string, options?: { replace?: boolean }) => {
    let finalPath = path;
    
    // Add =paiduser suffix for paid users
    if (user?.accountType === 'Paid') {
      // Check if path already has query parameters
      const hasQueryParams = path.includes('?');
      const hasFragment = path.includes('#');
      
      if (hasFragment) {
        // Insert before fragment
        const [pathPart, fragment] = path.split('#');
        const separator = pathPart.includes('?') ? '&' : '?';
        finalPath = `${pathPart}${separator}paiduser=true#${fragment}`;
      } else if (hasQueryParams) {
        // Append to existing query parameters
        finalPath = `${path}&paiduser=true`;
      } else {
        // Add as first query parameter
        finalPath = `${path}?paiduser=true`;
      }
    }

    setLocation(finalPath, options);
  }, [user?.accountType, setLocation]);

  /**
   * Generate a URL with automatic "=paiduser" suffix for paid users
   * @param path - The base path
   * @returns The modified path for paid users, or original path for regular users
   */
  const generatePaidUserUrl = useCallback((path: string): string => {
    if (user?.accountType !== 'Paid') {
      return path;
    }

    // Check if path already has query parameters
    const hasQueryParams = path.includes('?');
    const hasFragment = path.includes('#');
    
    if (hasFragment) {
      // Insert before fragment
      const [pathPart, fragment] = path.split('#');
      const separator = pathPart.includes('?') ? '&' : '?';
      return `${pathPart}${separator}paiduser=true#${fragment}`;
    } else if (hasQueryParams) {
      // Append to existing query parameters
      return `${path}&paiduser=true`;
    } else {
      // Add as first query parameter
      return `${path}?paiduser=true`;
    }
  }, [user?.accountType]);

  /**
   * Check if current user is a paid user
   */
  const isPaidUser = user?.accountType === 'Paid';

  return {
    navigateWithPaidUserSuffix,
    generatePaidUserUrl,
    isPaidUser,
    accountType: user?.accountType
  };
}