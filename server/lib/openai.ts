import OpenAI from "openai";
import { ProcessingAnalysis, GlycemicAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeIngredients(ingredientsText: string, productName: string, language: string = 'en'): Promise<ProcessingAnalysis> {
  try {
    const languageInstructions: Record<string, string> = {
      'en': 'Provide your analysis in English.',
      'es': 'Proporciona tu análisis en español.',
      'fr': 'Fournissez votre analyse en français.',
      'de': 'Stellen Sie Ihre Analyse auf Deutsch bereit.',
      'zh': '请用中文提供分析。',
      'ja': '日本語で分析を提供してください。',
      'nl': 'Geef je analyse in het Nederlands.'
    };

    const languageInstruction = languageInstructions[language] || languageInstructions['en'];

    const prompt = `Analyze the following food product ingredients for processing level. ${languageInstruction} Provide a score from 0-10 where:
0-2: Minimally processed (whole foods, basic preparation)
3-4: Processed culinary ingredients (oils, butter, sugar, salt)
5-6: Processed foods (canned vegetables, simple breads, cheese)
7-8: Ultra-processed foods (most packaged snacks, sugary drinks, instant meals)
9-10: Highly ultra-processed (complex industrial formulations with many additives)

Product: ${productName}
Ingredients: ${ingredientsText}

Categorize each ingredient into one of these categories:
- Ultra-processed: Industrial ingredients, artificial additives, emulsifiers, preservatives, artificial flavors/colors
- Processed: Refined ingredients, added sugars, processed dairy, refined oils
- Minimally processed: Whole foods, basic ingredients with minimal modification

Provide your response in JSON format with this structure:
{
  "score": number,
  "explanation": "detailed explanation of the processing level and reasoning in the requested language",
  "categories": {
    "ultraProcessed": ["ingredient1", "ingredient2"],
    "processed": ["ingredient3", "ingredient4"],
    "minimallyProcessed": ["ingredient5", "ingredient6"]
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a food science expert specializing in analyzing food processing levels. Provide accurate, evidence-based assessments of ingredient processing levels."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    return {
      score: Math.max(0, Math.min(10, Math.round(result.score || 0))),
      explanation: result.explanation || "Unable to analyze ingredients",
      categories: {
        ultraProcessed: result.categories?.ultraProcessed || [],
        processed: result.categories?.processed || [],
        minimallyProcessed: result.categories?.minimallyProcessed || [],
      },
    };
  } catch (error) {
    console.error("Error analyzing ingredients with OpenAI:", error);
    throw new Error("Failed to analyze ingredients processing level");
  }
}

export async function analyzeGlycemicIndex(
  ingredientsText: string, 
  productName: string, 
  nutriments: any,
  language: string = 'en'
): Promise<GlycemicAnalysis> {
  try {
    const languageInstructions: Record<string, string> = {
      'en': 'Provide your analysis in English.',
      'es': 'Proporciona tu análisis en español.',
      'fr': 'Fournissez votre analyse en français.',
      'de': 'Stellen Sie Ihre Analyse auf Deutsch bereit.',
      'zh': '请用中文提供分析。',
      'ja': '日本語で分析を提供してください。',
      'nl': 'Geef je analyse in het Nederlands.'
    };

    const languageInstruction = languageInstructions[language] || languageInstructions['en'];

    // Extract key nutritional data
    const carbohydrates = nutriments?.carbohydrates_100g || nutriments?.carbs_g || 0;
    const sugars = nutriments?.sugars_100g || nutriments?.sugar_g || 0;
    const fiber = nutriments?.fiber_100g || nutriments?.fiber_g || 0;
    const protein = nutriments?.proteins_100g || nutriments?.protein_g || 0;
    const fat = nutriments?.fat_100g || nutriments?.fat_g || 0;

    const prompt = `Analyze the glycemic index and glycemic load for this food product. ${languageInstruction}

Product: ${productName}
Ingredients: ${ingredientsText}

Nutritional Information (per 100g):
- Carbohydrates: ${carbohydrates}g
- Sugars: ${sugars}g
- Fiber: ${fiber}g
- Protein: ${protein}g
- Fat: ${fat}g

Based on the ingredients and nutritional profile, estimate:

1. Glycemic Index (GI): Scale 0-100
   - Low GI: 0-55 (slow glucose release)
   - Medium GI: 56-69 (moderate glucose release)  
   - High GI: 70-100 (rapid glucose release)

2. Glycemic Load (GL): Per typical serving (consider portion size)
   - Low GL: 0-10
   - Medium GL: 11-19
   - High GL: 20+

Consider factors like:
- Fiber content (lowers GI)
- Processing level (higher processing = higher GI)
- Fat and protein content (lower GI)
- Sugar types and starches
- Food structure and preparation

Provide your response in JSON format:
{
  "glycemicIndex": number (0-100),
  "glycemicLoad": number (0-40),
  "explanation": "detailed explanation of the GI/GL assessment and reasoning in the requested language",
  "category": "Low|Medium|High",
  "impactDescription": "description of blood sugar impact in the requested language"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert specializing in glycemic index assessment. Provide accurate, evidence-based estimates of how foods affect blood glucose levels."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Determine category based on GI
    let category: 'Low' | 'Medium' | 'High' = 'Low';
    const gi = result.glycemicIndex || 0;
    if (gi >= 70) category = 'High';
    else if (gi >= 56) category = 'Medium';

    return {
      glycemicIndex: Math.max(0, Math.min(100, Math.round(result.glycemicIndex || 0))),
      glycemicLoad: Math.max(0, Math.min(40, Math.round(result.glycemicLoad || 0))),
      explanation: result.explanation || "Unable to analyze glycemic impact",
      category,
      impactDescription: result.impactDescription || "No impact description available",
    };
  } catch (error) {
    console.error("Error analyzing glycemic index with OpenAI:", error);
    throw new Error("Failed to analyze glycemic index");
  }
}
