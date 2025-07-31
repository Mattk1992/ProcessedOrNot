// GPT Reward System Hook
// Manages the 5-click reward ad system using Google Publisher Tag

import { useState, useEffect } from 'react';
import { gptAdManager } from '@/lib/gpt-ads';
import { trackEvent } from '@/lib/analytics';

interface GPTRewardState {
  clickCount: number;
  maxClicks: number;
  needsRewardAd: boolean;
  isShowingAd: boolean;
  isAdAvailable: boolean;
}

export function useGPTRewards(maxClicks: number = 5) {
  const [state, setState] = useState<GPTRewardState>({
    clickCount: 0,
    maxClicks,
    needsRewardAd: false,
    isShowingAd: false,
    isAdAvailable: false
  });

  // Initialize GPT and check ad availability
  useEffect(() => {
    const initializeGPT = async () => {
      try {
        const available = await gptAdManager.checkAdAvailability();
        setState(prev => ({ ...prev, isAdAvailable: available }));
      } catch (error) {
        console.error('Failed to initialize GPT rewards:', error);
        setState(prev => ({ ...prev, isAdAvailable: false }));
      }
    };

    initializeGPT();
  }, []);

  // Load saved click count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('gpt-reward-click-count');
    if (savedCount) {
      const count = parseInt(savedCount, 10);
      setState(prev => ({
        ...prev,
        clickCount: count,
        needsRewardAd: count >= maxClicks
      }));
    }
  }, [maxClicks]);

  // Save click count to localStorage
  const saveClickCount = (count: number) => {
    localStorage.setItem('gpt-reward-click-count', count.toString());
  };

  // Increment click count and check if reward ad is needed
  const incrementClickCount = (): boolean => {
    setState(prev => {
      const newCount = prev.clickCount + 1;
      const needsAd = newCount >= maxClicks;
      
      saveClickCount(newCount);
      
      // Track the click event
      trackEvent('camera_scan_attempt', 'reward_system', 'click_tracking', newCount);
      
      return {
        ...prev,
        clickCount: newCount,
        needsRewardAd: needsAd
      };
    });

    return state.clickCount + 1 >= maxClicks;
  };

  // Show reward ad and reset counter
  const showRewardAd = async (): Promise<boolean> => {
    if (!state.isAdAvailable || state.isShowingAd) {
      return false;
    }

    setState(prev => ({ ...prev, isShowingAd: true }));

    try {
      // Track reward ad request
      trackEvent('reward_ad_requested', 'reward_system', 'gpt_interstitial');

      // Show the GPT reward ad
      const adShown = await gptAdManager.showRewardAd();

      // Wait for ad duration (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Reset state after ad completion
      setState(prev => ({
        ...prev,
        clickCount: 0,
        needsRewardAd: false,
        isShowingAd: false
      }));
      
      saveClickCount(0);
      
      if (adShown) {
        // Track successful ad display
        trackEvent('reward_ad_completed', 'reward_system', 'gpt_interstitial');
        return true;
      } else {
        // Track ad failure
        trackEvent('reward_ad_failed', 'reward_system', 'gpt_interstitial');
        return false;
      }
    } catch (error) {
      console.error('Error showing reward ad:', error);
      
      // Reset state on error to avoid blocking user
      setState(prev => ({
        ...prev,
        clickCount: 0,
        needsRewardAd: false,
        isShowingAd: false
      }));
      
      saveClickCount(0);
      
      // Track error
      trackEvent('reward_ad_error', 'reward_system', 'gpt_interstitial');
      
      return false;
    }
  };

  // Reset click count manually (for testing or admin purposes)
  const resetClickCount = () => {
    setState(prev => ({
      ...prev,
      clickCount: 0,
      needsRewardAd: false
    }));
    
    saveClickCount(0);
    
    trackEvent('reward_count_reset', 'reward_system', 'manual_reset');
  };

  // Check if action should be blocked and handle reward ad
  const checkRewardBeforeAction = async (): Promise<boolean> => {
    const needsAd = incrementClickCount();
    
    if (needsAd && state.isAdAvailable) {
      const adShown = await showRewardAd();
      return true; // Always allow action after ad attempt
    }
    
    return true; // Allow action if no ad needed or ads not available
  };

  return {
    clickCount: state.clickCount,
    maxClicks: state.maxClicks,
    needsRewardAd: state.needsRewardAd,
    isShowingAd: state.isShowingAd,
    isAdAvailable: state.isAdAvailable,
    showRewardAd,
    resetClickCount,
    checkRewardBeforeAction,
    remainingClicks: Math.max(0, state.maxClicks - state.clickCount)
  };
}