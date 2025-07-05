import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Search, Calendar, TrendingUp, BarChart3, Filter, Download, RefreshCw } from "lucide-react";

type SearchHistoryItem = {
  id: number;
  searchId: string;
  searchInput: string;
  searchInputType: string;
  resultFound: boolean;
  productBarcode?: string;
  productName?: string;
  productBrands?: string;
  processingScore?: number;
  glycemicIndex?: number;
  dataSource?: string;
  lookupSource?: string;
  errorMessage?: string;
  createdAt: string;
};

type SearchStats = {
  totalSearches: number;
  successfulSearches: number;
  failedSearches: number;
  barcodeSearches: number;
  textSearches: number;
  averageProcessingScore: number;
  mostSearchedProducts: Array<{
    searchInput: string;
    count: number;
  }>;
  searchesByDate: Array<{
    date: string;
    count: number;
  }>;
  searchesBySource: Array<{
    source: string;
    count: number;
  }>;
};

export default function AdminSearchHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterResult, setFilterResult] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Redirect non-admin users
  useEffect(() => {
    if (!isAuthenticated || (user && (user as any).role !== 'Admin')) {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [isAuthenticated, user, toast]);

  // Fetch search history data
  const { data: searchHistory, isLoading: historyLoading, refetch: refetchHistory } = useQuery<SearchHistoryItem[]>({
    queryKey: ["/api/admin/search-history"],
    enabled: isAuthenticated && (user as any)?.role === 'Admin',
  });

  // Fetch search statistics
  const { data: searchStats, isLoading: statsLoading, refetch: refetchStats } = useQuery<SearchStats>({
    queryKey: ["/api/admin/search-history/stats"],
    enabled: isAuthenticated && (user as any)?.role === 'Admin',
  });

  // Clear search history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/search-history/clear", "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Search history cleared successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/search-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/search-history/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to clear search history: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Export search history mutation
  const exportHistoryMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/search-history/export");
      if (!response.ok) throw new Error("Export failed");
      return response.blob();
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `search-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Success",
        description: "Search history exported successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to export search history: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Filter search history
  const filteredHistory = searchHistory?.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.searchInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productBrands?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || item.searchInputType === filterType;
    const matchesResult = filterResult === "all" || 
      (filterResult === "success" && item.resultFound) ||
      (filterResult === "failed" && !item.resultFound);
    
    return matchesSearch && matchesType && matchesResult;
  });

  // Paginate filtered results
  const paginatedHistory = filteredHistory?.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil((filteredHistory?.length || 0) / pageSize);

  const refreshData = () => {
    refetchHistory();
    refetchStats();
  };

  if (!isAuthenticated || (user as any)?.role !== 'Admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search History Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and analyze user search patterns and system performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshData}
            disabled={historyLoading || statsLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => exportHistoryMutation.mutate()}
            disabled={exportHistoryMutation.isPending}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Search History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : searchStats?.totalSearches?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time search queries
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : 
                    searchStats?.totalSearches ? 
                      Math.round((searchStats.successfulSearches / searchStats.totalSearches) * 100) + "%" 
                      : "0%"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {searchStats?.successfulSearches || 0} successful / {searchStats?.totalSearches || 0} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Barcode vs Text</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." :
                    searchStats?.totalSearches ?
                      Math.round((searchStats.barcodeSearches / searchStats.totalSearches) * 100) + "/" +
                      Math.round((searchStats.textSearches / searchStats.totalSearches) * 100) + "%"
                      : "0/0%"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Barcode / Text searches
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Score</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsLoading ? "..." : 
                    searchStats?.averageProcessingScore ? 
                      searchStats.averageProcessingScore.toFixed(1) 
                      : "N/A"
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Average food processing level
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Most Searched Products */}
          <Card>
            <CardHeader>
              <CardTitle>Most Searched Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsLoading ? (
                  <div>Loading...</div>
                ) : searchStats?.mostSearchedProducts?.length ? (
                  searchStats.mostSearchedProducts.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.searchInput}</span>
                      <Badge variant="secondary">{item.count} searches</Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No search data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Data Sources Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results by Data Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsLoading ? (
                  <div>Loading...</div>
                ) : searchStats?.searchesBySource?.length ? (
                  searchStats.searchesBySource.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.source || 'Unknown'}</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(10, (item.count / (searchStats.totalSearches || 1)) * 200)}px` 
                          }}
                        />
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No data source statistics available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Searches by Date */}
          <Card>
            <CardHeader>
              <CardTitle>Search Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsLoading ? (
                  <div>Loading...</div>
                ) : searchStats?.searchesByDate?.length ? (
                  searchStats.searchesByDate.slice(-14).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.date}</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.max(10, (item.count / Math.max(...(searchStats.searchesByDate || []).map(d => d.count))) * 150)}px` 
                          }}
                        />
                        <Badge variant="outline">{item.count}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No date activity data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Search & Filter</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    placeholder="Search queries, products, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Search Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="BarcodeInput">Barcode Searches</SelectItem>
                    <SelectItem value="TextInput">Text Searches</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterResult} onValueChange={setFilterResult}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Results" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="success">Successful</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => clearHistoryMutation.mutate()}
                  disabled={clearHistoryMutation.isPending}
                  variant="destructive"
                  size="sm"
                >
                  Clear History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Search History ({filteredHistory?.length || 0} results)</CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">Loading search history...</div>
              ) : paginatedHistory?.length ? (
                <div className="space-y-4">
                  {paginatedHistory.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={item.searchInputType === 'BarcodeInput' ? 'default' : 'secondary'}>
                            {item.searchInputType === 'BarcodeInput' ? 'Barcode' : 'Text'}
                          </Badge>
                          <Badge variant={item.resultFound ? 'default' : 'destructive'}>
                            {item.resultFound ? 'Success' : 'Failed'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ID: {item.searchId}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Search Input:</p>
                          <p className="text-sm text-muted-foreground">{item.searchInput}</p>
                        </div>
                        
                        {item.resultFound && item.productName && (
                          <div>
                            <p className="text-sm font-medium">Product Found:</p>
                            <p className="text-sm text-muted-foreground">
                              {item.productName}
                              {item.productBrands && ` (${item.productBrands})`}
                            </p>
                          </div>
                        )}
                        
                        {item.processingScore !== null && item.processingScore !== undefined && (
                          <div>
                            <p className="text-sm font-medium">Processing Score:</p>
                            <Badge variant={item.processingScore <= 3 ? 'default' : item.processingScore <= 6 ? 'secondary' : 'destructive'}>
                              {item.processingScore}/10
                            </Badge>
                          </div>
                        )}
                        
                        {item.glycemicIndex !== null && item.glycemicIndex !== undefined && (
                          <div>
                            <p className="text-sm font-medium">Glycemic Index:</p>
                            <Badge variant={item.glycemicIndex <= 55 ? 'default' : item.glycemicIndex <= 70 ? 'secondary' : 'destructive'}>
                              {item.glycemicIndex}
                            </Badge>
                          </div>
                        )}
                        
                        {item.dataSource && (
                          <div>
                            <p className="text-sm font-medium">Data Source:</p>
                            <p className="text-sm text-muted-foreground">{item.dataSource}</p>
                          </div>
                        )}
                        
                        {item.lookupSource && (
                          <div>
                            <p className="text-sm font-medium">Lookup Method:</p>
                            <p className="text-sm text-muted-foreground">{item.lookupSource}</p>
                          </div>
                        )}
                      </div>
                      
                      {item.errorMessage && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded border border-destructive/20">
                          <p className="text-sm font-medium text-destructive">Error:</p>
                          <p className="text-sm text-destructive/80">{item.errorMessage}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2 pt-4">
                      <Button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No search history found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}