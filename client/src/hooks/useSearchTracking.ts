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
  const { isAuthenticated } = useAuth();

  const trackSearchMutation = useMutation({
    mutationFn: async (searchData: SearchTrackingData) => {
      if (!isAuthenticated) return null;
      
      return await apiRequest("/api/search-history", {
        method: "POST",
        body: searchData
      });
    },
    onError: (error) => {
      console.error("Failed to track search:", error);
      // Silently fail to not disrupt user experience
    }
  });

  const trackSearch = (searchData: SearchTrackingData) => {
    if (isAuthenticated) {
      trackSearchMutation.mutate(searchData);
    }
  };

  return {
    trackSearch,
    isTracking: trackSearchMutation.isPending
  };
}