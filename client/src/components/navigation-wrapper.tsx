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
  const { navigateWithPaidUserSuffix, generatePaidUserUrl, isPaidUser } = usePaidUserNavigation();

  // Example usage component showing how to use the navigation methods
  const ExampleUsage = () => (
    <div className={`space-y-4 p-4 border rounded-lg ${className || ''}`}>
      <h3 className="text-lg font-semibold">URL Modification Demo</h3>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Account Type: {isPaidUser ? 'Paid User' : 'Regular User'}
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
          <p><strong>Example URLs generated:</strong></p>
          <p>Product Lookup: {generatePaidUserUrl('/product-lookup')}</p>
          <p>Dashboard: {generatePaidUserUrl('/nutri-dashboard')}</p>
          <p>Blog: {generatePaidUserUrl('/blog')}</p>
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