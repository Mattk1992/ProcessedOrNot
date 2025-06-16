import { useQuery } from "@tanstack/react-query";

interface AuthResponse {
  user?: any;
}

export function useAuth() {
  const { data: response, isLoading, error } = useQuery<AuthResponse>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract user from response object
  const user = response?.user || null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}