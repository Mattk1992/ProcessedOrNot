import { useQuery } from "@tanstack/react-query";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  accountType: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthResponse {
  user: AuthUser;
}

export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user && !error,
    refetch,
  };
}