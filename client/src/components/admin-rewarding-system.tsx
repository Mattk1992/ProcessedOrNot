import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Gift, Settings, Star, Trophy, Users, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { RewardingSystemSettings, InsertRewardingSystemSettings } from "@shared/schema";

export default function AdminRewardingSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<RewardingSystemSettings>({
    queryKey: ["/api/admin/rewarding-system"],
  });

  // Local state for form
  const [formData, setFormData] = useState<Partial<InsertRewardingSystemSettings>>({});

  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Mutation to update settings
  const updateMutation = useMutation({
    mutationFn: (updates: Partial<InsertRewardingSystemSettings>) =>
      apiRequest("/api/admin/rewarding-system", "PUT", updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rewarding-system"] });
      toast({
        title: "Settings Updated",
        description: "Rewarding system settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update rewarding system settings.",
        variant: "destructive",
      });
      console.error("Failed to update settings:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertRewardingSystemSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Settings Card */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Rewarding System Settings
                </CardTitle>
                <CardDescription>
                  Configure the point system and reward mechanics for your application
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* System Enable/Disable */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/30 dark:from-purple-900/20 dark:to-pink-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-800">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Enable Rewarding System
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Turn the entire rewarding system on or off
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.enabled || false}
                onCheckedChange={(checked) => handleInputChange('enabled', checked)}
              />
            </div>

            <Separator />

            {/* Points Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-600" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Points Configuration
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsPerProduct" className="text-sm text-gray-700 dark:text-gray-300">
                    Points per Product Added
                  </Label>
                  <Input
                    id="pointsPerProduct"
                    type="number"
                    min="0"
                    value={formData.pointsPerProduct || 10}
                    onChange={(e) => handleInputChange('pointsPerProduct', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsPerReview" className="text-sm text-gray-700 dark:text-gray-300">
                    Points per Review
                  </Label>
                  <Input
                    id="pointsPerReview"
                    type="number"
                    min="0"
                    value={formData.pointsPerReview || 20}
                    onChange={(e) => handleInputChange('pointsPerReview', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pointsPerReferral" className="text-sm text-gray-700 dark:text-gray-300">
                    Points per Referral
                  </Label>
                  <Input
                    id="pointsPerReferral"
                    type="number"
                    min="0"
                    value={formData.pointsPerReferral || 50}
                    onChange={(e) => handleInputChange('pointsPerReferral', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Limits and Restrictions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-600" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Limits and Restrictions
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minRedemptionPoints" className="text-sm text-gray-700 dark:text-gray-300">
                    Minimum Redemption Points
                  </Label>
                  <Input
                    id="minRedemptionPoints"
                    type="number"
                    min="0"
                    value={formData.minRedemptionPoints || 100}
                    onChange={(e) => handleInputChange('minRedemptionPoints', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyPointsLimit" className="text-sm text-gray-700 dark:text-gray-300">
                    Daily Points Limit
                  </Label>
                  <Input
                    id="dailyPointsLimit"
                    type="number"
                    min="0"
                    value={formData.dailyPointsLimit || 500}
                    onChange={(e) => handleInputChange('dailyPointsLimit', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeklyPointsLimit" className="text-sm text-gray-700 dark:text-gray-300">
                    Weekly Points Limit
                  </Label>
                  <Input
                    id="weeklyPointsLimit"
                    type="number"
                    min="0"
                    value={formData.weeklyPointsLimit || 2000}
                    onChange={(e) => handleInputChange('weeklyPointsLimit', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDays" className="text-sm text-gray-700 dark:text-gray-300">
                    Points Expire After (Days)
                  </Label>
                  <Input
                    id="expirationDays"
                    type="number"
                    min="0"
                    value={formData.expirationDays || 365}
                    onChange={(e) => handleInputChange('expirationDays', parseInt(e.target.value))}
                    className="bg-white/50 dark:bg-gray-700/50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Advanced Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-600" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Advanced Features
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 dark:bg-green-900/20">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Bonus Points
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Enable special bonus events
                    </p>
                  </div>
                  <Switch
                    checked={formData.bonusPointsEnabled || false}
                    onCheckedChange={(checked) => handleInputChange('bonusPointsEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Level System
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Enable user leveling
                    </p>
                  </div>
                  <Switch
                    checked={formData.levelSystemEnabled || false}
                    onCheckedChange={(checked) => handleInputChange('levelSystemEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50/50 dark:bg-purple-900/20">
                  <div>
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Notifications
                    </Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Send reward notifications
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications !== false}
                    onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rewardMultiplier" className="text-sm text-gray-700 dark:text-gray-300">
                  Reward Multiplier
                </Label>
                <Input
                  id="rewardMultiplier"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="10"
                  value={formData.rewardMultiplier || 1.0}
                  onChange={(e) => handleInputChange('rewardMultiplier', parseFloat(e.target.value))}
                  className="bg-white/50 dark:bg-gray-700/50 max-w-xs"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Multiply all earned points by this value (1.0 = normal, 2.0 = double points)
                </p>
              </div>
            </div>

            <Separator />

            {/* Description and Terms */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  User Information
                </Label>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm text-gray-700 dark:text-gray-300">
                    System Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe how users can earn and use points..."
                    className="bg-white/50 dark:bg-gray-700/50 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions" className="text-sm text-gray-700 dark:text-gray-300">
                    Terms and Conditions
                  </Label>
                  <Textarea
                    id="termsAndConditions"
                    value={formData.termsAndConditions || ""}
                    onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                    placeholder="Enter the terms and conditions for the reward system..."
                    className="bg-white/50 dark:bg-gray-700/50 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
          >
            {updateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}