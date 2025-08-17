import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Utility function to save AI insights to search history
export async function saveAIInsightsToDatabase(searchId: string, insights: {
  nutriBotInsight?: string;
  funFacts?: string;
  nutritionSpotlight?: string;
  ingredientsList?: any;
  glycemicImpact?: string;
  nutritionFact?: string;
  processingAnalysis?: string;
  ingredientCategories?: any;
}) {
  try {
    console.log(`Saving AI insights for search ID: ${searchId}`);
    const response = await apiRequest('POST', `/api/search-history/${searchId}/ai-insights`, insights);
    const result = await response.json();
    console.log('AI insights saved successfully:', result);
    return result;
  } catch (error) {
    console.error('Error saving AI insights:', error);
    throw error;
  }
}
