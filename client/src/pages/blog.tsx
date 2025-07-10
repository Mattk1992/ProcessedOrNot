import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, Clock, Eye, User, Tag, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
  slug: string;
  excerpt: string;
  readTime: number;
  viewCount: number;
  authorId: number;
}

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { user, isAuthenticated } = useAuth();

  // Fetch blog posts
  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Filter blog posts based on search query and selected tag
  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  }) || [];

  // Get all unique tags from all posts
  const allTags = Array.from(new Set(
    blogPosts?.flatMap(post => post.tags || []) || []
  )).sort();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Blog Posts
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Failed to load blog posts. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 mb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              ProcessedOrNot Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover the latest insights on food processing, nutrition science, and healthy eating. 
              Join our community of health-conscious food enthusiasts.
            </p>
            {isAuthenticated && (
              <Link href="/blog/new">
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Post
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">

        {/* Search and Filter */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search articles, topics, or authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-lg border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag('')}
                    className="rounded-full px-4 py-2 font-medium transition-all duration-200 hover:scale-105"
                  >
                    All Topics
                  </Button>
                  {allTags.slice(0, 5).map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className="rounded-full px-4 py-2 font-medium transition-all duration-200 hover:scale-105 capitalize"
                    >
                      {tag.replace('-', ' ')}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blog Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {blogPosts?.length === 0 ? 'No Blog Posts Yet' : 'No Posts Found'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {blogPosts?.length === 0 
                  ? 'Start by creating your first blog post to share your insights.'
                  : 'Try adjusting your search or filter criteria to find what you are looking for.'
                }
              </p>
              {isAuthenticated && blogPosts?.length === 0 && (
                <Link href="/blog/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Post
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="group h-full flex flex-col bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
                  <div className="bg-white dark:bg-gray-800 rounded-t-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl line-clamp-2 leading-tight mb-3">
                        <Link href={`/blog/${post.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-green-500" />
                          {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </CardHeader>
                  </div>
                </div>

                <CardContent className="flex-1 flex flex-col p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 flex-1 text-base leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="space-y-4">
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 border-0">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-3 py-1 rounded-full">
                            +{post.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <Separator className="bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
                    
                    {/* Post stats */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{post.readTime} min read</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{post.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {filteredPosts.length > 0 && filteredPosts.length >= 9 && (
          <div className="text-center mt-8">
            <Button variant="outline">Load More Posts</Button>
          </div>
        )}
      </div>
    </div>
  );
}