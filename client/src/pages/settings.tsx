import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, Globe, Palette, Bell, Shield, Download, Trash2, Scan } from "lucide-react";
import { languages, Language } from "@/lib/translations";
import LanguageSwitcher from "@/components/language-switcher";
import { BarcodeDetectionSystem } from "@/components/barcode-scanner";

export default function Settings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [barcodeDetectionSystem, setBarcodeDetectionSystem] = useState<BarcodeDetectionSystem>('auto');

  // Load barcode detection system setting from localStorage
  useEffect(() => {
    const savedSystem = localStorage.getItem('barcodeDetectionSystem') as BarcodeDetectionSystem;
    if (savedSystem && ['auto', 'native', 'zxing'].includes(savedSystem)) {
      setBarcodeDetectionSystem(savedSystem);
    }
  }, []);

  // Save barcode detection system setting to localStorage
  useEffect(() => {
    localStorage.setItem('barcodeDetectionSystem', barcodeDetectionSystem);
  }, [barcodeDetectionSystem]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to access settings.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Data Export",
      description: "Your data export will be sent to your email address.",
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/"}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account preferences and privacy settings</p>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          
          {/* Account Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">First Name</Label>
                  <p className="text-foreground mt-1">{(user as any)?.firstName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Name</Label>
                  <p className="text-foreground mt-1">{(user as any)?.lastName || "Not provided"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Username</Label>
                  <p className="text-foreground mt-1 font-mono">{(user as any)?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-foreground mt-1">{(user as any)?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Account Verified
                </Badge>
                <Badge variant="outline">
                  Member since {new Date((user as any)?.createdAt || Date.now()).getFullYear()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Language & Regional Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Regional Settings
              </CardTitle>
              <CardDescription>
                Choose your preferred language and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Current Language</Label>
                  <p className="text-sm text-muted-foreground">
                    {languages[language].flag} {languages[language].name}
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                Language changes apply immediately across the entire application including navigation, content, and user interface elements.
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose between light and dark mode</p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Detection Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Barcode Detection System
              </CardTitle>
              <CardDescription>
                Choose which barcode detection technology to use for scanning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Detection Engine</Label>
                  <p className="text-sm text-muted-foreground">
                    {barcodeDetectionSystem === 'auto' && 'Automatically choose the best available system'}
                    {barcodeDetectionSystem === 'native' && 'Use browser\'s native BarcodeDetector API (faster)'}
                    {barcodeDetectionSystem === 'zxing' && 'Use ZXing library (more compatible)'}
                  </p>
                </div>
                <Select value={barcodeDetectionSystem} onValueChange={(value: BarcodeDetectionSystem) => setBarcodeDetectionSystem(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="native">Native API</SelectItem>
                    <SelectItem value="zxing">ZXing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <p><strong>Auto:</strong> Automatically selects the best detection system for your browser</p>
                <p><strong>Native API:</strong> Uses browser's built-in barcode detection (Chrome, Edge) - faster but limited browser support</p>
                <p><strong>ZXing:</strong> JavaScript library with broad compatibility across all browsers</p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive product updates via email</p>
                </div>
                <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
                </div>
                <Switch checked={analyticsEnabled} onCheckedChange={setAnalyticsEnabled} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleExportData} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export My Data
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="gap-2">
              Save All Settings
            </Button>
          </div>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}