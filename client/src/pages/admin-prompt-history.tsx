import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Brain, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

interface PromptHistoryEntry {
  id: number;
  userId: number | null;
  sessionId: string | null;
  feature: string;
  aiModel: string;
  userPrompt: string | null;
  systemPrompt: string | null;
  fullPrompt: string | null;
  requestData: any;
  aiResponse: string | null;
  processedResponse: string | null;
  parsedData: any;
  tokensUsed: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
  generationTimeMs: number | null;
  status: string;
  errorMessage: string | null;
  retryCount: number;
  responseLength: number | null;
  parseSuccess: boolean;
  userRating: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface PromptHistoryStats {
  totalPrompts: number;
  totalTokensUsed: number;
  avgResponseTime: number;
  modelUsage: Record<string, number>;
  featureUsage: Record<string, number>;
}

export default function AdminPromptHistory() {
  const { user } = useAuth();
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [stats, setStats] = useState<PromptHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch prompt history and stats
      const [historyResponse, statsResponse] = await Promise.all([
        fetch('/api/prompt-history?limit=100'),
        fetch('/api/prompt-history/stats')
      ]);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setPromptHistory(historyData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching prompt history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.accountType === 'Admin') {
      fetchData();
    }
  }, [user]);

  if (!user || user.accountType !== 'Admin') {
    return (
      <div className="min-h-screen bg-background p-6">
        <Card className="max-w-md mx-auto mt-20">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Access denied. Admin privileges required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'error':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTime = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokens = (tokens: number | null) => {
    if (!tokens) return 'N/A';
    return tokens.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Prompt History</h1>
            <p className="text-muted-foreground">
              Monitor and analyze all AI interactions across the platform
            </p>
          </div>
          <Button onClick={fetchData} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPrompts.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTokensUsed.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(stats.avgResponseTime)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Models</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(stats.modelUsage).length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="recent" className="space-y-4">
          <TabsList>
            <TabsTrigger value="recent">Recent History</TabsTrigger>
            <TabsTrigger value="models">Model Usage</TabsTrigger>
            <TabsTrigger value="features">Feature Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Interactions</CardTitle>
                <CardDescription>
                  Latest {promptHistory.length} AI prompt submissions and responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {promptHistory.map((entry) => (
                      <Card key={entry.id} className="border-l-4 border-l-primary/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={getStatusBadgeVariant(entry.status)}>
                                {entry.status}
                              </Badge>
                              <Badge variant="outline">{entry.feature}</Badge>
                              <Badge variant="secondary">{entry.aiModel}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {entry.userPrompt && (
                            <div>
                              <p className="text-sm font-medium mb-1">User Prompt:</p>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {entry.userPrompt.substring(0, 200)}
                                {entry.userPrompt.length > 200 && '...'}
                              </p>
                            </div>
                          )}
                          
                          {entry.aiResponse && entry.status === 'success' && (
                            <div>
                              <p className="text-sm font-medium mb-1">AI Response:</p>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                                {entry.aiResponse.substring(0, 300)}
                                {entry.aiResponse.length > 300 && '...'}
                              </p>
                            </div>
                          )}

                          {entry.errorMessage && (
                            <div>
                              <p className="text-sm font-medium mb-1 text-destructive">Error:</p>
                              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                                {entry.errorMessage}
                              </p>
                            </div>
                          )}

                          <Separator />
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                            <div>
                              <span className="font-medium">Tokens:</span> {formatTokens(entry.tokensUsed)}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {formatTime(entry.generationTimeMs)}
                            </div>
                            <div>
                              <span className="font-medium">User ID:</span> {entry.userId || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Session:</span> {entry.sessionId?.substring(0, 8) || 'N/A'}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Usage</CardTitle>
                <CardDescription>Distribution of AI model usage across all features</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    {Object.entries(stats.modelUsage).map(([model, count]) => (
                      <div key={model} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <span className="font-medium">{model}</span>
                        <Badge variant="secondary">{count} requests</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>AI usage breakdown by application feature</CardDescription>
              </CardHeader>
              <CardContent>
                {stats && (
                  <div className="space-y-3">
                    {Object.entries(stats.featureUsage).map(([feature, count]) => (
                      <div key={feature} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                        <span className="font-medium capitalize">{feature.replace('_', ' ')}</span>
                        <Badge variant="secondary">{count} requests</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}