import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface SearchTrackingData {
  searchInput: string;
  searchType: 'barcode' | 'text';
  productBarcode?: string;
  productName?: string;
  productBrand?: string;
  foundResult: boolean;
  processingScore?: number;
  dataSource?: string;
}

export function useSearchTracking() {
  const { isAuthenticated, isLoading } = useAuth();

  const trackSearchMutation = useMutation({
    mutationFn: async (searchData: SearchTrackingData) => {
      if (!isAuthenticated || isLoading) return null;
      
      return await apiRequest("/api/search-history", {
        method: "POST",
        body: searchData
      });
    },
    onError: (error) => {
      // Silently fail for authentication errors to not spam logs
      if (!error.message.includes('401') && !error.message.includes('Unauthorized')) {
        console.error("Failed to track search:", error);
      }
    }
  });

  const trackSearch = (searchData: SearchTrackingData) => {
    // Only track if user is authenticated and not still loading
    if (isAuthenticated && !isLoading) {
      trackSearchMutation.mutate(searchData);
    }
  };

  return {
    trackSearch,
    isTracking: trackSearchMutation.isPending
  };
}