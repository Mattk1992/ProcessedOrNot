import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';

interface SmartLookupResult {
  source: string;
  productName: string;
  brands?: string;
  ingredients?: string;
  found: boolean;
  error?: string;
}

interface SmartLookupProps {
  barcode: string;
  onProductFound: (product: any) => void;
}

export default function SmartLookup({ barcode, onProductFound }: SmartLookupProps) {
  const [productName, setProductName] = useState('');
  const [results, setResults] = useState<SmartLookupResult[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  const smartLookupMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch('/api/smart-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productName: searchQuery,
          barcode 
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      return response.json();
    },
    onSuccess: (data: any) => {
      setResults(data.results || []);
      
      // If a product was found, notify parent component
      const foundProduct = data.results?.find((r: SmartLookupResult) => r.found);
      if (foundProduct && data.product) {
        toast({
          title: "Product Found!",
          description: `Found in ${foundProduct.source}`,
        });
        onProductFound(data.product);
      } else {
        toast({
          title: "Search Complete",
          description: `Searched ${data.results?.length || 0} databases. No matches found.`,
          variant: "destructive"
        });
      }
    },
    onError: (error: Error) => {
      console.error('Smart lookup failed:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search databases",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    if (!productName.trim()) {
      toast({
        title: "Product Name Required",
        description: "Please enter a product name to search",
        variant: "destructive"
      });
      return;
    }

    setResults([]);
    smartLookupMutation.mutate(productName.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !smartLookupMutation.isPending) {
      handleSearch();
    }
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
          <Search className="h-5 w-5" />
          <span>Smart Lookup</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Search across all {19} food databases by product name to find nutritional information
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter product name (e.g., 'Coca Cola', 'Organic Bananas')"
            disabled={smartLookupMutation.isPending}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={smartLookupMutation.isPending || !productName.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {smartLookupMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Product
              </>
            )}
          </Button>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-foreground">
              Search Results from {results.length} databases:
            </h4>
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.found
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : result.error
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{result.source}</span>
                      {result.found && (
                        <Badge variant="default" className="bg-green-600 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Found
                        </Badge>
                      )}
                      {result.error && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    {result.found && result.productName && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.productName}
                        {result.brands && <span className="ml-2">({result.brands})</span>}
                      </div>
                    )}
                    {result.error && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {result.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Progress Indicator */}
        {smartLookupMutation.isPending && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching across all food databases...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}