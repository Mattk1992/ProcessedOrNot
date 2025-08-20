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
  dailyCaloriesGoal?: number;
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
      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - increased to reduce requests
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection time
    refetchOnWindowFocus: false, // Disabled to reduce excessive requests
    refetchOnReconnect: true,
    refetchInterval: false, // Disabled automatic polling
  });

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: !!data?.user && !error,
    error,
    refetch,
  };
}