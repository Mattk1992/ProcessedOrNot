import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  MapPin, 
  Clock, 
  Download, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { consentManager, type ConsentData } from '@/lib/consent-manager';
import { useToast } from '@/hooks/use-toast';

export default function ConsentSettings() {
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [settings, setSettings] = useState(consentManager.getSettings());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateState = () => {
      setConsent(consentManager.getConsent());
      setSettings(consentManager.getSettings());
    };

    updateState();
    const unsubscribe = consentManager.addConsentListener(updateState);
    return unsubscribe;
  }, []);

  const handleConsentChange = (key: keyof ConsentData, value: boolean) => {
    if (!consent) return;
    
    const newConsent = { ...consent, [key]: value };
    consentManager.setConsent(newConsent);
    
    toast({
      title: "Consent Updated",
      description: `${key} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleWithdrawConsent = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      consentManager.withdrawConsent();
      setIsLoading(false);
      
      toast({
        title: "Consent Withdrawn",
        description: "All consent has been withdrawn. You'll see the consent banner again.",
        variant: "destructive"
      });
    }, 1000);
  };

  const handleExportData = () => {
    const data = {
      consent,
      settings,
      exportDate: new Date().toISOString(),
      region: settings.region,
      complianceStrings: {
        tcString: consent?.tcString,
        uspString: consent?.uspString,
        gppString: consent?.gppString
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consent-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Your consent data has been downloaded",
    });
  };

  const getRegionInfo = () => {
    switch (settings.region) {
      case 'EU':
        return {
          label: 'European Union (GDPR)',
          description: 'Enhanced privacy protections under European law',
          icon: <Shield className="h-5 w-5 text-blue-600" />,
          color: 'blue',
          laws: ['GDPR', 'ePrivacy Directive']
        };
      case 'US':
        return {
          label: `United States${settings.detectedState ? ` - ${settings.detectedState}` : ''}`,
          description: settings.enableRDP 
            ? 'Enhanced state privacy protections apply'
            : 'Standard US privacy protections',
          icon: <MapPin className="h-5 w-5 text-green-600" />,
          color: settings.enableRDP ? 'orange' : 'green',
          laws: settings.enableRDP 
            ? ['CCPA', 'State Privacy Laws', 'IAB GPP']
            : ['Federal Privacy Laws']
        };
      default:
        return {
          label: 'Global',
          description: 'Standard privacy protections',
          icon: <Info className="h-5 w-5 text-gray-600" />,
          color: 'gray',
          laws: ['Standard Privacy']
        };
    }
  };

  const regionInfo = getRegionInfo();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy & Consent Settings</h1>
        <p className="text-muted-foreground">
          Manage your privacy preferences and data consent settings
        </p>
      </div>

      {/* Region & Compliance Status */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {regionInfo.icon}
            <div>
              <h3 className="font-semibold text-lg">{regionInfo.label}</h3>
              <p className="text-muted-foreground">{regionInfo.description}</p>
              <div className="flex gap-2 mt-2">
                {regionInfo.laws.map((law) => (
                  <Badge key={law} variant="outline" className="text-xs">
                    {law}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              {consent ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Active Consent</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-600">No Consent</span>
                </>
              )}
            </div>
            {consent && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Since {new Date(consent.timestamp).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Consent Preferences */}
      {consent ? (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Current Consent Preferences</h3>
          
          <div className="space-y-4">
            {/* Functional */}
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div>
                <h4 className="font-medium">Functional Cookies</h4>
                <p className="text-sm text-muted-foreground">Essential website functionality</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Required</Badge>
                <Switch checked={true} disabled={true} />
              </div>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Analytics Cookies</h4>
                <p className="text-sm text-muted-foreground">Website usage analytics and improvements</p>
              </div>
              <Switch 
                checked={consent.analytics} 
                onCheckedChange={(checked) => handleConsentChange('analytics', checked)}
              />
            </div>

            {/* Advertising */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Advertising Cookies</h4>
                <p className="text-sm text-muted-foreground">Personalized ads and revenue support</p>
              </div>
              <Switch 
                checked={consent.advertising} 
                onCheckedChange={(checked) => handleConsentChange('advertising', checked)}
              />
            </div>

            {/* Personalization */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Personalization Cookies</h4>
                <p className="text-sm text-muted-foreground">Customized content and recommendations</p>
              </div>
              <Switch 
                checked={consent.personalization} 
                onCheckedChange={(checked) => handleConsentChange('personalization', checked)}
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-lg">No Active Consent</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            You haven't provided consent yet. Please accept our privacy policy to use all features.
          </p>
          <Button onClick={() => window.location.reload()}>
            Show Consent Banner
          </Button>
        </Card>
      )}

      {/* Technical Information */}
      {consent && (
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-lg mb-4">Technical Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Consent Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>{consent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Region:</span>
                  <span>{consent.region}</span>
                </div>
                {consent.state && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State:</span>
                    <span>{consent.state}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(consent.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Compliance Strings</h4>
              <div className="space-y-2 text-sm">
                {consent.tcString && (
                  <div>
                    <span className="text-muted-foreground">TC String:</span>
                    <code className="block text-xs bg-muted p-1 rounded mt-1 break-all">
                      {consent.tcString.substring(0, 40)}...
                    </code>
                  </div>
                )}
                {consent.uspString && (
                  <div>
                    <span className="text-muted-foreground">US Privacy:</span>
                    <code className="block text-xs bg-muted p-1 rounded mt-1">
                      {consent.uspString}
                    </code>
                  </div>
                )}
                {consent.gppString && (
                  <div>
                    <span className="text-muted-foreground">GPP String:</span>
                    <code className="block text-xs bg-muted p-1 rounded mt-1 break-all">
                      {consent.gppString.substring(0, 40)}...
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Data Management</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportData}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Preferences
          </Button>
          
          {consent && (
            <Button 
              variant="destructive" 
              onClick={handleWithdrawConsent}
              disabled={isLoading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isLoading ? 'Withdrawing...' : 'Withdraw Consent'}
            </Button>
          )}
        </div>

        <Separator className="my-4" />
        
        <div className="text-sm text-muted-foreground">
          <p className="mb-2">
            <strong>Your Rights:</strong> You can update your preferences at any time, 
            export your data, or completely withdraw consent.
          </p>
          {settings.region === 'EU' && (
            <p>
              Under GDPR, you have additional rights including data portability, 
              rectification, and the right to be forgotten.
            </p>
          )}
          {settings.enableRDP && (
            <p>
              Under state privacy laws, you can opt-out of data sales and request 
              deletion of your personal information.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}