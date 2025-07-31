import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, 
  Users, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Eye,
  Lock,
  MapPin,
  Clock,
  Info,
  ExternalLink
} from "lucide-react";
import { consentManager, type ConsentData, type ConsentSettings } from '@/lib/consent-manager';

interface ConsentMetrics {
  totalConsents: number;
  consentRate: number;
  personalizedAdsRate: number;
  analyticsRate: number;
  functionalRate: number;
  byRegion: {
    EU: number;
    US: number;
    OTHER: number;
  };
}

export function UserConsentCollection() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [settings, setSettings] = useState<ConsentSettings>({
    showBanner: false,
    forceConsent: false,
    enableRDP: false,
    gppEnabled: false,
    region: 'OTHER'
  });
  const [metrics, setMetrics] = useState<ConsentMetrics>({
    totalConsents: 0,
    consentRate: 0,
    personalizedAdsRate: 0,
    analyticsRate: 0,
    functionalRate: 0,
    byRegion: { EU: 0, US: 0, OTHER: 0 }
  });
  const [showConsentFlow, setShowConsentFlow] = useState(false);
  const [tempPreferences, setTempPreferences] = useState({
    analytics: false,
    advertising: false,
    personalization: false,
    functional: true
  });

  useEffect(() => {
    const currentConsent = consentManager.getConsent();
    const currentSettings = consentManager.getSettings();
    
    setConsent(currentConsent);
    setSettings(currentSettings);
    
    if (currentConsent) {
      setTempPreferences({
        analytics: currentConsent.analytics,
        advertising: currentConsent.advertising,
        personalization: currentConsent.personalization,
        functional: currentConsent.functional
      });
    }

    // Simulate metrics (in real implementation, this would come from analytics)
    setMetrics({
      totalConsents: 1247,
      consentRate: 78.5,
      personalizedAdsRate: 65.2,
      analyticsRate: 82.1,
      functionalRate: 95.8,
      byRegion: { EU: 45, US: 35, OTHER: 20 }
    });
  }, []);

  const handleConsentUpdate = () => {
    const newConsent: Partial<ConsentData> = {
      ...tempPreferences,
      timestamp: Date.now(),
      version: '2025.1',
      region: settings.region
    };

    consentManager.setConsent(newConsent as ConsentData);
    setConsent(consentManager.getConsent());
    setShowConsentFlow(false);
  };

  const handleResetConsent = () => {
    localStorage.removeItem('processedornot-consent');
    localStorage.removeItem('processedornot-consent-settings');
    setConsent(null);
    setTempPreferences({
      analytics: false,
      advertising: false,
      personalization: false,
      functional: true
    });
  };

  const getConsentStatusColor = (hasConsent: boolean) => {
    return hasConsent ? 'text-green-600' : 'text-orange-600';
  };

  const getRegionInfo = () => {
    switch (settings.region) {
      case 'EU':
        return {
          label: 'European Union (GDPR)',
          description: 'Enhanced privacy protections required',
          icon: <Shield className="h-5 w-5 text-blue-600" />,
          requirements: ['Explicit consent required', 'Right to withdraw', 'Data portability', 'Lawful basis required']
        };
      case 'US':
        return {
          label: `United States${settings.enableRDP ? ' (Enhanced)' : ''}`,
          description: settings.enableRDP ? 'State privacy laws apply' : 'Federal privacy standards',
          icon: <MapPin className="h-5 w-5 text-green-600" />,
          requirements: settings.enableRDP 
            ? ['Opt-out rights', 'Do not sell data', 'Sensitive data protection', 'Notice requirements']
            : ['Notice and choice', 'Reasonable security', 'Purpose limitation', 'Data minimization']
        };
      default:
        return {
          label: 'Global Standards',
          description: 'International privacy best practices',
          icon: <Globe className="h-5 w-5 text-gray-600" />,
          requirements: ['Transparent notice', 'User choice', 'Data security', 'Purpose limitation']
        };
    }
  };

  const regionInfo = getRegionInfo();

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          User Consent Collection
        </h1>
        <p className="text-muted-foreground">
          Comprehensive consent management system for Google Publisher Policies compliance
        </p>
      </div>

      {/* Current Consent Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Consent Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {consent ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-orange-600" />
              )}
              <span className={getConsentStatusColor(!!consent)}>
                {consent ? 'Consent Collected' : 'No Consent'}
              </span>
            </div>
            {consent && (
              <p className="text-xs text-gray-500">
                Collected: {new Date(consent.timestamp).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {regionInfo.icon}
              Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{regionInfo.label}</p>
            <p className="text-sm text-gray-600">{regionInfo.description}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              size="sm" 
              onClick={() => setShowConsentFlow(true)}
              className="w-full"
            >
              {consent ? 'Update Preferences' : 'Collect Consent'}
            </Button>
            {consent && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleResetConsent}
                className="w-full"
              >
                Reset Consent
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consent Flow Modal */}
      {showConsentFlow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Preferences
              </CardTitle>
              <CardDescription>
                Choose how your data is used to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Essential Notice */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  We respect your privacy and give you control over how your data is used. 
                  You can change these preferences at any time.
                </AlertDescription>
              </Alert>

              {/* Consent Options */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="functional"
                    checked={tempPreferences.functional}
                    onCheckedChange={(checked) => 
                      setTempPreferences(prev => ({ ...prev, functional: checked as boolean }))
                    }
                    disabled={true}
                  />
                  <div className="space-y-1">
                    <label htmlFor="functional" className="text-sm font-medium leading-none">
                      Essential Functionality <Badge variant="outline">Required</Badge>
                    </label>
                    <p className="text-xs text-gray-600">
                      Necessary for the website to function properly. Includes authentication, 
                      security features, and basic site functionality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="analytics"
                    checked={tempPreferences.analytics}
                    onCheckedChange={(checked) => 
                      setTempPreferences(prev => ({ ...prev, analytics: checked as boolean }))
                    }
                  />
                  <div className="space-y-1">
                    <label htmlFor="analytics" className="text-sm font-medium leading-none">
                      Analytics & Performance
                    </label>
                    <p className="text-xs text-gray-600">
                      Help us understand how you use our site to improve performance and user experience. 
                      Includes Google Analytics and error tracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="advertising"
                    checked={tempPreferences.advertising}
                    onCheckedChange={(checked) => 
                      setTempPreferences(prev => ({ ...prev, advertising: checked as boolean }))
                    }
                  />
                  <div className="space-y-1">
                    <label htmlFor="advertising" className="text-sm font-medium leading-none">
                      Advertising
                    </label>
                    <p className="text-xs text-gray-600">
                      Allow us to show you ads that support our free service. 
                      Ads will be shown regardless, but this enables basic ad functionality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="personalization"
                    checked={tempPreferences.personalization}
                    onCheckedChange={(checked) => 
                      setTempPreferences(prev => ({ ...prev, personalization: checked as boolean }))
                    }
                  />
                  <div className="space-y-1">
                    <label htmlFor="personalization" className="text-sm font-medium leading-none">
                      Personalized Advertising
                    </label>
                    <p className="text-xs text-gray-600">
                      Show ads tailored to your interests based on your browsing behavior. 
                      If disabled, you'll see generic ads instead.
                    </p>
                  </div>
                </div>
              </div>

              {/* Region-specific Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  {regionInfo.icon}
                  {regionInfo.label} Requirements
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {regionInfo.requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleConsentUpdate} className="flex-1">
                  Save Preferences
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowConsentFlow(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {/* Additional Links */}
              <div className="flex flex-wrap gap-4 text-xs">
                <a 
                  href="/privacy" 
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  Privacy Policy
                </a>
                <a 
                  href="https://adssettings.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  Google Ads Settings
                </a>
                <a 
                  href="/privacy-settings" 
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-3 w-3" />
                  Advanced Settings
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Preferences Display */}
      {consent && (
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Current Privacy Preferences
            </CardTitle>
            <CardDescription>
              Your current consent settings and their implications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Essential Functionality</span>
                  <Badge variant={consent.functional ? "default" : "secondary"}>
                    {consent.functional ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Analytics & Performance</span>
                  <Badge variant={consent.analytics ? "default" : "secondary"}>
                    {consent.analytics ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Advertising</span>
                  <Badge variant={consent.advertising ? "default" : "secondary"}>
                    {consent.advertising ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Personalized Advertising</span>
                  <Badge variant={consent.personalization ? "default" : "secondary"}>
                    {consent.personalization ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Consent Version:</span>
                  <span className="text-sm text-gray-600 ml-2">{consent.version}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Region:</span>
                  <span className="text-sm text-gray-600 ml-2">{consent.region}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Last Updated:</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {new Date(consent.timestamp).toLocaleString()}
                  </span>
                </div>
                {consent.tcString && (
                  <div>
                    <span className="text-sm font-medium">TC String:</span>
                    <code className="text-xs bg-gray-100 p-1 rounded ml-2 block mt-1">
                      {consent.tcString.substring(0, 40)}...
                    </code>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consent Metrics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consent Collection Metrics
          </CardTitle>
          <CardDescription>
            Overview of user consent patterns and compliance rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{metrics.totalConsents}</div>
              <div className="text-sm text-gray-600">Total Consents</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.consentRate}%</div>
              <div className="text-sm text-gray-600">Consent Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.personalizedAdsRate}%</div>
              <div className="text-sm text-gray-600">Personalized Ads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.analyticsRate}%</div>
              <div className="text-sm text-gray-600">Analytics</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Consent Breakdown by Purpose</h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Functional (Essential)</span>
                  <span>{metrics.functionalRate}%</span>
                </div>
                <Progress value={metrics.functionalRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Analytics & Performance</span>
                  <span>{metrics.analyticsRate}%</span>
                </div>
                <Progress value={metrics.analyticsRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Personalized Advertising</span>
                  <span>{metrics.personalizedAdsRate}%</span>
                </div>
                <Progress value={metrics.personalizedAdsRate} className="h-2" />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-3">Regional Distribution</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{metrics.byRegion.EU}%</div>
                  <div className="text-sm text-gray-600">EU/GDPR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{metrics.byRegion.US}%</div>
                  <div className="text-sm text-gray-600">US</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{metrics.byRegion.OTHER}%</div>
                  <div className="text-sm text-gray-600">Other</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserConsentCollection;