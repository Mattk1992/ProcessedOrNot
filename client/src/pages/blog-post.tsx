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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation('/blog')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Button>
      </div>

      {/* Blog Post */}
      <article>
        <Card>
          <CardHeader className="pb-6">
            <div className="space-y-4">
              {/* Title */}
              <CardTitle className="text-3xl font-bold leading-tight">
                {post.title}
              </CardTitle>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min read
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.viewCount} views
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLocation(`/blog/${post.id}/edit`)}
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
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {/* Excerpt */}
            {post.excerpt && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {post.excerpt}
                </p>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                className="text-gray-900 dark:text-gray-100 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: post.content.replace(/\n/g, '<br>') 
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {post.updatedAt !== post.publishedAt && (
                <p>
                  Last updated: {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/blog')}
              >
                More Posts
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/blog/new')}
                >
                  Write a Post
                </Button>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}