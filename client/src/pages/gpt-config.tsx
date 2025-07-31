// GPT Configuration Dashboard
// Administrative interface for Google Publisher Tag reward ad system

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Target, 
  BarChart3, 
  Shield, 
  PlayCircle, 
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Users
} from "lucide-react";
import { gptAdManager } from "@/lib/gpt-ads";
import { useGPTRewards } from "@/hooks/useGPTRewards";
import { GPTTestPanel } from "@/components/gpt-test-panel";

export default function GPTConfigPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [adPerformance, setAdPerformance] = useState({
    totalRequests: 0,
    successfulAds: 0,
    failedAds: 0,
    revenue: 0
  });

  const gptRewards = useGPTRewards(5);

  useEffect(() => {
    loadMetrics();
    // Load performance data from localStorage
    const savedPerformance = localStorage.getItem('gpt-ad-performance');
    if (savedPerformance) {
      setAdPerformance(JSON.parse(savedPerformance));
    }
  }, []);

  const loadMetrics = () => {
    const currentMetrics = gptAdManager.getAdMetrics();
    setMetrics(currentMetrics);
  };

  const updateConfiguration = async () => {
    setIsLoading(true);
    try {
      await gptAdManager.forceReinitialize();
      loadMetrics();
    } catch (error) {
      console.error('Configuration update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPerformanceData = () => {
    const resetData = {
      totalRequests: 0,
      successfulAds: 0,
      failedAds: 0,
      revenue: 0
    };
    setAdPerformance(resetData);
    localStorage.setItem('gpt-ad-performance', JSON.stringify(resetData));
  };

  const successRate = adPerformance.totalRequests > 0 
    ? ((adPerformance.successfulAds / adPerformance.totalRequests) * 100).toFixed(1)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">GPT Configuration Dashboard</h1>
          <p className="text-muted-foreground">Manage Google Publisher Tag reward ad system</p>
        </div>
        <Button onClick={loadMetrics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {metrics?.initialized ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">
                    {metrics?.initialized ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  GPT initialization status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reward Trigger</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gptRewards.clickCount}/{gptRewards.maxClicks}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clicks until next reward ad
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Ad display success rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {adPerformance.totalRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {adPerformance.successfulAds}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful Ads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {adPerformance.failedAds}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed Ads</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${adPerformance.revenue.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Est. Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Unit Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Publisher ID</Label>
                  <Input value={metrics?.publisherId || ''} disabled />
                </div>
                <div>
                  <Label>Ad Unit ID</Label>
                  <Input value={metrics?.adUnitId || ''} disabled />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={metrics?.testMode || false} 
                  disabled
                />
                <Label>Test Mode</Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Reward Trigger Settings</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Clicks per reward</Label>
                    <Input value={gptRewards.maxClicks} disabled />
                  </div>
                  <div>
                    <Label className="text-sm">Ad Duration</Label>
                    <Input value="5 seconds" disabled />
                  </div>
                </div>
              </div>

              <Button 
                onClick={updateConfiguration} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Updating...' : 'Update Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <GPTTestPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ad Performance Analytics</CardTitle>
              <Button 
                onClick={resetPerformanceData} 
                variant="outline" 
                size="sm"
              >
                Reset Data
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Detailed metrics display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">System Information</h4>
                    <div className="text-sm space-y-1">
                      <div>Initialized: {metrics?.initialized ? 'Yes' : 'No'}</div>
                      <div>Ad Slot Available: {metrics?.adSlotAvailable ? 'Yes' : 'No'}</div>
                      <div>Test Mode: {metrics?.testMode ? 'Enabled' : 'Disabled'}</div>
                      <div>Last Updated: {metrics?.timestamp}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Targeting Settings</h4>
                    <div className="text-sm space-y-1">
                      <div>Content Category: Nutrition</div>
                      <div>User Engagement: High</div>
                      <div>Placement: Interstitial</div>
                      <div>Privacy: RDP Enabled</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-xs text-muted-foreground">
                  <p>Configuration Details:</p>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(metrics, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}