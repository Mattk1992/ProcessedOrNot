import { useCallback } from "react";
import { usePaidUserNavigation } from "@/hooks/use-paid-user-navigation";
import { Button } from "@/components/ui/button";

interface NavigationWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that provides navigation methods with paid user URL modification
 * to child components via render props or context
 */
export function NavigationWrapper({ children, className }: NavigationWrapperProps) {
  const { navigateWithPaidUserSuffix, generatePaidUserUrl, isPaidUser, isRegularUser, accountType } = usePaidUserNavigation();

  // Example usage component showing how to use the navigation methods
  const ExampleUsage = () => (
    <div className={`space-y-4 p-4 border rounded-lg ${className || ''}`}>
      <h3 className="text-lg font-semibold">URL Modification Demo</h3>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Account Type: {accountType || 'Unknown'} {
            isPaidUser ? '(URLs get "?paiduser=true")' :
            isRegularUser ? '(URLs get "?regularuser=true")' :
            '(No URL modification)'
          }
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => navigateWithPaidUserSuffix('/product-lookup')}
          >
            Go to Product Lookup
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigateWithPaidUserSuffix('/nutri-dashboard')}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigateWithPaidUserSuffix('/blog')}
          >
            Go to Blog
          </Button>
        </div>
        <div className="text-xs space-y-1">
          <p><strong>Example URLs generated for {accountType || 'current'} user:</strong></p>
          <p>Product Lookup: <span className="font-mono">{generatePaidUserUrl('/product-lookup')}</span></p>
          <p>Dashboard: <span className="font-mono">{generatePaidUserUrl('/nutri-dashboard')}</span></p>
          <p>Blog: <span className="font-mono">{generatePaidUserUrl('/blog')}</span></p>
          <p>Profile with tab: <span className="font-mono">{generatePaidUserUrl('/profile?tab=account')}</span></p>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {children}
      <ExampleUsage />
    </div>
  );
}

export default NavigationWrapper;