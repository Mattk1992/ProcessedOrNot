import { Link } from "wouter";
import { usePaidUserNavigation } from "@/hooks/use-paid-user-navigation";

interface PaidUserLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  state?: unknown;
}

/**
 * Enhanced Link component that automatically appends "=paiduser" for paid users
 */
export function PaidUserLink({ to, children, ...props }: PaidUserLinkProps) {
  const { generatePaidUserUrl } = usePaidUserNavigation();
  
  const modifiedTo = generatePaidUserUrl(to);
  
  return (
    <Link to={modifiedTo} {...props}>
      {children}
    </Link>
  );
}

export default PaidUserLink;