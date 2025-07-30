import React from 'react';
import { Adsense } from '@ctrl/react-adsense';

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
  // Get client ID from environment variable
  const client = import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT_ID;

  // Don't render if no client ID is configured
  if (!client) {
    console.warn('Google AdSense client ID not configured. Set VITE_GOOGLE_ADSENSE_CLIENT_ID in environment variables.');
    return null;
  }

  return (
    <div className={`ad-container ${className}`}>
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
  return (
    <AdBanner
      slot="3116259775" // Using your actual AdSense slot ID
      style={{ width: 728, height: 90 }}
      format=""
      responsive={false}
      className={`header-banner-ad ${className}`}
    />
  );
}

export function SidebarAd({ className = '' }: { className?: string }) {
  return (
    <AdBanner
      slot="3116259775" // Using your actual AdSense slot ID
      style={{ width: 300, height: 250 }}
      format=""
      responsive={false}
      className={`sidebar-ad ${className}`}
    />
  );
}

export function ResponsiveAd({ className = '' }: { className?: string }) {
  return (
    <AdBanner
      slot="3116259775" // Using your actual AdSense slot ID
      style={{ display: 'block' }}
      format="auto"
      responsive={true}
      className={`responsive-ad ${className}`}
    />
  );
}

export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <AdBanner
      slot="3116259775" // Using your actual AdSense slot ID
      style={{ display: 'block' }}
      format="fluid"
      layout="in-article"
      className={`in-article-ad ${className}`}
    />
  );
}