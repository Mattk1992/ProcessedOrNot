import React from 'react';
import { ResponsiveAd, HeaderBannerAd, SidebarAd, InArticleAd } from './ad-banner';
import { AdMobExample } from './admob-components';
import { useAdManager } from './ad-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AdComponentsDemo() {
  const { config, showAd, canShowAds, isAdBlocked } = useAdManager();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ad System Demo</CardTitle>
          <CardDescription>
            Preview and test different ad components and configurations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={canShowAds ? "default" : "secondary"}>
              Ads: {canShowAds ? "Enabled" : "Disabled"}
            </Badge>
            <Badge variant={config.consentGiven ? "default" : "destructive"}>
              Consent: {config.consentGiven ? "Given" : "Required"}
            </Badge>
            <Badge variant={isAdBlocked ? "destructive" : "default"}>
              Ad Blocker: {isAdBlocked ? "Detected" : "Not Detected"}
            </Badge>
            <Badge variant={config.testMode ? "secondary" : "default"}>
              Mode: {config.testMode ? "Test" : "Production"}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => showAd('banner', 'demo')}
              disabled={!canShowAds}
              size="sm"
            >
              Trigger Banner Ad
            </Button>
            <Button 
              onClick={() => showAd('interstitial', 'demo')}
              disabled={!canShowAds}
              size="sm"
            >
              Trigger Interstitial
            </Button>
            <Button 
              onClick={() => showAd('rewarded', 'demo')}
              disabled={!canShowAds}
              size="sm"
            >
              Trigger Rewarded Ad
            </Button>
          </div>
        </CardContent>
      </Card>

      {config.platform === 'web' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Header Banner Ad</CardTitle>
              <CardDescription>728x90 banner ad for website headers</CardDescription>
            </CardHeader>
            <CardContent>
              <HeaderBannerAd />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Responsive Ad</CardTitle>
              <CardDescription>Auto-responsive ad that adapts to container size</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveAd />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar Ad</CardTitle>
              <CardDescription>300x250 rectangle ad for sidebars</CardDescription>
            </CardHeader>
            <CardContent>
              <SidebarAd />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-Article Ad</CardTitle>
              <CardDescription>Fluid ad designed to blend with article content</CardDescription>
            </CardHeader>
            <CardContent>
              <InArticleAd />
            </CardContent>
          </Card>
        </>
      )}

      {config.platform === 'mobile' && (
        <Card>
          <CardHeader>
            <CardTitle>AdMob Components</CardTitle>
            <CardDescription>Mobile ad components for React Native apps</CardDescription>
          </CardHeader>
          <CardContent>
            <AdMobExample />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdComponentsDemo;