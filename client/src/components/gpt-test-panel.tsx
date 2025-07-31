// GPT Reward Ad Test Panel
// Testing interface for Google Publisher Tag reward ads

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, RefreshCw, Settings, CheckCircle, XCircle } from "lucide-react";
import { gptAdManager } from "@/lib/gpt-ads";
import { useGPTRewards } from "@/hooks/useGPTRewards";

export function GPTTestPanel() {
  const [isTestingAd, setIsTestingAd] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [adAvailability, setAdAvailability] = useState<boolean | null>(null);
  
  const gptRewards = useGPTRewards(5);

  const testAdAvailability = async () => {
    try {
      const available = await gptAdManager.checkAdAvailability();
      setAdAvailability(available);
      setTestResult(available ? "GPT ads are available" : "GPT ads not available - check configuration");
    } catch (error) {
      setAdAvailability(false);
      setTestResult(`Error checking availability: ${error}`);
    }
  };

  const testRewardAd = async () => {
    setIsTestingAd(true);
    setTestResult("");
    
    try {
      const success = await gptAdManager.showRewardAd();
      setTestResult(success ? "Reward ad displayed successfully" : "Failed to display reward ad");
    } catch (error) {
      setTestResult(`Error showing reward ad: ${error}`);
    } finally {
      setIsTestingAd(false);
    }
  };

  const refreshAdSlot = () => {
    gptAdManager.refreshRewardAd();
    setTestResult("Ad slot refreshed");
  };

  const showAdMetrics = () => {
    const metrics = gptAdManager.getAdMetrics();
    setTestResult(`Ad Metrics: ${JSON.stringify(metrics, null, 2)}`);
  };

  const forceReinitialize = async () => {
    setIsTestingAd(true);
    try {
      await gptAdManager.forceReinitialize();
      setTestResult("GPT system reinitialized successfully");
      setAdAvailability(true);
    } catch (error) {
      setTestResult(`Reinitialization failed: ${error}`);
      setAdAvailability(false);
    } finally {
      setIsTestingAd(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          GPT Reward Ad Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Reward System Status</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={gptRewards.isAdAvailable ? "default" : "destructive"}>
                {gptRewards.isAdAvailable ? "Available" : "Unavailable"}
              </Badge>
              <Badge variant="outline">
                Clicks: {gptRewards.clickCount}/{gptRewards.maxClicks}
              </Badge>
              <Badge variant={gptRewards.needsRewardAd ? "secondary" : "outline"}>
                {gptRewards.needsRewardAd ? "Ad Required" : "No Ad Needed"}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Ad Availability</p>
            <div className="flex items-center gap-2">
              {adAvailability === null ? (
                <Badge variant="outline">Not Tested</Badge>
              ) : adAvailability ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Available
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Unavailable
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={testAdAvailability} variant="outline" size="sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            Test Availability
          </Button>
          
          <Button 
            onClick={testRewardAd} 
            disabled={isTestingAd}
            variant="default" 
            size="sm"
          >
            {isTestingAd ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Test Reward Ad
          </Button>
          
          <Button onClick={refreshAdSlot} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Slot
          </Button>
          
          <Button onClick={gptRewards.resetClickCount} variant="outline" size="sm">
            Reset Counter
          </Button>
          
          <Button onClick={showAdMetrics} variant="outline" size="sm">
            Show Metrics
          </Button>
          
          <Button 
            onClick={forceReinitialize} 
            disabled={isTestingAd}
            variant="outline" 
            size="sm"
          >
            {isTestingAd ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Reinitialize
          </Button>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Test Result:</p>
            <p className="text-sm text-muted-foreground">{testResult}</p>
          </div>
        )}

        {/* Configuration Info */}
        <div className="space-y-2 p-3 bg-muted/50 rounded-lg text-xs">
          <p className="font-medium">Configuration:</p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Publisher ID: ca-pub-1163701043339821</li>
            <li>• Ad Unit: /1163701043339821/reward_interstitial</li>
            <li>• Format: Interstitial (Out-of-Page)</li>
            <li>• Trigger: Every 5 camera scans</li>
            <li>• Duration: 5 seconds</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default GPTTestPanel;