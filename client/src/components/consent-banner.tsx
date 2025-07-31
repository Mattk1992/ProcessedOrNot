import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Shield, 
  Settings, 
  MapPin, 
  Info, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { consentManager, type ConsentData } from '@/lib/consent-manager';

interface ConsentBannerProps {
  onConsentChange?: (consent: ConsentData | null) => void;
}

export function ConsentBanner({ onConsentChange }: ConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [settings, setSettings] = useState(consentManager.getSettings());
  const [preferences, setPreferences] = useState({
    analytics: false,
    advertising: false,
    personalization: false,
    functional: true
  });

  useEffect(() => {
    const updateState = () => {
      const currentConsent = consentManager.getConsent();
      const currentSettings = consentManager.getSettings();
      
      setConsent(currentConsent);
      setSettings(currentSettings);
      setShowBanner(consentManager.shouldShowBanner());
      
      if (currentConsent) {
        setPreferences({
          analytics: currentConsent.analytics,
          advertising: currentConsent.advertising,
          personalization: currentConsent.personalization,
          functional: currentConsent.functional
        });
      }
    };

    updateState();
    const unsubscribe = consentManager.addConsentListener(updateState);

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (onConsentChange) {
      onConsentChange(consent);
    }
  }, [consent, onConsentChange]);

  const handleAcceptAll = () => {
    consentManager.setConsent({
      analytics: true,
      advertising: true,
      personalization: true,
      functional: true
    });
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    consentManager.setConsent({
      analytics: false,
      advertising: false,
      personalization: false,
      functional: true // Functional always required
    });
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSavePreferences = () => {
    consentManager.setConsent(preferences);
    setShowDetails(false);
    setShowBanner(false);
  };

  const getRegionInfo = () => {
    switch (settings.region) {
      case 'EU':
        return {
          label: 'EU/GDPR',
          icon: <Shield className="h-4 w-4" />,
          color: 'blue',
          description: 'European privacy regulations apply'
        };
      case 'US':
        return {
          label: `US${settings.detectedState ? ` - ${settings.detectedState}` : ''}`,
          icon: <MapPin className="h-4 w-4" />,
          color: settings.enableRDP ? 'orange' : 'green',
          description: settings.enableRDP 
            ? 'State privacy laws apply - Enhanced protections available'
            : 'Standard US privacy protections'
        };
      default:
        return {
          label: 'Global',
          icon: <Info className="h-4 w-4" />,
          color: 'gray',
          description: 'Standard privacy protections'
        };
    }
  };

  const regionInfo = getRegionInfo();

  if (!showBanner && !showDetails) {
    return null;
  }

  return (
    <>
      {/* Main Consent Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="container mx-auto p-4">
            <Card className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Privacy & Cookie Consent</h3>
                    <Badge 
                      variant="outline" 
                      className={`text-${regionInfo.color}-600 border-${regionInfo.color}-200`}
                    >
                      {regionInfo.icon}
                      {regionInfo.label}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    We use cookies and similar technologies to provide personalized content, 
                    analyze traffic, and improve your experience. {regionInfo.description}
                  </p>
                  
                  {settings.region === 'EU' && (
                    <p className="text-xs text-muted-foreground">
                      <strong>GDPR Notice:</strong> Your consent is required for personalized advertising. 
                      You can withdraw consent at any time.
                    </p>
                  )}
                  
                  {settings.enableRDP && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Privacy Rights:</strong> You have the right to opt-out of data sales 
                      and request data deletion under state privacy laws.
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRejectAll}
                    className="whitespace-nowrap"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCustomize}
                    className="whitespace-nowrap"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Customize
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleAcceptAll}
                    className="whitespace-nowrap"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept All
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Detailed Preferences Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Privacy Preferences
            </DialogTitle>
            <DialogDescription>
              Customize your privacy settings. Some features may not work properly 
              if certain cookies are disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Region Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {regionInfo.icon}
                <h4 className="font-medium">Your Privacy Region: {regionInfo.label}</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {regionInfo.description}
              </p>
            </div>

            {/* Consent Categories */}
            <div className="space-y-4">
              {/* Functional Cookies */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                <Checkbox 
                  checked={true} 
                  disabled={true}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Functional Cookies</h4>
                    <Badge variant="secondary">Required</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essential for the website to function properly. These cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, analytics: !!checked }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Analytics Cookies</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us understand how visitors interact with our website 
                    to improve user experience.
                  </p>
                </div>
              </div>

              {/* Advertising Cookies */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  checked={preferences.advertising}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, advertising: !!checked }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Advertising Cookies</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used to show relevant ads and support our free service. 
                    Rejecting may result in less relevant advertising.
                  </p>
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg">
                <Checkbox 
                  checked={preferences.personalization}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, personalization: !!checked }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <h4 className="font-medium">Personalization Cookies</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Remember your preferences and provide customized content 
                    and recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Info */}
            {(settings.region === 'EU' || settings.enableRDP) && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Your Rights</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {settings.region === 'EU' && (
                    <>
                      <li>• Right to access your personal data</li>
                      <li>• Right to rectification and erasure</li>
                      <li>• Right to data portability</li>
                      <li>• Right to withdraw consent at any time</li>
                    </>
                  )}
                  {settings.enableRDP && (
                    <>
                      <li>• Right to opt-out of data sales</li>
                      <li>• Right to delete personal information</li>
                      <li>• Right to non-discrimination</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDetails(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSavePreferences}
              className="flex-1"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ConsentBanner;