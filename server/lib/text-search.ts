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

    // First, use OpenAI to analyze the search term and suggest search keywords
    const keywordPrompt = `The user is searching for a food product: "${productName}"

Please analyze this search term and provide optimized search keywords for food database searches in JSON format:
{
  "searchTerms": ["term1", "term2", "term3"],
  "category": "food category",
  "isGeneric": true/false,
  "language": "detected language code"
}

Return 3-5 search terms that would be most effective for finding this product in food databases. Include variations, English translations, and related terms.
For example:
- "Gehakt" → ["ground meat", "minced meat", "gehakt", "beef mince", "pork mince"]
- "Gehaktbal" → ["meatball", "gehaktbal", "Dutch meatball", "beef ball", "pork ball"]
- "Chocolate" → ["chocolate", "cocoa", "dark chocolate", "milk chocolate", "chocolate bar"]`;

    const keywordResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a food search optimization specialist. Help users find the best search terms for food databases." },
        { role: "user", content: keywordPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.3,
    });

    const keywordResult = JSON.parse(keywordResponse.choices[0].message.content || '{"searchTerms": [], "isGeneric": true}');
    const searchTerms = keywordResult.searchTerms || [productName];

    console.log(`Generated search terms for "${productName}":`, searchTerms);

    // Create a generic product entry based on the search term and OpenAI analysis
    const productAnalysisPrompt = `Create a generic food product entry for: "${productName}"

Based on your knowledge of this type of food product, provide realistic nutritional information in JSON format:
{
  "productName": "standardized product name",
  "category": "food category",
  "description": "brief description",
  "ingredientsText": "typical ingredients for this type of product",
  "nutriments": {
    "energy_100g": typical_calories_per_100g,
    "fat_100g": typical_fat_grams_per_100g,
    "saturated_fat_100g": typical_saturated_fat_per_100g,
    "carbohydrates_100g": typical_carbs_per_100g,
    "sugars_100g": typical_sugar_per_100g,
    "proteins_100g": typical_protein_per_100g,
    "salt_100g": typical_salt_per_100g,
    "fiber_100g": typical_fiber_per_100g
  },
  "isGeneric": true
}

Provide realistic nutritional values based on typical products of this type. This is for educational purposes about general food categories.`;

    let searchResult: any;
    
    try {
      const productResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a nutrition expert. Provide realistic nutritional information for typical food products based on established nutritional databases." },
          { role: "user", content: productAnalysisPrompt }
        ],
        response_format: { type: "json_object" },
        max_tokens: 600,
        temperature: 0.3,
      });

      searchResult = JSON.parse(productResponse.choices[0].message.content || '{}');
      console.log("OpenAI response for text search:", searchResult);
      
    } catch (error) {
      console.error("Error getting product analysis from OpenAI:", error);
      searchResult = {};
    }

    // Ensure we have basic data
    if (!searchResult || !searchResult.productName) {
      // If the analysis failed, create a basic entry with the original search term
      searchResult = {
        productName: productName,
        category: "Food Product",
        description: `Generic information for ${productName}`,
        ingredientsText: null,
        nutriments: null,
        isGeneric: true
      };
      console.log("Created fallback search result:", searchResult);
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
    }

    // ALWAYS analyze glycemic index if we have nutrition data (ingredients not required)
    if (searchResult.nutriments) {
      try {
        const glycemicAnalysis = await analyzeGlycemicIndex(
          searchResult.ingredientsText || "",
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
    
    // Create a fallback product entry even if there's an error
    const fallbackProduct: InsertProduct = {
      barcode: `text-${Date.now()}`,
      productName: productName,
      brands: null,
      imageUrl: null,
      ingredientsText: null,
      nutriments: null,
      processingScore: 0,
      processingExplanation: `Unable to analyze processing level for "${productName}". This is a generic entry.`,
      glycemicIndex: null,
      glycemicLoad: null,
      glycemicExplanation: "No glycemic data available for this generic entry.",
      dataSource: 'Text Search (Generic)'
    };
    
    console.log('Created fallback product for text search error:', fallbackProduct.productName);
    return { product: fallbackProduct, source: 'Text Search (Generic)' };
  }
}