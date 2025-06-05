import OpenAI from "openai";
import { ProcessingAnalysis } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeIngredients(ingredientsText: string, productName: string): Promise<ProcessingAnalysis> {
  try {
    const prompt = `Analyze the following food product ingredients for processing level. Provide a score from 0-10 where:
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
  "explanation": "detailed explanation of the processing level and reasoning",
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
