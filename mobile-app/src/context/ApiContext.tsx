import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

// Use your existing backend API endpoint
const API_BASE_URL = 'https://processedornot.replit.app'; // Replace with your actual domain

interface ApiContextType {
  searchProduct: (query: string) => Promise<any>;
  getProductByBarcode: (barcode: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProduct = async (query: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/search`, {
        query,
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to search product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getProductByBarcode = async (barcode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/search`, {
        query: barcode,
      });
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get product');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ApiContext.Provider value={{ searchProduct, getProductByBarcode, isLoading, error }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};