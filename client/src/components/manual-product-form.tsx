import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertProductSchema } from "@shared/schema";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Plus } from "lucide-react";
import { z } from "zod";

const manualProductSchema = insertProductSchema.extend({
  barcode: z.string().min(8, "Barcode must be at least 8 digits"),
  productName: z.string().min(1, "Product name is required"),
  brands: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ingredientsText: z.string().optional().nullable(),
});

type ManualProductFormData = z.infer<typeof manualProductSchema>;

interface ManualProductFormProps {
  barcode: string;
  onProductCreated: () => void;
  onCancel: () => void;
}

export default function ManualProductForm({ barcode, onProductCreated, onCancel }: ManualProductFormProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<ManualProductFormData>({
    resolver: zodResolver(manualProductSchema),
    defaultValues: {
      barcode,
      productName: "",
      brands: null,
      imageUrl: null,
      ingredientsText: null,
      nutriments: {},
      processingScore: 0,
      processingExplanation: "",
      dataSource: "Manual Entry",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (data: ManualProductFormData) => {
      // Convert form data to match API expectations
      const productData = {
        ...data,
        brands: data.brands || null,
        imageUrl: data.imageUrl || null,
        ingredientsText: data.ingredientsText || null,
        nutriments: data.nutriments || {},
        processingScore: data.processingScore || 0,
        processingExplanation: data.processingExplanation || "",
        dataSource: data.dataSource || "Manual Entry",
        lastUpdated: null,
      };
      return api.createProduct(productData);
    },
    onSuccess: (product) => {
      toast({
        title: "Product created successfully",
        description: `${product.productName} has been added to the database.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products', barcode] });
      onProductCreated();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ManualProductFormData) => {
    createProductMutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Product Manually
        </CardTitle>
        <CardDescription>
          Product with barcode {barcode} was not found in any database. 
          You can add it manually below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brands"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter brand name" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter image URL (optional)" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ingredientsText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Enter ingredients list (optional)"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createProductMutation.isPending}
                className="flex-1"
              >
                {createProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Product
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}