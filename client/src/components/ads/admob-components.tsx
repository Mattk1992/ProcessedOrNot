import React from 'react';

// Note: These components are prepared for React Native AdMob integration
// They will work when the app is converted to React Native

interface AdMobBannerProps {
  adUnitId: string;
  size?: 'BANNER' | 'LARGE_BANNER' | 'MEDIUM_RECTANGLE' | 'FULL_BANNER' | 'LEADERBOARD';
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
}

interface AdMobInterstitialProps {
  adUnitId: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
}

interface AdMobRewardedProps {
  adUnitId: string;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onRewarded?: (reward: { type: string; amount: number }) => void;
}

// Banner Ad Component (for React Native)
export function AdMobBanner({
  adUnitId,
  size = 'BANNER',
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed
}: AdMobBannerProps) {
  // This is a placeholder for web - would work in React Native
  return (
    <div className="admob-banner-placeholder">
      <div className="placeholder-ad">
        <p className="text-xs text-gray-500">AdMob Banner Ad</p>
        <p className="text-xs text-gray-400">Size: {size}</p>
        <p className="text-xs text-gray-400">Unit ID: {adUnitId}</p>
      </div>
    </div>
  );
}

// Interstitial Ad Hook (for React Native)
export function useAdMobInterstitial({
  adUnitId,
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed
}: AdMobInterstitialProps) {
  const showInterstitial = () => {
    console.log('Showing interstitial ad:', adUnitId);
    // In React Native, this would trigger the actual interstitial ad
    if (onAdOpened) onAdOpened();
    
    // Simulate ad close after 3 seconds
    setTimeout(() => {
      if (onAdClosed) onAdClosed();
    }, 3000);
  };

  const loadInterstitial = () => {
    console.log('Loading interstitial ad:', adUnitId);
    // In React Native, this would load the actual ad
    if (onAdLoaded) onAdLoaded();
  };

  return {
    showInterstitial,
    loadInterstitial,
    isLoaded: true // Simulated for web
  };
}

// Rewarded Ad Hook (for React Native)
export function useAdMobRewarded({
  adUnitId,
  onAdLoaded,
  onAdFailedToLoad,
  onAdOpened,
  onAdClosed,
  onRewarded
}: AdMobRewardedProps) {
  const showRewardedAd = () => {
    console.log('Showing rewarded ad:', adUnitId);
    // In React Native, this would trigger the actual rewarded ad
    if (onAdOpened) onAdOpened();
    
    // Simulate reward after 5 seconds
    setTimeout(() => {
      if (onRewarded) onRewarded({ type: 'coin', amount: 100 });
      if (onAdClosed) onAdClosed();
    }, 5000);
  };

  const loadRewardedAd = () => {
    console.log('Loading rewarded ad:', adUnitId);
    // In React Native, this would load the actual ad
    if (onAdLoaded) onAdLoaded();
  };

  return {
    showRewardedAd,
    loadRewardedAd,
    isLoaded: true // Simulated for web
  };
}

// Test Ad Unit IDs (for development)
export const TEST_AD_UNIT_IDS = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917'
};

// Production Ad Unit IDs (using your AdMob App ID)
export const PRODUCTION_AD_UNIT_IDS = {
  APP_ID: 'ca-app-pub-1163701043339821~8067371248',
  BANNER: 'ca-app-pub-1163701043339821/1234567890', // You'll need to create these in AdMob console
  INTERSTITIAL: 'ca-app-pub-1163701043339821/2345678901',
  REWARDED: 'ca-app-pub-1163701043339821/3456789012'
};

// AdMob Configuration Types
export interface AdMobConfig {
  androidAppId: string;
  iosAppId: string;
  testDeviceIds?: string[];
  tagForChildDirectedTreatment?: boolean;
  tagForUnderAgeOfConsent?: boolean;
  maxAdContentRating?: 'G' | 'PG' | 'T' | 'MA';
}

// AdMob Initialization (for React Native)
export const initializeAdMob = (config: AdMobConfig) => {
  console.log('Initializing AdMob with config:', config);
  // In React Native, this would initialize the actual AdMob SDK
  // Example:
  // import { AdMob } from 'react-native-google-mobile-ads';
  // AdMob.initialize(config);
};

// Example usage component
export function AdMobExample() {
  const interstitial = useAdMobInterstitial({
    adUnitId: TEST_AD_UNIT_IDS.INTERSTITIAL,
    onAdLoaded: () => console.log('Interstitial loaded'),
    onAdClosed: () => console.log('Interstitial closed')
  });

  const rewarded = useAdMobRewarded({
    adUnitId: TEST_AD_UNIT_IDS.REWARDED,
    onRewarded: (reward) => console.log('User rewarded:', reward),
    onAdClosed: () => console.log('Rewarded ad closed')
  });

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold">AdMob Components (React Native Ready)</h3>
      
      <AdMobBanner 
        adUnitId={TEST_AD_UNIT_IDS.BANNER}
        size="BANNER"
      />
      
      <div className="space-x-4">
        <button 
          onClick={interstitial.showInterstitial}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Show Interstitial
        </button>
        
        <button 
          onClick={rewarded.showRewardedAd}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Show Rewarded Ad
        </button>
      </div>
    </div>
  );
}