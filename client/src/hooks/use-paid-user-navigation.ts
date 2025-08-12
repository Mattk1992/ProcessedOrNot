import { useCallback } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

/**
 * Custom hook for handling URL navigation with automatic account type suffixes
 * - Paid users get "=paiduser" suffix
 * - Regular users get "=regularuser" suffix
 * - Admin users get "=adminuser" suffix
 */
export function usePaidUserNavigation() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  /**
   * Navigate to a URL with automatic account type suffix
   * @param path - The base path to navigate to
   * @param options - Additional navigation options
   */
  const navigateWithPaidUserSuffix = useCallback((path: string, options?: { replace?: boolean }) => {
    let finalPath = path;
    
    // Add account type suffix based on user type
    let accountParam = '';
    if (user?.accountType === 'Paid') {
      accountParam = 'paiduser=true';
    } else if (user?.accountType === 'Regular') {
      accountParam = 'regularuser=true';
    } else if (user?.accountType === 'Admin') {
      accountParam = 'adminuser=true';
    }
    
    if (accountParam) {
      // Check if path already has query parameters
      const hasQueryParams = path.includes('?');
      const hasFragment = path.includes('#');
      
      if (hasFragment) {
        // Insert before fragment
        const [pathPart, fragment] = path.split('#');
        const separator = pathPart.includes('?') ? '&' : '?';
        finalPath = `${pathPart}${separator}${accountParam}#${fragment}`;
      } else if (hasQueryParams) {
        // Append to existing query parameters
        finalPath = `${path}&${accountParam}`;
      } else {
        // Add as first query parameter
        finalPath = `${path}?${accountParam}`;
      }
    }

    setLocation(finalPath, options);
  }, [user?.accountType, setLocation]);

  /**
   * Generate a URL with automatic account type suffix
   * @param path - The base path
   * @returns The modified path with account type parameter
   */
  const generatePaidUserUrl = useCallback((path: string): string => {
    // Determine account parameter based on user type
    let accountParam = '';
    if (user?.accountType === 'Paid') {
      accountParam = 'paiduser=true';
    } else if (user?.accountType === 'Regular') {
      accountParam = 'regularuser=true';
    } else if (user?.accountType === 'Admin') {
      accountParam = 'adminuser=true';
    }
    
    if (!accountParam) {
      return path;
    }

    // Check if path already has query parameters
    const hasQueryParams = path.includes('?');
    const hasFragment = path.includes('#');
    
    if (hasFragment) {
      // Insert before fragment
      const [pathPart, fragment] = path.split('#');
      const separator = pathPart.includes('?') ? '&' : '?';
      return `${pathPart}${separator}${accountParam}#${fragment}`;
    } else if (hasQueryParams) {
      // Append to existing query parameters
      return `${path}&${accountParam}`;
    } else {
      // Add as first query parameter
      return `${path}?${accountParam}`;
    }
  }, [user?.accountType]);

  /**
   * Check if current user is a paid user
   */
  const isPaidUser = user?.accountType === 'Paid';
  
  /**
   * Check if current user is a regular user
   */
  const isRegularUser = user?.accountType === 'Regular';

  /**
   * Check if current user is an admin user
   */
  const isAdminUser = user?.accountType === 'Admin';

  // Debug logging
  console.log('usePaidUserNavigation Debug:', {
    user: user,
    accountType: user?.accountType,
    isPaidUser,
    isRegularUser,
    isAdminUser,
    hasAccountTypeSuffix: isPaidUser || isRegularUser || isAdminUser
  });

  return {
    navigateWithPaidUserSuffix,
    generatePaidUserUrl,
    isPaidUser,
    isRegularUser,
    isAdminUser,
    accountType: user?.accountType,
    hasAccountTypeSuffix: isPaidUser || isRegularUser || isAdminUser
  };
}