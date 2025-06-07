import OpenAI from "openai";
import { InsertProduct } from "@shared/schema";
import { analyzeIngredients } from "./openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface WebSearchResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

export async function searchProductByText(productName: string): Promise<WebSearchResult> {
  try {
    console.log(`Searching web for product: ${productName}`);
    
    // Use OpenAI to search for product information and ingredients
    const searchPrompt = `Find detailed information about the food product "${productName}". 
    Provide the response in JSON format with the following structure:
    {
      "productName": "exact product name",
      "brands": "brand name if available",
      "description": "brief product description", 
      "ingredients": "complete ingredients list if available",
      "category": "product category",
      "found": true/false
    }
    
    If the product cannot be found or identified, set "found" to false.
    Focus on finding accurate ingredient information for food products.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a food product research assistant. Provide accurate, factual information about food products and their ingredients. Always respond with valid JSON."
        },
        {
          role: "user", 
          content: searchPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const searchResult = JSON.parse(response.choices[0].message.content || '{}');
    
    if (!searchResult.found) {
      return {
        product: null,
        source: 'web-search',
        error: 'Product not found in web search'
      };
    }

    // Analyze ingredients if available
    let processingScore = 0;
    let processingExplanation = "No ingredients available for analysis";
    
    if (searchResult.ingredients) {
      try {
        const analysis = await analyzeIngredients(
          searchResult.ingredients,
          searchResult.productName || productName
        );
        processingScore = analysis.score;
        processingExplanation = analysis.explanation;
      } catch (error) {
        console.error("Failed to analyze web search ingredients:", error);
        processingExplanation = "Unable to analyze ingredients at this time";
      }
    }

    const productData: InsertProduct = {
      barcode: `TEXT_${Date.now()}`, // Generate a unique identifier for text-based searches
      productName: searchResult.productName || productName,
      brands: searchResult.brands || null,
      imageUrl: null, // Web search doesn't provide images in this implementation
      ingredientsText: searchResult.ingredients || null,
      nutriments: null, // Web search doesn't provide detailed nutriments
      processingScore,
      processingExplanation,
      dataSource: 'Web Search'
    };

    console.log('Found product via web search');
    return { product: productData, source: 'Web Search' };
    
  } catch (error) {
    console.error('Web search failed:', error);
    return {
      product: null,
      source: 'web-search',
      error: 'Web search failed: ' + (error as Error).message
    };
  }
}