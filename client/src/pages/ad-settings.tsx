import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAdManager, ResponsiveAd, AdMobExample } from '@/components/ads';
import Header from '@/components/header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Smartphone, Globe, Settings, AlertCircle } from 'lucide-react';

export default function AdSettings() {
  const { config, updateConfig, isAdBlocked, canShowAds } = useAdManager();
  const [showClientId, setShowClientId] = useState(false);
  const [tempClientId, setTempClientId] = useState(config.adsenseClientId || '');
  const [tempAppId, setTempAppId] = useState(config.admobAppId || '');

  const handleSaveConfig = () => {
    updateConfig({
      adsenseClientId: tempClientId,
      admobAppId: tempAppId
    });
    alert('Ad configuration saved successfully!');
  };

  const handleConsentToggle = (consentGiven: boolean) => {
    updateConfig({ consentGiven });
    localStorage.setItem('ad-consent', consentGiven.toString());
  };

  const handleTestModeToggle = (testMode: boolean) => {
    updateConfig({ testMode });
  };

  const handlePlatformChange = (platform: 'web' | 'mobile') => {
    updateConfig({ platform });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Ad Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure Google AdSense and AdMob integration for monetization
            </p>
          </div>

          {/* Ad Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Ad System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant={canShowAds ? "default" : "secondary"}>
                    {canShowAds ? "Ads Enabled" : "Ads Disabled"}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Current Status</p>
                </div>
                <div className="text-center">
                  <Badge variant={isAdBlocked ? "destructive" : "default"}>
                    {isAdBlocked ? "Ad Blocker Detected" : "No Ad Blocker"}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Ad Blocker Status</p>
                </div>
                <div className="text-center">
                  <Badge variant={config.platform === 'web' ? "default" : "secondary"}>
                    Platform: {config.platform}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">Current Platform</p>
                </div>
              </div>
              
              {isAdBlocked && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    An ad blocker has been detected. Ads will not display until the ad blocker is disabled.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Platform Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure which platform you're targeting for ad display
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Target Platform</Label>
                <Select value={config.platform} onValueChange={handlePlatformChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Web (Google AdSense)
                      </div>
                    </SelectItem>
                    <SelectItem value="mobile">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Mobile (Google AdMob)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Google AdSense Configuration */}
          {config.platform === 'web' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Google AdSense Configuration
                </CardTitle>
                <CardDescription>
                  Configure AdSense for web application monetization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adsense-client">AdSense Client ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="adsense-client"
                      type={showClientId ? "text" : "password"}
                      value={tempClientId}
                      onChange={(e) => setTempClientId(e.target.value)}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowClientId(!showClientId)}
                    >
                      {showClientId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Your Google AdSense publisher ID (starts with ca-pub-)
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    To get your AdSense Client ID:
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to your Google AdSense dashboard</li>
                      <li>Navigate to Account → Account Settings</li>
                      <li>Copy your Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Google AdMob Configuration */}
          {config.platform === 'mobile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Google AdMob Configuration
                </CardTitle>
                <CardDescription>
                  Configure AdMob for mobile application monetization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admob-app">AdMob App ID</Label>
                  <Input
                    id="admob-app"
                    value={tempAppId}
                    onChange={(e) => setTempAppId(e.target.value)}
                    placeholder="ca-app-pub-XXXXXXXX~XXXXXXXXXX"
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Your Google AdMob application ID
                  </p>
                  {config.admobAppId && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">AdMob configured: {config.admobAppId}</span>
                    </div>
                  )}
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    To get your AdMob App ID:
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Go to your Google AdMob console</li>
                      <li>Select your app</li>
                      <li>Copy the App ID (ca-app-pub-XXXXXXXX~XXXXXXXXXX)</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Ad Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Ad Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>User Consent</Label>
                  <p className="text-sm text-gray-500">Allow personalized ads and data collection</p>
                </div>
                <Switch
                  checked={config.consentGiven}
                  onCheckedChange={handleConsentToggle}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>Test Mode</Label>
                  <p className="text-sm text-gray-500">Show test ads during development</p>
                </div>
                <Switch
                  checked={config.testMode}
                  onCheckedChange={handleTestModeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Configuration */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleSaveConfig} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>

          {/* Ad Preview */}
          {config.platform === 'web' && config.adsenseClientId && (
            <Card>
              <CardHeader>
                <CardTitle>Ad Preview</CardTitle>
                <CardDescription>
                  Preview how ads will appear on your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveAd className="border-2 border-dashed border-gray-300 dark:border-gray-600" />
              </CardContent>
            </Card>
          )}

          {/* AdMob Preview */}
          {config.platform === 'mobile' && (
            <Card>
              <CardHeader>
                <CardTitle>AdMob Preview</CardTitle>
                <CardDescription>
                  Preview how mobile ads will appear (React Native implementation)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdMobExample />
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}