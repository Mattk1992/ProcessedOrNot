import { apiRequest } from "./queryClient";
import type { Product, ProcessingAnalysis } from "@shared/schema";

export const api = {
  async getProduct(barcode: string): Promise<Product> {
    const response = await apiRequest("GET", `/api/products/${barcode}`);
    return response.json();
  },

  async getProductAnalysis(barcode: string): Promise<ProcessingAnalysis> {
    const response = await apiRequest("GET", `/api/products/${barcode}/analysis`);
    return response.json();
  },
};
