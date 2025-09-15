import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  BarChart3 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: number;
  barcode: string;
  productName?: string;
  brands?: string;
  imageUrl?: string;
  ingredientsText?: string;
  nutriments?: any;
  processingScore?: number;
  processingExplanation?: string;
  glycemicIndex?: number;
  glycemicLoad?: number;
  glycemicExplanation?: string;
  dataSource?: string;
  lastUpdated?: string;
  additionalImages?: string[];
  videoUrl?: string;
  mediaGallery?: any;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  // Fetch products with pagination and search
  const { data: productsData, isLoading } = useQuery<ProductsResponse>({
    queryKey: ["/api/admin/products", currentPage, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchQuery && { search: searchQuery })
      });
      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json() as Promise<ProductsResponse>;
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (barcode: string) => {
      return apiRequest("DELETE", `/api/admin/products/${barcode}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ barcode, updates }: { barcode: string; updates: Partial<Product> }) => {
      return apiRequest("PUT", `/api/admin/products/${barcode}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      return apiRequest("POST", "/api/admin/products", productData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsCreateDialogOpen(false);
      setEditForm({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      });
    },
  });

  const handleSearch = () => {
    setCurrentPage(1);
    queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditForm({
      productName: product.productName,
      brands: product.brands,
      imageUrl: product.imageUrl,
      ingredientsText: product.ingredientsText,
      processingScore: product.processingScore,
      processingExplanation: product.processingExplanation,
      glycemicIndex: product.glycemicIndex,
      glycemicLoad: product.glycemicLoad,
      glycemicExplanation: product.glycemicExplanation,
      dataSource: product.dataSource,
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (barcode: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(barcode);
    }
  };

  const handleUpdate = () => {
    if (!selectedProduct) return;
    updateProductMutation.mutate({
      barcode: selectedProduct.barcode,
      updates: editForm
    });
  };

  const handleCreate = () => {
    if (!editForm.barcode) {
      toast({
        title: "Error",
        description: "Barcode is required",
        variant: "destructive",
      });
      return;
    }
    createProductMutation.mutate(editForm);
  };

  const renderProductDialog = (product: Product | null, isEditing: boolean) => {
    if (!product && !isEditing) return null;

    const formData = isEditing ? editForm : product;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="barcode">Barcode</Label>
            {isEditing ? (
              <Input
                id="barcode"
                value={formData?.barcode || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, barcode: e.target.value }))}
                disabled={selectedProduct !== null} // Disable when editing existing product
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono">{formData?.barcode}</div>
            )}
          </div>
          <div>
            <Label htmlFor="productName">Product Name</Label>
            {isEditing ? (
              <Input
                id="productName"
                value={formData?.productName || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, productName: e.target.value }))}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.productName || "N/A"}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brands">Brands</Label>
            {isEditing ? (
              <Input
                id="brands"
                value={formData?.brands || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, brands: e.target.value }))}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.brands || "N/A"}</div>
            )}
          </div>
          <div>
            <Label htmlFor="dataSource">Data Source</Label>
            {isEditing ? (
              <Select
                value={formData?.dataSource || ""}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, dataSource: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OpenFoodFacts">OpenFoodFacts</SelectItem>
                  <SelectItem value="USDA">USDA</SelectItem>
                  <SelectItem value="Manual">Manual Entry</SelectItem>
                  <SelectItem value="API">API Import</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.dataSource || "N/A"}</div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          {isEditing ? (
            <Input
              id="imageUrl"
              value={formData?.imageUrl || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
            />
          ) : (
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.imageUrl || "N/A"}</div>
          )}
        </div>

        <div>
          <Label htmlFor="ingredientsText">Ingredients</Label>
          {isEditing ? (
            <Textarea
              id="ingredientsText"
              value={formData?.ingredientsText || ""}
              onChange={(e) => setEditForm(prev => ({ ...prev, ingredientsText: e.target.value }))}
              rows={3}
            />
          ) : (
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded max-h-20 overflow-y-auto">
              {formData?.ingredientsText || "N/A"}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="processingScore">Processing Score</Label>
            {isEditing ? (
              <Input
                id="processingScore"
                type="number"
                min="1"
                max="4"
                value={formData?.processingScore || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, processingScore: parseInt(e.target.value) || undefined }))}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.processingScore || "N/A"}</div>
            )}
          </div>
          <div>
            <Label htmlFor="glycemicIndex">Glycemic Index</Label>
            {isEditing ? (
              <Input
                id="glycemicIndex"
                type="number"
                min="0"
                max="100"
                value={formData?.glycemicIndex || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, glycemicIndex: parseInt(e.target.value) || undefined }))}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.glycemicIndex || "N/A"}</div>
            )}
          </div>
          <div>
            <Label htmlFor="glycemicLoad">Glycemic Load</Label>
            {isEditing ? (
              <Input
                id="glycemicLoad"
                type="number"
                min="0"
                value={formData?.glycemicLoad || ""}
                onChange={(e) => setEditForm(prev => ({ ...prev, glycemicLoad: parseInt(e.target.value) || undefined }))}
              />
            ) : (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">{formData?.glycemicLoad || "N/A"}</div>
            )}
          </div>
        </div>

        {formData?.processingExplanation && (
          <div>
            <Label>Processing Explanation</Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded max-h-20 overflow-y-auto">
              {formData.processingExplanation}
            </div>
          </div>
        )}

        {formData?.glycemicExplanation && (
          <div>
            <Label>Glycemic Explanation</Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded max-h-20 overflow-y-auto">
              {formData.glycemicExplanation}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage products database, search, edit, and delete products
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to the database
              </DialogDescription>
            </DialogHeader>
            {renderProductDialog(null, true)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? "Creating..." : "Create Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search products by name, brand, barcode, or ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} variant="outline">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Products Database
          </CardTitle>
          <CardDescription>
            {productsData?.pagination?.total || 0} total products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading products...</div>
          ) : !productsData?.products || productsData.products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            <div className="space-y-4">
              {productsData?.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <h4 className="font-medium">
                          {product.productName || "Unnamed Product"}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-mono">{product.barcode}</span>
                          {product.brands && (
                            <>
                              <span>•</span>
                              <span>{product.brands}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {product.processingScore && (
                        <Badge variant="outline">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Processing: {product.processingScore}
                        </Badge>
                      )}
                      {product.glycemicIndex && (
                        <Badge variant="outline">
                          GI: {product.glycemicIndex}
                        </Badge>
                      )}
                      <Badge variant="secondary">
                        {product.dataSource || "Unknown"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(product)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(product.barcode)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.pagination?.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {productsData.pagination?.page} of {productsData.pagination?.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === productsData.pagination?.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View product information
            </DialogDescription>
          </DialogHeader>
          {renderProductDialog(selectedProduct, false)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information
            </DialogDescription>
          </DialogHeader>
          {renderProductDialog(selectedProduct, true)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? "Updating..." : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}