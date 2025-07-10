import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Eye, Tag, User, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

export default function BlogNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: user?.username || '',
    tags: '',
    excerpt: '',
    slug: '',
    isPublished: true,
  });

  const [isPreview, setIsPreview] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  // Create blog post mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/blog', 'POST', data);
    },
    onSuccess: (newPost) => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] });
      toast({
        title: "Success!",
        description: "Your blog post has been created successfully.",
      });
      setLocation(`/blog/${newPost.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.author.trim()) {
      toast({
        title: "Validation Error",
        description: "Author is required.",
        variant: "destructive",
      });
      return;
    }

    createBlogMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      handleInputChange('slug', slug);
    }
  };

  const generateExcerpt = () => {
    if (formData.content) {
      const plainText = formData.content.replace(/<[^>]*>/g, '');
      const excerpt = plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
      handleInputChange('excerpt', excerpt);
    }
  };

  const parsedTags = formData.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Blog Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Share your thoughts and insights with the community
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {isPreview ? 'Preview' : 'Post Details'}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={isPreview ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => setIsPreview(false)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant={isPreview ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsPreview(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isPreview ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {formData.title || 'Untitled Post'}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {formData.author || 'Unknown Author'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {formData.excerpt && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        {formData.excerpt}
                      </p>
                    </div>
                  )}
                  <div>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br>') }} />
                    </div>
                  </div>
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4">
                      {parsedTags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter your blog post title"
                      required
                    />
                  </div>

                  {/* Author */}
                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                      placeholder="Author name"
                      required
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Write your blog post content here..."
                      rows={12}
                      required
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <Label htmlFor="tags">Tags (optional)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="Enter tags separated by commas (e.g., technology, AI, health)"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separate multiple tags with commas
                    </p>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="excerpt">Excerpt (optional)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateExcerpt}
                        disabled={!formData.content}
                      >
                        Generate from content
                      </Button>
                    </div>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief description of your post"
                      rows={3}
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug">URL Slug (optional)</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={generateSlug}
                        disabled={!formData.title}
                      >
                        Generate from title
                      </Button>
                    </div>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-friendly-slug"
                    />
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Publish immediately</Label>
                  <p className="text-sm text-gray-500">
                    Make this post visible to everyone
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createBlogMutation.isPending}
                  className="w-full"
                >
                  {createBlogMutation.isPending ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {formData.isPublished ? 'Publish Post' : 'Save as Draft'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Post Preview */}
          {parsedTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsedTags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Writing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold">Title</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep it concise and descriptive
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Content</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Use clear paragraphs and engaging language
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Tags</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Help readers find your content
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}