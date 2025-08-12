import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function URLStatusDisplay() {
  const [currentUrl, setCurrentUrl] = useState('');
  const { user } = useAuth();
  
  useEffect(() => {
    const updateUrl = () => {
      setCurrentUrl(window.location.href);
    };
    
    // Update immediately
    updateUrl();
    
    // Listen for URL changes
    window.addEventListener('popstate', updateUrl);
    
    // Also listen for pushState/replaceState changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      updateUrl();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      updateUrl();
    };
    
    return () => {
      window.removeEventListener('popstate', updateUrl);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);
  
  const hasAccountParam = () => {
    const url = new URL(currentUrl);
    return url.searchParams.has('paiduser') || 
           url.searchParams.has('regularuser') || 
           url.searchParams.has('adminuser');
  };
  
  const getAccountParamValue = () => {
    const url = new URL(currentUrl);
    if (url.searchParams.has('adminuser')) return 'adminuser=true';
    if (url.searchParams.has('paiduser')) return 'paiduser=true';
    if (url.searchParams.has('regularuser')) return 'regularuser=true';
    return 'none';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            URL Status Monitor
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentUrl(window.location.href)}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Current URL:</label>
          <code className="text-sm bg-muted p-2 rounded border w-full block break-all">
            {currentUrl}
          </code>
        </div>
        
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm font-medium">Account Type:</span>
            <Badge className="ml-2" variant={
              user?.accountType === 'Admin' ? 'default' : 
              user?.accountType === 'Paid' ? 'outline' : 
              'secondary'
            }>
              {user?.accountType || 'Not logged in'}
            </Badge>
          </div>
          
          <div>
            <span className="text-sm font-medium">URL Parameter:</span>
            <Badge className="ml-2" variant={hasAccountParam() ? 'default' : 'destructive'}>
              {hasAccountParam() ? getAccountParamValue() : 'No parameter'}
            </Badge>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {hasAccountParam() 
            ? '✓ URL suffix is working correctly!' 
            : '⚠ URL suffix not detected. The system may still be loading or there might be an issue.'
          }
        </div>
      </CardContent>
    </Card>
  );
}