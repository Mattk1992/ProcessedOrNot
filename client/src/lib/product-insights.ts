import { saveAIInsightsToProduct, apiRequest } from './queryClient';

// Comprehensive AI insights auto-saver for products
export class ProductInsightsManager {
  private static instance: ProductInsightsManager;
  private savedInsights: Map<string, Set<string>> = new Map();

  private constructor() {}

  static getInstance(): ProductInsightsManager {
    if (!ProductInsightsManager.instance) {
      ProductInsightsManager.instance = new ProductInsightsManager();
    }
    return ProductInsightsManager.instance;
  }

  // Check if insight was already saved for this barcode
  private wasInsightSaved(barcode: string, insightType: string): boolean {
    const barcodeInsights = this.savedInsights.get(barcode);
    return barcodeInsights ? barcodeInsights.has(insightType) : false;
  }

  // Mark insight as saved for this barcode
  private markInsightSaved(barcode: string, insightType: string): void {
    if (!this.savedInsights.has(barcode)) {
      this.savedInsights.set(barcode, new Set());
    }
    this.savedInsights.get(barcode)!.add(insightType);
  }

  // Save NutriBot insight to products database
  async saveNutriBotInsight(barcode: string, insight: any): Promise<void> {
    if (this.wasInsightSaved(barcode, 'nutriBotInsight')) {
      console.log(`NutriBot insight already saved for barcode: ${barcode}`);
      return;
    }

    try {
      await saveAIInsightsToProduct(barcode, { 
        nutriBotInsight: typeof insight === 'string' ? insight : JSON.stringify(insight) 
      });
      this.markInsightSaved(barcode, 'nutriBotInsight');
      console.log(`✓ NutriBot insight saved to products database for barcode: ${barcode}`);
    } catch (error) {
      console.warn(`Failed to save NutriBot insight for barcode ${barcode}:`, error);
    }
  }

  // Save fun facts to products database
  async saveFunFacts(barcode: string, facts: any[]): Promise<void> {
    if (this.wasInsightSaved(barcode, 'funFacts')) {
      console.log(`Fun facts already saved for barcode: ${barcode}`);
      return;
    }

    try {
      await saveAIInsightsToProduct(barcode, { 
        funFacts: JSON.stringify(facts) 
      });
      this.markInsightSaved(barcode, 'funFacts');
      console.log(`✓ Fun facts saved to products database for barcode: ${barcode}`);
    } catch (error) {
      console.warn(`Failed to save fun facts for barcode ${barcode}:`, error);
    }
  }

  // Save nutrition spotlight to products database
  async saveNutritionSpotlight(barcode: string, spotlight: any): Promise<void> {
    if (this.wasInsightSaved(barcode, 'nutritionSpotlight')) {
      console.log(`Nutrition spotlight already saved for barcode: ${barcode}`);
      return;
    }

    try {
      await saveAIInsightsToProduct(barcode, { 
        nutritionSpotlight: JSON.stringify(spotlight) 
      });
      this.markInsightSaved(barcode, 'nutritionSpotlight');
      console.log(`✓ Nutrition spotlight saved to products database for barcode: ${barcode}`);
    } catch (error) {
      console.warn(`Failed to save nutrition spotlight for barcode ${barcode}:`, error);
    }
  }

  // Save processing analysis and ingredient categories to products database
  async saveProcessingAnalysis(barcode: string, analysis: any): Promise<void> {
    if (this.wasInsightSaved(barcode, 'processingAnalysis')) {
      console.log(`Processing analysis already saved for barcode: ${barcode}`);
      return;
    }

    try {
      const insights: any = {};
      if (analysis.explanation) {
        insights.processingAnalysis = analysis.explanation;
      }
      if (analysis.categories) {
        insights.ingredientCategories = JSON.stringify(analysis.categories);
      }

      if (Object.keys(insights).length > 0) {
        await saveAIInsightsToProduct(barcode, insights);
        this.markInsightSaved(barcode, 'processingAnalysis');
        console.log(`✓ Processing analysis saved to products database for barcode: ${barcode}`);
      }
    } catch (error) {
      console.warn(`Failed to save processing analysis for barcode ${barcode}:`, error);
    }
  }

  // Save glycemic impact to products database
  async saveGlycemicImpact(barcode: string, glycemicData: any): Promise<void> {
    if (this.wasInsightSaved(barcode, 'glycemicImpact')) {
      console.log(`Glycemic impact already saved for barcode: ${barcode}`);
      return;
    }

    try {
      const glycemicInsight = {
        glycemicIndex: glycemicData.glycemicIndex,
        glycemicLoad: glycemicData.glycemicLoad,
        explanation: glycemicData.explanation,
        category: glycemicData.category,
        impactDescription: glycemicData.impactDescription
      };
      
      await saveAIInsightsToProduct(barcode, { 
        glycemicImpact: JSON.stringify(glycemicInsight) 
      });
      this.markInsightSaved(barcode, 'glycemicImpact');
      console.log(`✓ Glycemic impact saved to products database for barcode: ${barcode}`);
    } catch (error) {
      console.warn(`Failed to save glycemic impact for barcode ${barcode}:`, error);
    }
  }

  // Save ingredients list to products database
  async saveIngredientsList(barcode: string, ingredientsText: string): Promise<void> {
    if (this.wasInsightSaved(barcode, 'ingredientsList')) {
      console.log(`Ingredients list already saved for barcode: ${barcode}`);
      return;
    }

    try {
      await saveAIInsightsToProduct(barcode, { 
        ingredientsList: ingredientsText 
      });
      this.markInsightSaved(barcode, 'ingredientsList');
      console.log(`✓ Ingredients list saved to products database for barcode: ${barcode}`);
    } catch (error) {
      console.warn(`Failed to save ingredients list for barcode ${barcode}:`, error);
    }
  }

  // Save nutrition facts to products database
  async saveNutritionFacts(barcode: string, nutriments: any): Promise<void> {
    if (this.wasInsightSaved(barcode, 'nutritionFact')) {
      console.log(`Nutrition facts already saved for barcode: ${barcode}`);
      return;
    }

    try {
      await saveAIInsightsToProduct(barcode, { 
        nutritionFact: JSON.stringify(nutriments) 
      });
      this.markInsightSaved(barcode, 'nutritionFact');
      console.log(`✓ Nutrition facts saved to products database for barcode: ${barcode}`);
    } catch (error) {
      console.warn(`Failed to save nutrition facts for barcode ${barcode}:`, error);
    }
  }

  // Save all available insights for a product
  async saveAllProductInsights(barcode: string, product: any): Promise<void> {
    console.log(`🔄 Auto-saving all AI insights for product: ${barcode}`);
    
    const promises: Promise<void>[] = [];

    // Save ingredients list if available
    if (product.ingredientsText) {
      promises.push(this.saveIngredientsList(barcode, product.ingredientsText));
    }

    // Save nutrition facts if available
    if (product.nutriments) {
      promises.push(this.saveNutritionFacts(barcode, product.nutriments));
    }

    // Execute all saves in parallel
    await Promise.all(promises);
    console.log(`✅ Completed auto-saving insights for product: ${barcode}`);
  }

  // Clear saved insights cache (useful for testing)
  clearCache(): void {
    this.savedInsights.clear();
    console.log('ProductInsightsManager cache cleared');
  }
}

// Export singleton instance
export const productInsightsManager = ProductInsightsManager.getInstance();

// Search History AI Insights Manager - Automatically saves AI insights to search_history database
class SearchHistoryInsightsManager {
  private cache = new Map<string, Set<string>>();
  
  private async saveInsightToSearchHistory(barcode: string, insightType: string, data: any) {
    const cacheKey = `${barcode}_${insightType}`;
    if (this.cache.has(cacheKey)) return; // Already saved
    
    try {
      await apiRequest('PUT', `/api/search-history/${barcode}/ai-insights`, {
        [insightType]: data
      });
      
      // Add to cache to prevent duplicates
      if (!this.cache.has(barcode)) {
        this.cache.set(barcode, new Set());
      }
      this.cache.get(barcode)?.add(insightType);
    } catch (error) {
      console.error(`Failed to save ${insightType} to search history:`, error);
    }
  }
  
  async saveNutriBotInsight(barcode: string, insight: string) {
    await this.saveInsightToSearchHistory(barcode, 'nutriBotInsight', insight);
  }
  
  async saveFunFacts(barcode: string, facts: any) {
    const factsString = Array.isArray(facts) ? JSON.stringify(facts) : facts;
    await this.saveInsightToSearchHistory(barcode, 'funFacts', factsString);
  }
  
  async saveNutritionSpotlight(barcode: string, spotlight: any) {
    const spotlightString = typeof spotlight === 'object' ? JSON.stringify(spotlight) : spotlight;
    await this.saveInsightToSearchHistory(barcode, 'nutritionSpotlight', spotlightString);
  }
  
  async saveProcessingAnalysis(barcode: string, analysis: any) {
    const analysisString = typeof analysis === 'object' ? JSON.stringify(analysis) : analysis;
    await this.saveInsightToSearchHistory(barcode, 'processingAnalysis', analysisString);
    
    // Also save ingredient categories if available
    if (analysis?.ingredientCategories) {
      await this.saveInsightToSearchHistory(barcode, 'ingredientCategories', analysis.ingredientCategories);
    }
  }
  
  async saveGlycemicImpact(barcode: string, impact: any) {
    const impactString = typeof impact === 'object' ? JSON.stringify(impact) : impact;
    await this.saveInsightToSearchHistory(barcode, 'glycemicImpact', impactString);
  }
  
  async saveIngredientsList(barcode: string, ingredients: any) {
    await this.saveInsightToSearchHistory(barcode, 'ingredientsList', ingredients);
  }
  
  async saveNutritionFact(barcode: string, fact: string) {
    await this.saveInsightToSearchHistory(barcode, 'nutritionFact', fact);
  }
  
  async saveAllInsights(barcode: string, product: any) {
    if (product.nutriBotInsight) {
      await this.saveNutriBotInsight(barcode, product.nutriBotInsight);
    }
    if (product.funFacts) {
      await this.saveFunFacts(barcode, product.funFacts);
    }
    if (product.nutritionSpotlight) {
      await this.saveNutritionSpotlight(barcode, product.nutritionSpotlight);
    }
    if (product.processingAnalysis) {
      await this.saveProcessingAnalysis(barcode, product.processingAnalysis);
    }
    if (product.glycemicImpact) {
      await this.saveGlycemicImpact(barcode, product.glycemicImpact);
    }
    if (product.ingredientsList) {
      await this.saveIngredientsList(barcode, product.ingredientsList);
    }
    if (product.nutritionFact) {
      await this.saveNutritionFact(barcode, product.nutritionFact);
    }
  }
}

export const searchHistoryInsightsManager = new SearchHistoryInsightsManager();