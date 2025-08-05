import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Globe, 
  Menu, 
  Settings, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  Palette,
  Layout,
  Image,
  Type,
  Link as LinkIcon,
  Crown,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import logoPath from "@assets/ProcessedOrNot-Logo-2-zoom-round-512x512_1749623629090.png";

interface MenuItem {
  id: number;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  isVisible: boolean;
  isAdminOnly: boolean;
  order: number;
  parentId?: number;
  target: '_self' | '_blank';
  cssClass?: string;
  createdAt: string;
  updatedAt: string;
}

interface WebsiteSettings {
  id: number;
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  footerText: string;
  contactEmail: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  seoSettings: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  maintenanceMode: boolean;
  analyticsCode?: string;
  customCss?: string;
  customJs?: string;
  updatedAt: string;
}

function MenuItemEditor({ 
  item, 
  onSave, 
  onCancel, 
  isNew = false 
}: { 
  item: Partial<MenuItem>; 
  onSave: (item: Partial<MenuItem>) => void; 
  onCancel: () => void;
  isNew?: boolean;
}) {
  const [formData, setFormData] = useState(item);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Menu Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter menu item title"
              className="mobile-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="/page-url or https://external-link.com"
              className="mobile-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="icon">Icon (Lucide Icon Name)</Label>
            <Input
              id="icon"
              value={formData.icon || ''}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="Home, Settings, User, etc."
              className="mobile-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cssClass">CSS Classes</Label>
            <Input
              id="cssClass"
              value={formData.cssClass || ''}
              onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
              placeholder="custom-class another-class"
              className="mobile-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this menu item"
            className="mobile-input"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Visible</p>
              <p className="text-xs text-muted-foreground">Show in menu</p>
            </div>
            <Switch 
              checked={formData.isVisible ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium">Admin Only</p>
              <p className="text-xs text-muted-foreground">Restrict access</p>
            </div>
            <Switch 
              checked={formData.isAdminOnly ?? false}
              onCheckedChange={(checked) => setFormData({ ...formData, isAdminOnly: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Link Target</Label>
            <select 
              id="target"
              value={formData.target || '_self'}
              onChange={(e) => setFormData({ ...formData, target: e.target.value as '_self' | '_blank' })}
              className="w-full p-2 border rounded-md mobile-input"
            >
              <option value="_self">Same Window</option>
              <option value="_blank">New Window</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order || 0}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="mobile-input"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="mobile-button" size="mobile">
            <Save className="w-4 h-4 mr-2" />
            {isNew ? 'Create Item' : 'Save Changes'}
          </Button>
          <Button onClick={onCancel} variant="outline" className="mobile-button" size="mobile">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MainMenuManagement() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Fetch menu items
  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/admin/menu-items"],
  });

  // Create menu item mutation
  const createMenuItemMutation = useMutation({
    mutationFn: async (item: Partial<MenuItem>) => {
      return await fetch('/api/admin/menu-items', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setIsCreating(false);
    },
  });

  // Update menu item mutation
  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, ...item }: Partial<MenuItem> & { id: number }) => {
      return await fetch(`/api/admin/menu-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
      setEditingItem(null);
    },
  });

  // Delete menu item mutation
  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetch(`/api/admin/menu-items/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
    },
  });

  // Reorder menu items mutation
  const reorderMenuItemsMutation = useMutation({
    mutationFn: async (items: { id: number; order: number }[]) => {
      return await fetch('/api/admin/menu-items/reorder', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/menu-items"] });
    },
  });

  const handleCreateItem = (item: Partial<MenuItem>) => {
    createMenuItemMutation.mutate(item);
  };

  const handleUpdateItem = (item: Partial<MenuItem>) => {
    if (editingItem?.id) {
      updateMenuItemMutation.mutate({ id: editingItem.id, ...item });
    }
  };

  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  const handleMoveItem = (id: number, direction: 'up' | 'down') => {
    if (!menuItems) return;
    
    const sortedItems = [...menuItems].sort((a, b) => a.order - b.order);
    const currentIndex = sortedItems.findIndex(item => item.id === id);
    
    if (direction === 'up' && currentIndex > 0) {
      const targetItem = sortedItems[currentIndex - 1];
      const updates = [
        { id: sortedItems[currentIndex].id, order: targetItem.order },
        { id: targetItem.id, order: sortedItems[currentIndex].order }
      ];
      reorderMenuItemsMutation.mutate(updates);
    } else if (direction === 'down' && currentIndex < sortedItems.length - 1) {
      const targetItem = sortedItems[currentIndex + 1];
      const updates = [
        { id: sortedItems[currentIndex].id, order: targetItem.order },
        { id: targetItem.id, order: sortedItems[currentIndex].order }
      ];
      reorderMenuItemsMutation.mutate(updates);
    }
  };

  const sortedMenuItems = menuItems ? [...menuItems].sort((a, b) => a.order - b.order) : [];

  if (menuLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading menu items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Main Menu Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure navigation menu items and their visibility
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="mobile-button" 
          size="mobile"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Create new item form */}
      {isCreating && (
        <MenuItemEditor
          item={{ title: '', url: '', isVisible: true, isAdminOnly: false, order: (sortedMenuItems.length + 1) * 10, target: '_self' }}
          onSave={handleCreateItem}
          onCancel={() => setIsCreating(false)}
          isNew={true}
        />
      )}

      {/* Edit item form */}
      {editingItem && (
        <MenuItemEditor
          item={editingItem}
          onSave={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {/* Menu Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            Current Menu Items
          </CardTitle>
          <CardDescription>
            Manage the order and visibility of navigation menu items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedMenuItems.length === 0 ? (
            <div className="text-center py-8">
              <Menu className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Menu Items</h3>
              <p className="text-muted-foreground mb-4">
                Create your first menu item to get started
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Menu Item
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedMenuItems.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Button
                        onClick={() => handleMoveItem(item.id, 'up')}
                        disabled={index === 0 || reorderMenuItemsMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleMoveItem(item.id, 'down')}
                        disabled={index === sortedMenuItems.length - 1 || reorderMenuItemsMutation.isPending}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.isVisible ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                      {item.isAdminOnly && (
                        <Shield className="w-4 h-4 text-blue-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          Order: {item.order}
                        </Badge>
                        {item.target === '_blank' && (
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.url}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setEditingItem(item)}
                      variant="outline"
                      size="sm"
                      className="mobile-button"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive mobile-button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WebsiteManagement() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.accountType !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Website management is only available to Admin users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto mobile-safe-padding py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <img src={logoPath} alt="ProcessedOrNot" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                  Website Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Manage website content, menus, and appearance
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm flex-shrink-0">
              <Crown className="h-4 w-4 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto mobile-safe-padding py-4 sm:py-6 lg:py-8">
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Main Menu</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Main Menu Management Tab */}
          <TabsContent value="menu">
            <MainMenuManagement />
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Visual Appearance
                </CardTitle>
                <CardDescription>
                  Customize colors, branding, and visual elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Appearance Settings</h3>
                  <p className="text-muted-foreground">
                    Visual customization features will be available in future updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Content Management
                </CardTitle>
                <CardDescription>
                  Manage pages, posts, and other website content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Layout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Content Management</h3>
                  <p className="text-muted-foreground">
                    Content management features will be available in future updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Website Settings
                </CardTitle>
                <CardDescription>
                  Configure global website settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Website Settings</h3>
                  <p className="text-muted-foreground">
                    Website configuration settings will be available in future updates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default WebsiteManagement;