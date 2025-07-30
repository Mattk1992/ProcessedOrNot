import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface RewardStatus {
  currentCount: number;
  maxCount: number;
  needsReward: boolean;
  rewardUrl?: string | null;
}

export function useRewardSystem() {
  const [showRewardModal, setShowRewardModal] = useState(false);
  const queryClient = useQueryClient();

  // Get current reward status
  const { data: rewardStatus, refetch: refetchRewardStatus } = useQuery<RewardStatus>({
    queryKey: ["/api/rewards/status"],
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });

  // Reset reward count mutation
  const resetRewardMutation = useMutation({
    mutationFn: async (rewardParam: string) => {
      const response = await fetch("/api/rewards/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rewardParam }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset reward count");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refresh the reward status
      refetchRewardStatus();
      setShowRewardModal(false);
    },
  });

  // Check URL parameters for reward completion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rewardParam = urlParams.get("reward");
    
    if (rewardParam === "product-search") {
      // User visited the reward URL, reset the count
      resetRewardMutation.mutate("product-search");
      
      // Clean up URL without triggering page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Show reward modal when reward is needed
  useEffect(() => {
    if (rewardStatus?.needsReward && !showRewardModal) {
      setShowRewardModal(true);
    }
  }, [rewardStatus?.needsReward, showRewardModal]);

  const openRewardUrl = () => {
    if (rewardStatus?.rewardUrl) {
      window.open(rewardStatus.rewardUrl, "_blank");
    }
  };

  const checkRewardBeforeAction = async (): Promise<boolean> => {
    await refetchRewardStatus();
    const status = await queryClient.fetchQuery({
      queryKey: ["/api/rewards/status"],
    });
    
    return !(status as RewardStatus)?.needsReward;
  };

  return {
    rewardStatus,
    showRewardModal,
    setShowRewardModal,
    openRewardUrl,
    resetReward: resetRewardMutation.mutate,
    isResettingReward: resetRewardMutation.isPending,
    checkRewardBeforeAction,
    refetchRewardStatus,
  };
}