import { Link as WouterLink } from 'wouter';
import { usePaidUserNavigation } from '@/hooks/use-paid-user-navigation';
import { forwardRef } from 'react';

interface PaidUserLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  replace?: boolean;
}

/**
 * Enhanced Link component that automatically adds account type suffixes to URLs
 * This replaces the standard wouter Link with automatic URL modification
 */
export const PaidUserLink = forwardRef<HTMLAnchorElement, PaidUserLinkProps>(
  ({ href, children, className, onClick, replace, ...props }, ref) => {
    const { generatePaidUserUrl } = usePaidUserNavigation();
    
    // Generate URL with account type suffix
    const modifiedHref = generatePaidUserUrl(href);
    
    return (
      <WouterLink 
        href={modifiedHref} 
        className={className}
        onClick={onClick}
        replace={replace}
        ref={ref}
        {...props}
      >
        {children}
      </WouterLink>
    );
  }
);

PaidUserLink.displayName = 'PaidUserLink';

export default PaidUserLink;