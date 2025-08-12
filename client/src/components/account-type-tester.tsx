import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { usePaidUserNavigation } from "@/hooks/use-paid-user-navigation";

/**
 * Component for testing account type changes and URL modification
 * This is for demonstration purposes to show the paid user URL functionality
 */
export function AccountTypeTester() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { generatePaidUserUrl, isPaidUser, isRegularUser, navigateWithPaidUserSuffix, hasAccountTypeSuffix } = usePaidUserNavigation();
  const [selectedAccountType, setSelectedAccountType] = useState<string>(user?.accountType || "Regular");

  const updateAccountTypeMutation = useMutation({
    mutationFn: async (accountType: string) => {
      const response = await apiRequest("PUT", "/api/auth/account-type", { accountType });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account type updated",
        description: `Account type changed to ${selectedAccountType}`,
      });
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update account type",
        variant: "destructive",
      });
    },
  });

  const handleAccountTypeChange = () => {
    updateAccountTypeMutation.mutate(selectedAccountType);
  };

  const testUrls = [
    '/product-lookup',
    '/nutri-dashboard',
    '/blog',
    '/admin',
    '/profile?tab=account',
    '/nutri-dashboard#statistics'
  ];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Account Type & URL Testing
          <Badge variant={
            user?.accountType === 'Admin' ? 'default' : 
            user?.accountType === 'Paid' ? 'outline' : 
            'secondary'
          }>
            Current: {user?.accountType || 'Unknown'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Test the account type system and observe URL modifications for different user types
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Type Changer */}
        <div className="space-y-3">
          <h4 className="font-medium">Change Account Type (Testing)</h4>
          <div className="flex gap-3 items-center">
            <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAccountTypeChange}
              disabled={updateAccountTypeMutation.isPending}
            >
              {updateAccountTypeMutation.isPending ? "Updating..." : "Update Account Type"}
            </Button>
          </div>
        </div>

        {/* URL Generation Demo */}
        <div className="space-y-3">
          <h4 className="font-medium">URL Generation Test</h4>
          <p className="text-sm text-muted-foreground">
            Original URL → Modified URL (based on current account type)
          </p>
          <div className="grid gap-2 text-sm">
            {testUrls.map((url) => (
              <div key={url} className="flex justify-between items-center p-2 bg-muted rounded">
                <span className="font-mono text-xs">{url}</span>
                <span className="font-mono text-xs text-blue-600">
                  {generatePaidUserUrl(url)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Test */}
        <div className="space-y-3">
          <h4 className="font-medium">Navigation Test</h4>
          <p className="text-sm text-muted-foreground">
            These buttons use the account type navigation system:
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWithPaidUserSuffix('/product-lookup')}
            >
              Product Lookup
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWithPaidUserSuffix('/nutri-dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateWithPaidUserSuffix('/blog')}
            >
              Blog
            </Button>
          </div>
        </div>

        {/* Status Display */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
          <p className="text-sm">
            <strong>Status:</strong> {
              isPaidUser ? "✅ Paid user detected - URLs will include '?paiduser=true' parameter" :
              isRegularUser ? "✅ Regular user detected - URLs will include '?regularuser=true' parameter" :
              "ℹ️ Admin user - URLs remain unchanged"
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {hasAccountTypeSuffix ? "URL modification is active" : "No URL modification for admin users"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default AccountTypeTester;