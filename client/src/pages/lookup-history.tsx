import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  History, 
  Search, 
  Package, 
  AlertCircle, 
  Clock,
  ExternalLink,
  Filter,
  Calendar,
  ChevronRight,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface SearchHistoryItem {
  id: number;
  searchId: string;
  searchInput: string;
  searchInputType: string;
  userId?: number;
  resultFound: boolean;
  productBarcode?: string;
  productName?: string;
  productBrands?: string;
  productImageUrl?: string;
  processingScore?: number;
  processingExplanation?: string;
  dataSource?: string;
  lookupSource?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function LookupHistory() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [searchFilter, setSearchFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  // Fetch user's search history
  const { data: searchHistory, isLoading, error } = useQuery<SearchHistoryItem[]>({
    queryKey: ["/api/search-history"],
    enabled: isAuthenticated,
  });

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
        <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <img src={logoPath} alt="ProcessedOrNot Scanner" className="w-10 h-10 rounded-full" />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold gradient-text">ProcessedOrNot</h1>
                  <p className="text-xs text-muted-foreground">Lookup History</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageSwitcher />
                <HeaderDropdown />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="mb-8">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to view your search history.</p>
          </div>
          <div className="space-x-4">
            <Link href="/auth">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter the search history
  const filteredHistory = searchHistory?.filter((item) => {
    const matchesSearch = item.searchInput.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         item.productName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         item.productBrands?.toLowerCase().includes(searchFilter.toLowerCase());
    
    const matchesType = typeFilter === "all" || item.searchInputType === typeFilter;
    
    const matchesResult = resultFilter === "all" || 
                         (resultFilter === "found" && item.resultFound) ||
                         (resultFilter === "not_found" && !item.resultFound);
    
    return matchesSearch && matchesType && matchesResult;
  }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProcessingScoreColor = (score?: number) => {
    if (!score) return "bg-gray-500";
    if (score <= 2) return "bg-green-500";
    if (score <= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProcessingScoreText = (score?: number) => {
    if (!score) return "Unknown";
    if (score <= 2) return "Minimally Processed";
    if (score <= 4) return "Processed";
    return "Ultra-Processed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <History className="w-8 h-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold">Your Search History</h2>
              <p className="text-muted-foreground">
                View and manage your past product lookups
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search your history..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Search Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="barcode">Barcode</SelectItem>
                <SelectItem value="text">Text Search</SelectItem>
                <SelectItem value="voice">Voice Search</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="found">Products Found</SelectItem>
                <SelectItem value="not_found">No Results</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Searches</p>
                    <p className="text-2xl font-bold">{searchHistory?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Products Found</p>
                    <p className="text-2xl font-bold">
                      {searchHistory?.filter(item => item.resultFound).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">No Results</p>
                    <p className="text-2xl font-bold">
                      {searchHistory?.filter(item => !item.resultFound).length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your search history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                Failed to Load History
              </h3>
              <p className="text-red-600 dark:text-red-400">
                Unable to retrieve your search history. Please try again later.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredHistory.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Search History</h3>
              <p className="text-muted-foreground mb-6">
                {searchFilter || typeFilter !== "all" || resultFilter !== "all"
                  ? "No searches match your current filters. Try adjusting your filters."
                  : "You haven't performed any searches yet. Start by scanning or searching for products!"}
              </p>
              <Link href="/product-lookup">
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Start Searching
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Search History List */}
        {!isLoading && !error && filteredHistory.length > 0 && (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Search Info */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {item.searchInputType === 'barcode' && <Package className="w-4 h-4 text-blue-500" />}
                          {item.searchInputType === 'text' && <Search className="w-4 h-4 text-green-500" />}
                          {item.searchInputType === 'voice' && <Search className="w-4 h-4 text-purple-500" />}
                          <Badge variant="outline">
                            {item.searchInputType}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>

                      {/* Search Query */}
                      <div className="mb-3">
                        <p className="font-medium text-lg">{item.searchInput}</p>
                      </div>

                      {/* Result */}
                      {item.resultFound && item.productName ? (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-3">
                          <div className="flex items-start space-x-4">
                            {item.productImageUrl && (
                              <img 
                                src={item.productImageUrl} 
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold text-green-800 dark:text-green-200">
                                {item.productName}
                              </h4>
                              {item.productBrands && (
                                <p className="text-sm text-green-600 dark:text-green-300">
                                  {item.productBrands}
                                </p>
                              )}
                              {item.productBarcode && (
                                <p className="text-xs text-green-500 dark:text-green-400 font-mono">
                                  {item.productBarcode}
                                </p>
                              )}
                              
                              {/* Processing Score */}
                              {item.processingScore && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge className={`${getProcessingScoreColor(item.processingScore)} text-white`}>
                                    {getProcessingScoreText(item.processingScore)} ({item.processingScore}/10)
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Data Source */}
                          {item.dataSource && (
                            <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-800">
                              <p className="text-xs text-green-600 dark:text-green-400">
                                Source: {item.dataSource} {item.lookupSource && `(${item.lookupSource})`}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700 dark:text-red-300 font-medium">
                              No product found
                            </p>
                          </div>
                          {item.errorMessage && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                              {item.errorMessage}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {item.resultFound && item.productBarcode && (
                        <Link href={`/product-lookup?barcode=${item.productBarcode}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}
                      <Link href={`/product-lookup?q=${encodeURIComponent(item.searchInput)}`}>
                        <Button variant="outline" size="sm">
                          <Search className="w-4 h-4 mr-1" />
                          Search Again
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}