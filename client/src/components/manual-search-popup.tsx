import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface ManualSearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  barcode: string;
  onProductFound: () => void;
}

export default function ManualSearchPopup({ isOpen, onClose, barcode, onProductFound }: ManualSearchPopupProps) {
  const [productName, setProductName] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const searchMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/products/manual-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, productName: name }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      return response.json();
    },
    onSuccess: (data) => {
      setSearchError(null);
      // Invalidate the product query to refetch with new data
      queryClient.invalidateQueries({ queryKey: ["/api/products", barcode] });
      onProductFound();
      onClose();
    },
    onError: (error) => {
      setSearchError(error instanceof Error ? error.message : "Search failed");
    },
  });

  const handleSearch = () => {
    if (!productName.trim()) {
      setSearchError("Please enter a product name");
      return;
    }
    setSearchError(null);
    searchMutation.mutate(productName.trim());
  };

  const handleClose = () => {
    setProductName("");
    setSearchError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Manual Product Search
          </DialogTitle>
          <DialogDescription>
            We couldn't find this product in any of our 19 databases. Enter the product name to search all available food sources.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Enter the product name..."
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !searchMutation.isPending) {
                  handleSearch();
                }
              }}
              disabled={searchMutation.isPending}
            />
          </div>

          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={searchMutation.isPending || !productName.trim()}
              className="flex-1"
            >
              {searchMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Product
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={searchMutation.isPending}
            >
              Cancel
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            We'll search through OpenFoodFacts, USDA, European databases, and other nutrition sources to find product information.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}