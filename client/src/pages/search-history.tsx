import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Clock, Search, Barcode, CheckCircle, XCircle, Calendar, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";

interface SearchHistoryItem {
  id: number;
  searchInput: string;
  searchType: string;
  productBarcode?: string;
  productName?: string;
  productBrand?: string;
  foundResult: boolean;
  processingScore?: number;
  dataSource?: string;
  searchedAt: string;
}

interface SearchHistoryStats {
  totalSearches: number;
  successfulSearches: number;
  recentSearches: number;
}

export default function SearchHistory() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(key, language);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
    }
  }, [isAuthenticated, setLocation]);

  // Fetch search history
  const { data: searchHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/search-history"],
    enabled: isAuthenticated,
  });

  // Fetch search history stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/search-history/stats"],
    enabled: isAuthenticated,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t("searchHistory.justNow");
    if (diffMins < 60) return t("searchHistory.minutesAgo").replace("{minutes}", diffMins.toString());
    if (diffHours < 24) return t("searchHistory.hoursAgo").replace("{hours}", diffHours.toString());
    if (diffDays < 7) return t("searchHistory.daysAgo").replace("{days}", diffDays.toString());
    
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProcessingLevel = (score?: number) => {
    if (!score) return t("searchHistory.unknown");
    if (score <= 3) return t("processing.level.minimal");
    if (score <= 6) return t("processing.level.processed");
    return t("processing.level.ultra");
  };

  const getProcessingColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score <= 3) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score <= 6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("searchHistory.backToHome")}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("searchHistory.title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {t("searchHistory.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && !statsLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("searchHistory.totalSearches")}</CardTitle>
                <Search className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{(stats as any).totalSearches}</div>
                <p className="text-xs text-muted-foreground">{t("searchHistory.allTimeSearches")}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("searchHistory.successfulSearches")}</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{(stats as any).successfulSearches}</div>
                <p className="text-xs text-muted-foreground">
                  {t("searchHistory.successRate")}: {((stats as any).totalSearches > 0 ? Math.round(((stats as any).successfulSearches / (stats as any).totalSearches) * 100) : 0)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("searchHistory.recentSearches")}</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{(stats as any).recentSearches}</div>
                <p className="text-xs text-muted-foreground">{t("searchHistory.lastSevenDays")}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search History List */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t("searchHistory.recentActivity")}
            </CardTitle>
            <CardDescription>
              {t("searchHistory.yourSearchHistory")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : searchHistory && (searchHistory as SearchHistoryItem[]).length > 0 ? (
              <div className="space-y-4">
                {(searchHistory as SearchHistoryItem[]).map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">
                          {item.searchType === 'barcode' ? (
                            <Barcode className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Search className="w-4 h-4 text-purple-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {item.searchInput}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {item.searchType === 'barcode' ? t("searchHistory.barcode") : t("searchHistory.textSearch")}
                            </Badge>
                          </div>
                          
                          {item.foundResult ? (
                            <div className="space-y-1">
                              {item.productName && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  <span className="font-medium">{t("searchHistory.productFound")}:</span> {item.productName}
                                </p>
                              )}
                              {item.productBrand && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  <span className="font-medium">{t("product.brand")}:</span> {item.productBrand}
                                </p>
                              )}
                              {item.processingScore !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{t("searchHistory.processingScore")}:</span>
                                  <Badge className={getProcessingColor(item.processingScore)}>
                                    {item.processingScore}/10 - {getProcessingLevel(item.processingScore)}
                                  </Badge>
                                </div>
                              )}
                              {item.dataSource && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {t("product.source")}: {item.dataSource}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600 dark:text-red-400">
                                {t("searchHistory.noResultFound")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(item.searchedAt)}</span>
                      </div>
                    </div>
                    
                    {index < (searchHistory as SearchHistoryItem[]).length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t("searchHistory.noSearches")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  {t("searchHistory.startSearching")}
                </p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Search className="w-4 h-4 mr-2" />
                    {t("searchHistory.startFirstSearch")}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}