import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Sparkles, 
  Calendar, 
  Tag, 
  Star, 
  ExternalLink, 
  Download,
  Clock,
  AlertCircle,
  CheckCircle,
  Filter,
  ChevronDown,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderDropdown from "@/components/header-dropdown";
import LanguageSwitcher from "@/components/language-switcher";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface Release {
  id: number;
  version: string;
  title: string;
  description: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  isPublic: boolean;
  isFeatured: boolean;
  releaseDate: string;
  publishedAt: string;
  publishedBy: number;
  notificationSent: boolean;
  notificationSentAt: string;
  tags: string[];
  changelogUrl: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReleasesPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  // Fetch all public releases
  const { data: releases, isLoading, error } = useQuery({
    queryKey: ['/api/releases'],
    queryFn: async () => {
      const response = await fetch('/api/releases');
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      return response.json() as Promise<Release[]>;
    }
  });

  // Fetch featured releases
  const { data: featuredReleases } = useQuery({
    queryKey: ['/api/releases/featured'],
    queryFn: async () => {
      const response = await fetch('/api/releases/featured');
      if (!response.ok) {
        throw new Error('Failed to fetch featured releases');
      }
      return response.json() as Promise<Release[]>;
    }
  });

  // Filter releases based on selected filters
  const filteredReleases = releases?.filter(release => {
    if (selectedType !== "all" && release.type !== selectedType) return false;
    if (selectedPriority !== "all" && release.priority !== selectedPriority) return false;
    return true;
  }) || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Sparkles className="w-4 h-4" />;
      case 'bugfix': return <CheckCircle className="w-4 h-4" />;
      case 'security': return <AlertCircle className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-blue-500';
      case 'bugfix': return 'bg-green-500';
      case 'security': return 'bg-red-500';
      case 'improvement': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-US' : language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Convert markdown-style content to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Loading Releases...</h2>
          <p className="text-muted-foreground">Please wait while we fetch the latest updates</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Releases</h2>
          <p className="text-muted-foreground mb-4">We couldn't fetch the latest releases. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="backdrop-blur-md bg-background/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/nutri-dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="all">All Releases</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            
            <div className="flex space-x-2">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="feature">Features</SelectItem>
                  <SelectItem value="bugfix">Bug Fixes</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="improvement">Improvements</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            {filteredReleases.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Releases Found</h3>
                <p className="text-muted-foreground">No releases match your current filters. Try adjusting the filters above.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredReleases.map((release) => (
                  <Card key={release.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="gap-1">
                              {getTypeIcon(release.type)}
                              {release.type}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`${getPriorityColor(release.priority)} text-white`}
                            >
                              {release.priority}
                            </Badge>
                            {release.isFeatured && (
                              <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                                <Star className="w-3 h-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{release.title}</CardTitle>
                          <CardDescription className="text-base">
                            {release.description}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1 mb-1">
                            <Tag className="w-3 h-3" />
                            <span>{release.version}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(release.releaseDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {formatContent(release.content)}
                      </div>
                      
                      {release.tags && release.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {release.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Published {formatDate(release.publishedAt)}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {release.changelogUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={release.changelogUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Changelog
                              </a>
                            </Button>
                          )}
                          {release.downloadUrl && (
                            <Button size="sm" asChild>
                              <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredReleases && featuredReleases.length > 0 ? (
              <div className="grid gap-6">
                {featuredReleases.map((release) => (
                  <Card key={release.id} className="hover:shadow-lg transition-shadow border-yellow-200 dark:border-yellow-800">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                              <Star className="w-3 h-3" />
                              Featured
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                              {getTypeIcon(release.type)}
                              {release.type}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`${getPriorityColor(release.priority)} text-white`}
                            >
                              {release.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl">{release.title}</CardTitle>
                          <CardDescription className="text-base">
                            {release.description}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1 mb-1">
                            <Tag className="w-3 h-3" />
                            <span>{release.version}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(release.releaseDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {formatContent(release.content)}
                      </div>
                      
                      {release.tags && release.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {release.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Published {formatDate(release.publishedAt)}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {release.changelogUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={release.changelogUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Changelog
                              </a>
                            </Button>
                          )}
                          {release.downloadUrl && (
                            <Button size="sm" asChild>
                              <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Featured Releases</h3>
                <p className="text-muted-foreground">There are currently no featured releases available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {releases && releases.length > 0 ? (
              <div className="grid gap-6">
                {releases.slice(0, 5).map((release) => (
                  <Card key={release.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="gap-1">
                              {getTypeIcon(release.type)}
                              {release.type}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`${getPriorityColor(release.priority)} text-white`}
                            >
                              {release.priority}
                            </Badge>
                            {release.isFeatured && (
                              <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
                                <Star className="w-3 h-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl">{release.title}</CardTitle>
                          <CardDescription className="text-base">
                            {release.description}
                          </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1 mb-1">
                            <Tag className="w-3 h-3" />
                            <span>{release.version}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(release.releaseDate)}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        {formatContent(release.content)}
                      </div>
                      
                      {release.tags && release.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {release.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Published {formatDate(release.publishedAt)}</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          {release.changelogUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={release.changelogUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Changelog
                              </a>
                            </Button>
                          )}
                          {release.downloadUrl && (
                            <Button size="sm" asChild>
                              <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Recent Releases</h3>
                <p className="text-muted-foreground">There are currently no recent releases available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}