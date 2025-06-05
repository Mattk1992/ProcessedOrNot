import { apiRequest } from "./queryClient";
import type { Product, ProcessingAnalysis } from "@shared/schema";

export const api = {
  async getProduct(barcode: string): Promise<Product & { lookupSource?: string }> {
    const response = await apiRequest("GET", `/api/products/${barcode}`);
    return response.json();
  },

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    const response = await apiRequest("POST", "/api/products", productData);
    return response.json();
  },

  async getProductAnalysis(barcode: string): Promise<ProcessingAnalysis> {
    const response = await apiRequest("GET", `/api/products/${barcode}/analysis`);
    return response.json();
  },
};
