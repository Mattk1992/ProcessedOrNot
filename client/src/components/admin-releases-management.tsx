import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff, 
  Send, 
  Archive, 
  RotateCcw,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Download
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

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

const releaseSchema = z.object({
  version: z.string().min(1, "Version is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  type: z.enum(["feature", "bugfix", "security", "improvement"]),
  priority: z.enum(["critical", "high", "normal", "low"]),
  isPublic: z.boolean(),
  isFeatured: z.boolean(),
  releaseDate: z.string().optional(),
  tags: z.string().optional(),
  changelogUrl: z.string().url().optional().or(z.literal("")),
  downloadUrl: z.string().url().optional().or(z.literal(""))
});

type ReleaseFormData = z.infer<typeof releaseSchema>;

export default function AdminReleasesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);

  // Fetch all releases (admin view)
  const { data: releases, isLoading, error } = useQuery({
    queryKey: ['/api/admin/releases'],
    queryFn: async () => {
      const response = await fetch('/api/admin/releases');
      if (!response.ok) {
        throw new Error('Failed to fetch releases');
      }
      return response.json() as Promise<Release[]>;
    }
  });

  // Create release mutation
  const createReleaseMutation = useMutation({
    mutationFn: async (data: ReleaseFormData) => {
      const payload = {
        ...data,
        releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString() : new Date().toISOString(),
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      const response = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to create release');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/releases'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Release created successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update release mutation
  const updateReleaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ReleaseFormData }) => {
      const payload = {
        ...data,
        releaseDate: data.releaseDate ? new Date(data.releaseDate).toISOString() : null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };

      const response = await fetch(`/api/admin/releases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update release');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/releases'] });
      setEditingRelease(null);
      toast({
        title: "Success",
        description: "Release updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete release mutation
  const deleteReleaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/releases/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete release');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/releases'] });
      toast({
        title: "Success",
        description: "Release deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Publish release mutation
  const publishReleaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/releases/${id}/publish`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to publish release');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/releases'] });
      toast({
        title: "Success",
        description: "Release published successfully and notifications sent to all users"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Unpublish release mutation
  const unpublishReleaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/releases/${id}/unpublish`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to unpublish release');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/releases'] });
      toast({
        title: "Success",
        description: "Release unpublished successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Archive release mutation
  const archiveReleaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/releases/${id}/archive`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to archive release');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/releases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/releases'] });
      toast({
        title: "Success",
        description: "Release archived successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const form = useForm<ReleaseFormData>({
    resolver: zodResolver(releaseSchema),
    defaultValues: {
      version: "",
      title: "",
      description: "",
      content: "",
      type: "feature",
      priority: "normal",
      isPublic: true,
      isFeatured: false,
      releaseDate: new Date().toISOString().split('T')[0],
      tags: "",
      changelogUrl: "",
      downloadUrl: ""
    }
  });

  const resetForm = () => {
    form.reset();
    setEditingRelease(null);
  };

  const handleEdit = (release: Release) => {
    setEditingRelease(release);
    form.reset({
      version: release.version,
      title: release.title,
      description: release.description,
      content: release.content,
      type: release.type as any,
      priority: release.priority as any,
      isPublic: release.isPublic,
      isFeatured: release.isFeatured,
      releaseDate: release.releaseDate ? new Date(release.releaseDate).toISOString().split('T')[0] : "",
      tags: release.tags?.join(', ') || "",
      changelogUrl: release.changelogUrl || "",
      downloadUrl: release.downloadUrl || ""
    });
  };

  const onSubmit = (data: ReleaseFormData) => {
    if (editingRelease) {
      updateReleaseMutation.mutate({ id: editingRelease.id, data });
    } else {
      createReleaseMutation.mutate(data);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Star className="w-4 h-4" />;
      case 'bugfix': return <CheckCircle className="w-4 h-4" />;
      case 'security': return <AlertCircle className="w-4 h-4" />;
      default: return <Tag className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-blue-500';
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const draftReleases = releases?.filter(r => r.status === 'draft') || [];
  const publishedReleases = releases?.filter(r => r.status === 'published') || [];
  const archivedReleases = releases?.filter(r => r.status === 'archived') || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
          <p className="text-muted-foreground">Loading releases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Failed to load releases</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Release Management</h2>
          <p className="text-muted-foreground">
            Create and manage software releases for all users
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen || !!editingRelease} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            resetForm();
          } else if (!editingRelease) {
            setIsCreateDialogOpen(true);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Release
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRelease ? "Edit Release" : "Create New Release"}
              </DialogTitle>
              <DialogDescription>
                {editingRelease 
                  ? "Update the release information below"
                  : "Fill in the details for the new release"
                }
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="version"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Version</FormLabel>
                        <FormControl>
                          <Input placeholder="1.0.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="releaseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Release title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief description of the release" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed release notes (markdown supported)" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Use markdown syntax. Example: ### Features, - New feature
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="feature">Feature</SelectItem>
                            <SelectItem value="bugfix">Bug Fix</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="improvement">Improvement</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input placeholder="tag1, tag2, tag3" {...field} />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags for categorization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="changelogUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Changelog URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="downloadUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Download URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Public Release</FormLabel>
                          <FormDescription>
                            Make this release visible to all users
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Featured Release</FormLabel>
                          <FormDescription>
                            Highlight this release prominently
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createReleaseMutation.isPending || updateReleaseMutation.isPending}
                  >
                    {createReleaseMutation.isPending || updateReleaseMutation.isPending 
                      ? "Saving..." 
                      : editingRelease ? "Update Release" : "Create Release"
                    }
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Releases Tabs */}
      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">Published ({publishedReleases.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftReleases.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedReleases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          {publishedReleases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Published Releases</h3>
                <p className="text-muted-foreground text-center">
                  Published releases will appear here once you publish drafts.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {publishedReleases.map((release) => (
                <Card key={release.id} className="hover:shadow-md transition-shadow">
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
                            className={`${getStatusColor(release.status)} text-white`}
                          >
                            {release.status}
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
                          {release.notificationSent && (
                            <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
                              <Send className="w-3 h-3" />
                              Notified
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg">{release.title}</CardTitle>
                        <CardDescription>{release.description}</CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1 mb-1">
                          <Tag className="w-3 h-3" />
                          <span>{release.version}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(release.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(release)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => unpublishReleaseMutation.mutate(release.id)}
                          disabled={unpublishReleaseMutation.isPending}
                        >
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unpublish
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => archiveReleaseMutation.mutate(release.id)}
                          disabled={archiveReleaseMutation.isPending}
                        >
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        {release.changelogUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={release.changelogUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {release.downloadUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteReleaseMutation.mutate(release.id)}
                          disabled={deleteReleaseMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {draftReleases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Edit className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Draft Releases</h3>
                <p className="text-muted-foreground text-center">
                  Create a new release to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {draftReleases.map((release) => (
                <Card key={release.id} className="hover:shadow-md transition-shadow">
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
                            className={`${getStatusColor(release.status)} text-white`}
                          >
                            {release.status}
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
                        <CardTitle className="text-lg">{release.title}</CardTitle>
                        <CardDescription>{release.description}</CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1 mb-1">
                          <Tag className="w-3 h-3" />
                          <span>{release.version}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(release.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(release)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => publishReleaseMutation.mutate(release.id)}
                          disabled={publishReleaseMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Publish & Notify
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        {release.changelogUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={release.changelogUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        {release.downloadUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={release.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteReleaseMutation.mutate(release.id)}
                          disabled={deleteReleaseMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {archivedReleases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Archive className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Archived Releases</h3>
                <p className="text-muted-foreground text-center">
                  Archived releases will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {archivedReleases.map((release) => (
                <Card key={release.id} className="hover:shadow-md transition-shadow opacity-75">
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
                            className={`${getStatusColor(release.status)} text-white`}
                          >
                            {release.status}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`${getPriorityColor(release.priority)} text-white`}
                          >
                            {release.priority}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{release.title}</CardTitle>
                        <CardDescription>{release.description}</CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1 mb-1">
                          <Tag className="w-3 h-3" />
                          <span>{release.version}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(release.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => unpublishReleaseMutation.mutate(release.id)}
                          disabled={unpublishReleaseMutation.isPending}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restore to Draft
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => deleteReleaseMutation.mutate(release.id)}
                          disabled={deleteReleaseMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}