import React from 'react';
import { Adsense } from '@ctrl/react-adsense';
import { useAdManager } from './ad-manager';

interface AdBannerProps {
  slot: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
  layout?: string;
  className?: string;
}

export default function AdBanner({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  responsive = true,
  layout,
  className = '' 
}: AdBannerProps) {
  const { canShowAds, isGloballyEnabled } = useAdManager();
  
  // Get client ID from environment variable
  const client = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID;

  // Don't render if ads are globally disabled
  if (!isGloballyEnabled) {
    return null;
  }

  // Don't render if no client ID is configured
  if (!client) {
    console.warn('Google AdSense client ID not configured. Set VITE_GOOGLE_ADSENSE_CLIENT_ID in environment variables.');
    return null;
  }

  // Don't render if ads cannot be shown (consent, ad blocker, etc.)
  if (!canShowAds) {
    return null;
  }

  return (
    <div className={`ad-container ${className}`} style={{ minWidth: '300px', minHeight: '250px', ...style }}>
      <Adsense
        client={client}
        slot={slot}
        style={style}
        format={format}
        responsive={responsive ? 'true' : 'false'}
        layout={layout}
        adTest={import.meta.env.DEV ? 'on' : undefined} // Test mode in development
      />
    </div>
  );
}

// Pre-configured ad components for common sizes
export function HeaderBannerAd({ className = '' }: { className?: string }) {
  const { isGloballyEnabled } = useAdManager();
  
  if (!isGloballyEnabled) {
    return null;
  }
  
  return (
    <AdBanner
      slot="8527084986" // Your banner ad unit ID
      style={{ width: 728, height: 90 }}
      format=""
      responsive={false}
      className={`header-banner-ad ${className}`}
    />
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  const { isGloballyEnabled } = useAdManager();
  
  if (!isGloballyEnabled) {
    return null;
  }
  
  return (
    <AdBanner
      slot="8527084986" // Your banner ad unit ID
      style={{ width: 300, height: 250 }}
      format=""
      responsive={false}
      className={`sidebar-ad ${className}`}
    />
  );
}

export function ResponsiveAd({ className = '' }: { className?: string }) {
  const { isGloballyEnabled } = useAdManager();
  
  if (!isGloballyEnabled) {
    return null;
  }
  
  return (
    <AdBanner
      slot="8527084986" // Your banner ad unit ID
      style={{ display: 'block' }}
      format="auto"
      responsive={true}
      className={`responsive-ad ${className}`}
    />
  );
}

export function InArticleAd({ className = '' }: { className?: string }) {
  const { isGloballyEnabled } = useAdManager();
  
  if (!isGloballyEnabled) {
    return null;
  }
  
  return (
    <AdBanner
      slot="8527084986" // Your banner ad unit ID
      style={{ display: 'block' }}
      format="fluid"
      layout="in-article"
      className={`in-article-ad ${className}`}
    />
  );
}

// Specialized banner ad with your specific ad unit ID
export function CustomBannerAd({ 
  className = '', 
  width = 728, 
  height = 90, 
  responsive = false 
}: { 
  className?: string; 
  width?: number; 
  height?: number; 
  responsive?: boolean; 
}) {
  const { isGloballyEnabled } = useAdManager();
  
  if (!isGloballyEnabled) {
    return null;
  }
  
  return (
    <AdBanner
      slot="8527084986" // ca-app-pub-1163701043339821/8527084986
      style={responsive ? { display: 'block' } : { width, height }}
      format={responsive ? "auto" : ""}
      responsive={responsive}
      className={`custom-banner-ad ${className}`}
    />
  );
}