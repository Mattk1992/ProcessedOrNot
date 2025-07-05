import OpenAI from "openai";
import { InsertProduct } from "@shared/schema";
import { analyzeIngredients, analyzeGlycemicIndex } from "./openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ProductSearchResult {
  product: InsertProduct | null;
  source: string;
  error?: string;
}

interface SearchFilter {
  includeBrands?: string[];
  excludeBrands?: string[];
}

export function isBarcode(input: string): boolean {
  // Remove any spaces and check if it's purely numeric
  const cleaned = input.replace(/\s/g, '');
  
  // Check for common barcode formats
  const barcodePatterns = [
    /^\d{8}$/,     // EAN-8
    /^\d{12}$/,    // UPC-A
    /^\d{13}$/,    // EAN-13
    /^\d{14}$/,    // ITF-14
    /^[0-9]{6,18}$/ // General numeric barcode range
  ];
  
  return barcodePatterns.some(pattern => pattern.test(cleaned));
}

export async function searchProductByText(productName: string, filters?: SearchFilter): Promise<ProductSearchResult> {
  try {
    console.log(`Starting text search for product: ${productName}`, filters ? `with filters: ${JSON.stringify(filters)}` : '');

    // Build filter instructions
    let filterInstructions = '';
    if (filters?.includeBrands && filters.includeBrands.length > 0) {
      filterInstructions += `\n\nIMPORTANT: Only include products from these brands: ${filters.includeBrands.join(', ')}`;
    }
    if (filters?.excludeBrands && filters.excludeBrands.length > 0) {
      filterInstructions += `\n\nIMPORTANT: Exclude products from these brands: ${filters.excludeBrands.join(', ')}`;
    }

    // Use OpenAI to search for comprehensive product information
    const searchPrompt = `Search for detailed information about the product: "${productName}"${filterInstructions}

Please provide comprehensive information in JSON format:
{
  "productName": "official product name",
  "brands": "brand name if available", 
  "description": "brief description",
  "ingredientsText": "complete ingredients list if available",
  "category": "product category",
  "nutriments": {
    "energy_100g": number_in_kcal,
    "fat_100g": number_in_grams,
    "saturated_fat_100g": number_in_grams,
    "carbohydrates_100g": number_in_grams,
    "sugars_100g": number_in_grams,
    "proteins_100g": number_in_grams,
    "salt_100g": number_in_grams,
    "sodium_100g": number_in_mg,
    "fiber_100g": number_in_grams
  },
  "found": true/false
}

Include nutrition facts per 100g when available. If you cannot find specific information, return {"found": false}.
Focus on finding real, accurate product information including ingredients and nutrition data.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: "You are a product information specialist. Provide accurate, real product information only. Do not make up or invent product details." },
        { role: "user", content: searchPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.3,
    });

    const searchResult = JSON.parse(response.choices[0].message.content || '{"found": false}');

    if (!searchResult.found) {
      return {
        product: null,
        source: 'text-search',
        error: `Could not find detailed information for "${productName}". Try scanning a barcode or being more specific.`
      };
    }

    // Apply brand filtering if specified
    if (filters && searchResult.brands) {
      const productBrand = searchResult.brands.toLowerCase();
      
      // Check exclude filters
      if (filters.excludeBrands && filters.excludeBrands.length > 0) {
        const isExcluded = filters.excludeBrands.some(brand => 
          productBrand.includes(brand.toLowerCase()) || brand.toLowerCase().includes(productBrand)
        );
        if (isExcluded) {
          return {
            product: null,
            source: 'text-search',
            error: `Product from brand "${searchResult.brands}" is excluded by filter settings.`
          };
        }
      }
      
      // Check include filters
      if (filters.includeBrands && filters.includeBrands.length > 0) {
        const isIncluded = filters.includeBrands.some(brand => 
          productBrand.includes(brand.toLowerCase()) || brand.toLowerCase().includes(productBrand)
        );
        if (!isIncluded) {
          return {
            product: null,
            source: 'text-search',
            error: `Product from brand "${searchResult.brands}" is not included in filter settings.`
          };
        }
      }
    }

    // Generate a unique identifier for text-based searches
    const textBasedId = `text-${Date.now()}`;

    // Analyze ingredients if available
    let processingScore = 0;
    let processingExplanation = "No ingredients available for analysis";
    let glycemicIndex = null;
    let glycemicLoad = null;
    let glycemicExplanation = "No data available for glycemic analysis";

    if (searchResult.ingredientsText) {
      try {
        const analysis = await analyzeIngredients(
          searchResult.ingredientsText,
          searchResult.productName || productName
        );
        processingScore = analysis.score;
        processingExplanation = analysis.explanation;
      } catch (error) {
        console.error("Failed to analyze text search ingredients:", error);
        processingExplanation = "Unable to analyze ingredients at this time";
      }

      // Analyze glycemic index if we have both ingredients and nutrition data
      if (searchResult.nutriments) {
        try {
          const glycemicAnalysis = await analyzeGlycemicIndex(
            searchResult.ingredientsText,
            searchResult.productName || productName,
            searchResult.nutriments
          );
          glycemicIndex = glycemicAnalysis.glycemicIndex;
          glycemicLoad = glycemicAnalysis.glycemicLoad;
          glycemicExplanation = glycemicAnalysis.explanation;
        } catch (error) {
          console.error("Failed to analyze glycemic index:", error);
          glycemicExplanation = "Unable to analyze glycemic impact at this time";
        }
      }
    } else {
      // If no ingredients found, try to get them separately
      try {
        const ingredientsPrompt = `Find the complete ingredients list for the product: "${searchResult.productName || productName}"

Provide only the ingredients list in this format:
{
  "ingredientsText": "complete ingredients list",
  "found": true/false
}`;

        const ingredientsResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            { role: "system", content: "You are a product information specialist. Only provide real, accurate ingredients lists." },
            { role: "user", content: ingredientsPrompt }
          ],
          response_format: { type: "json_object" },
          max_tokens: 500,
          temperature: 0.2,
        });

        const ingredientsResult = JSON.parse(ingredientsResponse.choices[0].message.content || '{"found": false}');
        
        if (ingredientsResult.found && ingredientsResult.ingredientsText) {
          searchResult.ingredientsText = ingredientsResult.ingredientsText;
          
          const analysis = await analyzeIngredients(
            ingredientsResult.ingredientsText,
            searchResult.productName || productName
          );
          processingScore = analysis.score;
          processingExplanation = analysis.explanation;

          // Analyze glycemic index if we have nutrition data
          if (searchResult.nutriments) {
            try {
              const glycemicAnalysis = await analyzeGlycemicIndex(
                ingredientsResult.ingredientsText,
                searchResult.productName || productName,
                searchResult.nutriments
              );
              glycemicIndex = glycemicAnalysis.glycemicIndex;
              glycemicLoad = glycemicAnalysis.glycemicLoad;
              glycemicExplanation = glycemicAnalysis.explanation;
            } catch (error) {
              console.error("Failed to analyze glycemic index:", error);
              glycemicExplanation = "Unable to analyze glycemic impact at this time";
            }
          }
        }
      } catch (error) {
        console.error("Failed to get ingredients for text search:", error);
      }
    }

    const productData: InsertProduct = {
      barcode: textBasedId,
      productName: searchResult.productName || productName,
      brands: searchResult.brands || null,
      imageUrl: null, // Text search doesn't provide images
      ingredientsText: searchResult.ingredientsText || null,
      nutriments: searchResult.nutriments || null,
      processingScore,
      processingExplanation,
      glycemicIndex,
      glycemicLoad,
      glycemicExplanation,
      dataSource: 'Text Search'
    };

    console.log('Found product via text search:', productData.productName);
    return { product: productData, source: 'Text Search' };

  } catch (error) {
    console.error('Text search error:', error);
    return {
      product: null,
      source: 'text-search',
      error: `Failed to search for "${productName}". Please try a different search term.`
    };
  }
}