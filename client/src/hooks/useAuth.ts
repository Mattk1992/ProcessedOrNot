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
  onboardingCompleted?: boolean;
}

interface AuthResponse {
  user: AuthUser;
}

export function useAuth() {
  const { data, isLoading, error, refetch } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: (failureCount, error: any) => {
      // Don't retry on 401 (unauthorized) errors
      if (error?.status === 401) return false;
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced for better responsiveness)
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // Periodic refresh every 5 minutes to maintain session
  });

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user && !error,
    error,
    refetch,
  };
}