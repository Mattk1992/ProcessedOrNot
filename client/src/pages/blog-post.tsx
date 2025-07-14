import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Clock, Eye, User, Tag, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Fetch blog post
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog', id],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      return response.json();
    },
    enabled: !!id,
  });

  // Check if user can edit this post
  const canEdit = isAuthenticated && post && (
    post.authorId === user?.id || user?.accountType === 'Admin'
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Post Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/blog')}
            className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Post */}
        <article>
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="bg-white dark:bg-gray-800 rounded-t-lg">
                <CardHeader className="pb-8 px-8 pt-8">
                  <div className="space-y-6">
                    {/* Title */}
                    <CardTitle className="text-4xl font-bold leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {post.title}
                    </CardTitle>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <User className="w-5 h-5" />
                        <span className="font-semibold text-base">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Calendar className="w-5 h-5" />
                        <span className="font-medium">{formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">{post.readTime} min read</span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                        <Eye className="w-5 h-5" />
                        <span className="font-medium">{post.viewCount} views</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-blue-300 border-0 text-sm">
                            <Tag className="w-4 h-4 mr-2" />
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {canEdit && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/blog/${post.id}/edit`)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Post
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Add delete functionality here
                            console.log('Delete post', post.id);
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </div>
            </div>

            <CardContent className="px-8 pb-8">
              {/* Excerpt */}
              {post.excerpt && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl mb-8 border-l-4 border-blue-500">
                  <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed">
                    "{post.excerpt}"
                  </p>
                </div>
              )}

              <Separator className="mb-8 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />

              {/* Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div
                  className="text-gray-900 dark:text-gray-100 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/^/, '<p>').replace(/$/, '</p>')
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-blue-100">
                    {post.updatedAt !== post.publishedAt && (
                      <p>
                        Last updated: {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation('/blog')}
                      className="bg-white text-blue-600 hover:bg-blue-50 border-0 font-medium"
                    >
                      More Posts
                    </Button>
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation('/blog/new')}
                        className="bg-white text-purple-600 hover:bg-purple-50 border-0 font-medium"
                      >
                        Write a Post
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </article>
      </div>
    </div>
  );
}