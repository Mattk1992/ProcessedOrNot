import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProcessingAnalysis, GlycemicAnalysis } from "@shared/schema";
import { storage } from "../storage";
import { savePromptHistory, extractTokenUsage, generateSessionId, type PromptHistoryContext } from "./prompt-history";

// AI Provider SDKs initialization
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const googleAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Provider-Model Compatibility Matrix
const PROVIDER_MODELS = {
  "OpenAI": {
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o", // the current best OpenAI model
    nanoModel: "gpt-4o-mini"
  },
  "Anthropic": {
    models: ["claude-sonnet-4-20250514", "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022", "claude-3-sonnet-20240229"],
    defaultModel: "claude-sonnet-4-20250514", // the newest Anthropic model
    nanoModel: "claude-3-5-sonnet-20241022"
  },
  "Gemini": {
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
    defaultModel: "gemini-2.5-pro", // the newest Gemini model series
    nanoModel: "gemini-2.5-flash"
  },
  "OpenRouter": {
    models: [
      "deepseek/deepseek-r1:free",
      "deepseek/deepseek-chat-v3-0324:free", 
      "openai/gpt-oss-20b:free",
      "qwen/qwen-2.5-coder-32b-instruct:free",
      "google/gemma-2b-it:free",
      "mistralai/mistral-small-3.1:free",
      "meta-llama/llama-3.1-8b-instruct:free"
    ],
    defaultModel: "deepseek/deepseek-r1:free", // Default to DeepSeek R1 as it's the latest powerful free model
    nanoModel: "openai/gpt-oss-20b:free" // Smaller model for nano requests
  }
} as const;

type AIProvider = keyof typeof PROVIDER_MODELS;
type AIModel = string;

interface AIConfig {
  provider: AIProvider;
  model: AIModel;
  temperature: number;
  maxTokens: number;
  isValid: boolean;
  error?: string;
}

// Legacy function for backward compatibility
async function getModelConfig(provider: string = "ChatGPT") {
  const config = await getAIConfig(provider);
  return {
    model: config.model,
    temperature: config.temperature,
    maxTokens: config.maxTokens
  };
}

// Unified AI Request Function
interface AIRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  responseFormat?: "json" | "text";
  maxTokens?: number;
}

// Validate provider-model compatibility
function validateProviderModelCompatibility(provider: AIProvider, model: string): boolean {
  const providerConfig = PROVIDER_MODELS[provider];
  if (!providerConfig) {
    return false;
  }
  return providerConfig.models.includes(model);
}

export async function getAIConfig(requestedProvider?: string, requestedModel?: string): Promise<AIConfig> {
  try {
    // Normalize provider names upfront
    let normalizedProvider = requestedProvider;
    if (requestedProvider === "ChatGPT" || requestedProvider === "ChatGPT Nano") {
      normalizedProvider = "OpenAI";
    }
    
    // Get admin settings for provider and model
    const adminProvider = await getAdminDefaultAIProvider();
    const adminModel = await getAdminDefaultAIModel();
    
    // Normalize admin provider as well
    let normalizedAdminProvider = adminProvider;
    if (adminProvider === "ChatGPT" || adminProvider === "ChatGPT Nano") {
      normalizedAdminProvider = "OpenAI";
    }
    
    // Determine final provider and model
    let finalProvider: string;
    let finalModel: string;
    
    // Priority: requested > admin > default
    if (normalizedProvider && normalizedProvider !== "ChatGPT" && normalizedProvider !== "ChatGPT Nano") {
      finalProvider = normalizedProvider;
    } else {
      finalProvider = normalizedAdminProvider;
    }
    
    // Handle special ChatGPT variants with proper nano model enforcement
    let maxTokens = 1000;
    if (requestedProvider === "ChatGPT Nano") {
      maxTokens = 500;
      // For nano requests, prioritize nano model over admin model
      const providerConfig = PROVIDER_MODELS[finalProvider as AIProvider];
      if (requestedModel && providerConfig?.models.includes(requestedModel)) {
        finalModel = requestedModel; // Use explicitly requested model if valid
      } else {
        finalModel = providerConfig?.nanoModel || "gpt-4o-mini"; // Force nano model
      }
    } else {
      // Use requested model, admin model, or provider default
      const providerConfig = PROVIDER_MODELS[finalProvider as AIProvider];
      finalModel = requestedModel || adminModel || providerConfig?.defaultModel || "gpt-4o";
    }
    
    // Validate provider-model compatibility
    const isValid = validateProviderModelCompatibility(finalProvider as AIProvider, finalModel);
    
    if (!isValid) {
      console.warn(`Invalid model ${finalModel} for provider ${finalProvider}. Using default.`);
      const providerConfig = PROVIDER_MODELS[finalProvider as AIProvider];
      if (providerConfig) {
        finalModel = requestedProvider === "ChatGPT Nano" ? providerConfig.nanoModel : providerConfig.defaultModel;
      } else {
        // Fallback to OpenAI if provider not recognized
        finalProvider = "OpenAI";
        finalModel = requestedProvider === "ChatGPT Nano" ? "gpt-4o-mini" : "gpt-4o";
      }
    }
    
    return {
      provider: finalProvider as AIProvider,
      model: finalModel,
      temperature: 0.3,
      maxTokens,
      isValid: true
    };
  } catch (error) {
    console.error("Error getting AI configuration:", error);
    // Fallback configuration
    return {
      provider: "OpenAI",
      model: requestedProvider === "ChatGPT Nano" ? "gpt-4o-mini" : "gpt-4o",
      temperature: 0.3,
      maxTokens: requestedProvider === "ChatGPT Nano" ? 500 : 1000,
      isValid: false,
      error: (error as Error).message
    };
  }
}

export async function makeAIRequest(config: AIConfig, options: AIRequestOptions): Promise<any> {
  const { systemPrompt, userPrompt, responseFormat = "text", maxTokens } = options;
  const finalMaxTokens = maxTokens || config.maxTokens;

  try {
    switch (config.provider) {
      case "OpenAI":
        const openaiMessages: any[] = [];
        if (systemPrompt) {
          openaiMessages.push({ role: "system", content: systemPrompt });
        }
        openaiMessages.push({ role: "user", content: userPrompt });

        const openaiParams: any = {
          model: config.model,
          messages: openaiMessages,
          temperature: config.temperature,
          max_tokens: finalMaxTokens,
        };

        if (responseFormat === "json") {
          openaiParams.response_format = { type: "json_object" };
        }

        return await openai.chat.completions.create(openaiParams);

      case "Anthropic":
        const anthropicMessages: any[] = [];
        if (systemPrompt) {
          // Anthropic handles system prompts differently
          anthropicMessages.push({ role: "user", content: `${systemPrompt}\n\n${userPrompt}` });
        } else {
          anthropicMessages.push({ role: "user", content: userPrompt });
        }

        const anthropicResponse = await anthropic.messages.create({
          model: config.model,
          max_tokens: finalMaxTokens,
          temperature: config.temperature,
          messages: anthropicMessages,
        });

        // Convert Anthropic response format to match OpenAI format for compatibility
        return {
          choices: [
            {
              message: {
                content: anthropicResponse.content[0]?.text || "",
                role: "assistant"
              }
            }
          ],
          usage: {
            prompt_tokens: anthropicResponse.usage?.input_tokens || 0,
            completion_tokens: anthropicResponse.usage?.output_tokens || 0,
            total_tokens: (anthropicResponse.usage?.input_tokens || 0) + (anthropicResponse.usage?.output_tokens || 0)
          }
        };

      case "Gemini":
        let geminiPrompt = userPrompt;
        if (systemPrompt) {
          geminiPrompt = `${systemPrompt}\n\n${userPrompt}`;
        }

        const geminiModel = googleAI.getGenerativeModel({ model: config.model });
        
        const geminiParams: any = {
          generationConfig: {
            temperature: config.temperature,
            maxOutputTokens: finalMaxTokens
          }
        };

        if (responseFormat === "json") {
          geminiParams.generationConfig.responseMimeType = "application/json";
        }

        const geminiResponse = await geminiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
          ...geminiParams
        });

        const responseText = geminiResponse.response.text();

        // Convert Gemini response format to match OpenAI format for compatibility
        return {
          choices: [
            {
              message: {
                content: responseText || "",
                role: "assistant"
              }
            }
          ],
          usage: {
            prompt_tokens: 0, // Gemini doesn't provide detailed token usage in the free tier
            completion_tokens: 0,
            total_tokens: 0
          }
        };

      case "OpenRouter":
        const openRouterMessages: any[] = [];
        if (systemPrompt) {
          openRouterMessages.push({ role: "system", content: systemPrompt });
        }
        openRouterMessages.push({ role: "user", content: userPrompt });

        const openRouterParams: any = {
          model: config.model,
          messages: openRouterMessages,
          temperature: config.temperature,
          max_tokens: finalMaxTokens,
        };

        if (responseFormat === "json") {
          openRouterParams.response_format = { type: "json_object" };
        }

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.REPLIT_DOMAIN || "https://processedornot.com",
            "X-Title": "ProcessedOrNot Scanner"
          },
          body: JSON.stringify(openRouterParams)
        });

        if (!openRouterResponse.ok) {
          throw new Error(`OpenRouter API error: ${openRouterResponse.status} ${openRouterResponse.statusText}`);
        }

        return await openRouterResponse.json();

      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  } catch (error) {
    console.error(`AI request failed for provider ${config.provider}:`, error);
    throw error;
  }
}

// Helper function to get admin default AI provider setting
export async function getAdminDefaultAIProvider(): Promise<string> {
  try {
    const setting = await storage.getAdminSetting("default_ai_provider");
    return setting?.settingValue || "ChatGPT"; // Default to ChatGPT if not configured
  } catch (error) {
    console.error("Error getting admin default AI provider setting:", error);
    return "ChatGPT"; // Fallback to default
  }
}

// Helper function to get admin default AI model setting
export async function getAdminDefaultAIModel(): Promise<string> {
  try {
    const setting = await storage.getAdminSetting("default_ai_model");
    return setting?.settingValue || "gpt-4o"; // Default to gpt-4o if not configured
  } catch (error) {
    console.error("Error getting admin default AI model setting:", error);
    return "gpt-4o"; // Fallback to default
  }
}

// Helper function to get user's AI provider setting (kept for backward compatibility)
export async function getUserAIProvider(userId?: number): Promise<string> {
  if (!userId) {
    // For anonymous users, use admin default settings
    return await getAdminDefaultAIProvider();
  }
  
  try {
    const setting = await storage.getUserSetting(userId, "ai_provider");
    if (setting?.settingValue) {
      return setting.settingValue;
    }
    // If user has no preference, use admin default
    return await getAdminDefaultAIProvider();
  } catch (error) {
    console.error("Error getting user AI provider setting:", error);
    // Fallback to admin default
    return await getAdminDefaultAIProvider();
  }
}

export async function analyzeIngredients(ingredientsText: string, productName: string, language: string = 'en', provider: string = 'ChatGPT', userId?: number): Promise<ProcessingAnalysis> {
  const startTime = Date.now();
  
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

    const systemPrompt = "You are a food science expert specializing in analyzing food processing levels. Provide accurate, evidence-based assessments of ingredient processing levels.";
    const aiConfig = await getAIConfig(provider);

    const response = await makeAIRequest(aiConfig, {
      systemPrompt,
      userPrompt: prompt,
      responseFormat: "json"
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    const endTime = Date.now();
    const tokenUsage = extractTokenUsage(response);

    const processedResult = {
      score: Math.max(0, Math.min(10, Math.round(result.score || 0))),
      explanation: result.explanation || "Unable to analyze ingredients",
      categories: {
        ultraProcessed: result.categories?.ultraProcessed || [],
        processed: result.categories?.processed || [],
        minimallyProcessed: result.categories?.minimallyProcessed || [],
      },
    };

    // Save to prompt history
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'ingredients_analysis',
      aiModel: aiConfig.model,
      userPrompt: prompt,
      systemPrompt,
      fullPrompt: `${systemPrompt}\n\nUser: ${prompt}`,
      requestData: {
        productName,
        language,
        provider,
        ingredientsLength: ingredientsText.length
      }
    };

    await savePromptHistory(context, {
      aiResponse: content,
      processedResponse: JSON.stringify(processedResult),
      parsedData: processedResult,
      ...tokenUsage,
      generationTimeMs: endTime - startTime,
      status: 'success',
      responseLength: content.length,
      parseSuccess: true
    });

    return processedResult;
  } catch (error) {
    const endTime = Date.now();
    console.error("Error analyzing ingredients with OpenAI:", error);
    
    // Save error to prompt history
    const fallbackConfig = await getAIConfig(provider);
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'ingredients_analysis',
      aiModel: fallbackConfig.model,
      userPrompt: `Analyze ingredients for: ${productName}`,
      requestData: {
        productName,
        language,
        provider,
        ingredientsLength: ingredientsText.length
      }
    };

    await savePromptHistory(context, {
      aiResponse: '',
      status: 'error',
      errorMessage: (error as Error).message,
      generationTimeMs: endTime - startTime,
      responseLength: 0,
      parseSuccess: false
    });
    
    throw new Error("Failed to analyze ingredients processing level");
  }
}

export async function analyzeGlycemicIndex(
  ingredientsText: string, 
  productName: string, 
  nutriments: any,
  language: string = 'en',
  provider: string = 'ChatGPT',
  userId?: number
): Promise<GlycemicAnalysis> {
  const startTime = Date.now();
  
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

    const systemPrompt = "You are a nutrition expert specializing in glycemic index assessment. Provide accurate, evidence-based estimates of how foods affect blood glucose levels.";
    const aiConfig = await getAIConfig(provider);

    const response = await makeAIRequest(aiConfig, {
      systemPrompt,
      userPrompt: prompt,
      responseFormat: "json"
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    const endTime = Date.now();
    const tokenUsage = extractTokenUsage(response);

    // Determine category based on GI
    let category: 'Low' | 'Medium' | 'High' = 'Low';
    const gi = result.glycemicIndex || 0;
    if (gi >= 70) category = 'High';
    else if (gi >= 56) category = 'Medium';

    const processedResult = {
      glycemicIndex: Math.max(0, Math.min(100, Math.round(result.glycemicIndex || 0))),
      glycemicLoad: Math.max(0, Math.min(40, Math.round(result.glycemicLoad || 0))),
      explanation: result.explanation || "Unable to analyze glycemic impact",
      category,
      impactDescription: result.impactDescription || "No impact description available",
    };

    // Save to prompt history
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'glycemic_analysis',
      aiModel: aiConfig.model,
      userPrompt: prompt,
      systemPrompt,
      fullPrompt: `${systemPrompt}\n\nUser: ${prompt}`,
      requestData: {
        productName,
        language,
        provider,
        nutritionData: {
          carbohydrates,
          sugars,
          fiber,
          protein,
          fat
        }
      }
    };

    await savePromptHistory(context, {
      aiResponse: content,
      processedResponse: JSON.stringify(processedResult),
      parsedData: processedResult,
      ...tokenUsage,
      generationTimeMs: endTime - startTime,
      status: 'success',
      responseLength: content.length,
      parseSuccess: true
    });

    return processedResult;
  } catch (error) {
    const endTime = Date.now();
    console.error("Error analyzing glycemic index with OpenAI:", error);
    
    // Save error to prompt history
    const fallbackConfig = await getAIConfig(provider);
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'glycemic_analysis',
      aiModel: fallbackConfig.model,
      userPrompt: `Analyze glycemic index for: ${productName}`,
      requestData: {
        productName,
        language,
        provider
      }
    };

    await savePromptHistory(context, {
      aiResponse: '',
      status: 'error',
      errorMessage: (error as Error).message,
      generationTimeMs: endTime - startTime,
      responseLength: 0,
      parseSuccess: false
    });
    
    throw new Error("Failed to analyze glycemic index");
  }
}

export async function analyzeProductionProcess(
  ingredientsText: string, 
  productName: string, 
  nutriments: any,
  language: string = 'en',
  provider: string = 'ChatGPT',
  userId?: number
): Promise<string> {
  const startTime = Date.now();
  
  try {
    const languageInstructions: Record<string, string> = {
      'en': 'Provide your analysis in English.',
      'es': 'Proporciona tu análisis en español.',
      'fr': 'Fournissez votre analyse en français.',
      'de': 'Stellen Sie Ihre Analyse auf Deutsch bereit.',
      'zh': '请用中文提供分析。',
      'ja': '日本語で分析を提供してください.',
      'nl': 'Geef je analyse in het Nederlands.'
    };

    const languageInstruction = languageInstructions[language] || languageInstructions['en'];

    // Extract key nutritional data for context
    const carbohydrates = nutriments?.carbohydrates_100g || nutriments?.carbs_g || 0;
    const protein = nutriments?.proteins_100g || nutriments?.protein_g || 0;
    const fat = nutriments?.fat_100g || nutriments?.fat_g || 0;
    const fiber = nutriments?.fiber_100g || nutriments?.fiber_g || 0;

    const prompt = `Analyze and describe the complete production process for this food product. ${languageInstruction}

Product: ${productName}
Ingredients: ${ingredientsText}

Nutritional Information (per 100g):
- Carbohydrates: ${carbohydrates}g
- Protein: ${protein}g
- Fat: ${fat}g
- Fiber: ${fiber}g

Based on the ingredients and nutritional profile, provide a comprehensive description of the production process including:

1. **Raw Material Sourcing**: Where and how the main ingredients are typically obtained
2. **Preparation Steps**: Initial processing of raw ingredients (washing, cutting, grinding, etc.)
3. **Manufacturing Process**: The specific steps involved in creating this product (mixing, cooking, fermenting, etc.)
4. **Processing Methods**: Heat treatment, preservation methods, packaging processes
5. **Quality Control**: Testing and quality assurance measures
6. **Industrial vs Traditional**: Whether this is typically made in industrial facilities or can be made traditionally
7. **Additives and Preservatives**: Purpose and addition points in the process
8. **Final Processing**: Packaging, labeling, and distribution preparation

Provide a detailed but accessible explanation that helps consumers understand how their food is made from farm to table. Focus on being educational and informative rather than judgmental about the production methods.`;

    const systemPrompt = "You are a food science and manufacturing expert. Provide detailed, accurate explanations of food production processes that are educational and help consumers understand how their food is made.";
    const aiConfig = await getAIConfig(provider);

    const response = await makeAIRequest(aiConfig, {
      systemPrompt,
      userPrompt: prompt,
      maxTokens: 3000 // Increased from default to allow for detailed manufacturing process descriptions
    });

    const productionProcess = response.choices[0].message.content || "Unable to analyze production process";
    const endTime = Date.now();
    const tokenUsage = extractTokenUsage(response);

    // Save to prompt history
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'production_process_analysis',
      aiModel: aiConfig.model,
      userPrompt: prompt,
      systemPrompt,
      fullPrompt: `${systemPrompt}\n\nUser: ${prompt}`,
      requestData: {
        productName,
        language,
        provider,
        nutritionData: {
          carbohydrates,
          protein,
          fat,
          fiber
        }
      }
    };

    await savePromptHistory(context, {
      aiResponse: productionProcess,
      processedResponse: productionProcess,
      ...tokenUsage,
      generationTimeMs: endTime - startTime,
      status: 'success',
      responseLength: productionProcess.length,
      parseSuccess: true
    });
    
    return productionProcess;
  } catch (error) {
    const endTime = Date.now();
    console.error("Error analyzing production process with OpenAI:", error);
    
    // Save error to prompt history
    const fallbackConfig = await getAIConfig(provider);
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'production_process_analysis',
      aiModel: fallbackConfig.model,
      userPrompt: `Analyze production process for: ${productName}`,
      requestData: {
        productName,
        language,
        provider
      }
    };

    await savePromptHistory(context, {
      aiResponse: '',
      status: 'error',
      errorMessage: (error as Error).message,
      generationTimeMs: endTime - startTime,
      responseLength: 0,
      parseSuccess: false
    });
    
    return "Unable to analyze production process at this time";
  }
}

interface CarbonFootprintAnalysis {
  carbonFootprint: number;
  explanation: string;
  breakdown: {
    ingredients: number;
    processing: number;
    packaging: number;
    transportation: number;
  };
  rating: 'excellent' | 'good' | 'moderate' | 'high' | 'very-high';
  suggestions: string[];
}

export async function analyzeCarbonFootprint(
  ingredientsText: string, 
  productName: string, 
  nutriments: any,
  language: string = 'en', 
  provider: string = 'ChatGPT',
  userId?: number
): Promise<CarbonFootprintAnalysis> {
  const startTime = Date.now();
  
  try {
    const languageInstructions: Record<string, string> = {
      'en': 'Provide your analysis in English.',
      'es': 'Proporciona tu análisis en español.',
      'fr': 'Fournissez votre analyse en français.',
      'de': 'Stellen Sie Ihre Analyse auf Deutsch bereit.',
      'zh': '请用中文提供分析。',
      'ja': '日本語で分析を提供してください.',
      'nl': 'Geef je analyse in het Nederlands.'
    };

    const languageInstruction = languageInstructions[language] || languageInstructions['en'];

    // Extract key nutritional data for context
    const carbohydrates = nutriments?.carbohydrates_100g || nutriments?.carbs_g || 0;
    const protein = nutriments?.proteins_100g || nutriments?.protein_g || 0;
    const fat = nutriments?.fat_100g || nutriments?.fat_g || 0;
    const fiber = nutriments?.fiber_100g || nutriments?.fiber_g || 0;

    const prompt = `Calculate the carbon footprint for this food product. ${languageInstruction}

Product: ${productName}
Ingredients: ${ingredientsText}

Nutritional Information (per 100g):
- Carbohydrates: ${carbohydrates}g
- Protein: ${protein}g
- Fat: ${fat}g
- Fiber: ${fiber}g

Based on the ingredients and nutritional profile, calculate the carbon footprint considering:

1. **Ingredient Sourcing**: Environmental impact of raw materials (agricultural practices, land use, water consumption)
2. **Processing Impact**: Energy consumption in manufacturing, industrial processing steps
3. **Packaging**: Materials used, manufacturing energy, recyclability
4. **Transportation**: Typical distribution distances, refrigeration needs

Provide a detailed carbon footprint analysis with:
- Total CO2 equivalent emissions per 100g serving
- Breakdown by category (ingredients, processing, packaging, transportation)
- Sustainability rating (excellent <0.5kg, good 0.5-1kg, moderate 1-2kg, high 2-4kg, very-high >4kg)
- Environmental impact explanation
- Sustainability improvement suggestions

Consider factors like:
- Animal vs plant-based ingredients (meat/dairy have higher footprints)
- Processing complexity (ultra-processed foods have higher footprints)
- Packaging materials (plastic vs recyclable materials)
- Typical source regions and transportation needs
- Preservation methods and energy requirements

Provide your response in JSON format:
{
  "carbonFootprint": number (kg CO2e per 100g),
  "explanation": "detailed explanation of carbon footprint calculation and environmental impact",
  "breakdown": {
    "ingredients": number (kg CO2e from ingredient sourcing),
    "processing": number (kg CO2e from manufacturing),
    "packaging": number (kg CO2e from packaging materials),
    "transportation": number (kg CO2e from distribution)
  },
  "rating": "excellent|good|moderate|high|very-high",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}`;

    const systemPrompt = "You are an environmental sustainability expert specializing in food carbon footprint analysis. Provide accurate, evidence-based assessments of environmental impact for food products based on scientific data and lifecycle assessment principles.";
    const aiConfig = await getAIConfig(provider);

    const response = await makeAIRequest(aiConfig, {
      systemPrompt,
      userPrompt: prompt,
      responseFormat: "json"
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content received from OpenAI");
    }

    const result = JSON.parse(content) as CarbonFootprintAnalysis;
    const endTime = Date.now();
    const tokenUsage = extractTokenUsage(response);
    
    // Validate and sanitize the response
    const processedResult = {
      carbonFootprint: Math.max(0, result.carbonFootprint || 0),
      explanation: result.explanation || "Carbon footprint analysis not available",
      breakdown: {
        ingredients: Math.max(0, result.breakdown?.ingredients || 0),
        processing: Math.max(0, result.breakdown?.processing || 0),
        packaging: Math.max(0, result.breakdown?.packaging || 0),
        transportation: Math.max(0, result.breakdown?.transportation || 0),
      },
      rating: result.rating || 'moderate',
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    };

    // Save to prompt history
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'carbon_footprint_analysis',
      aiModel: aiConfig.model,
      userPrompt: prompt,
      systemPrompt,
      fullPrompt: `${systemPrompt}\n\nUser: ${prompt}`,
      requestData: {
        productName,
        language,
        provider,
        nutritionData: {
          carbohydrates,
          protein,
          fat,
          fiber
        }
      }
    };

    await savePromptHistory(context, {
      aiResponse: content,
      processedResponse: JSON.stringify(processedResult),
      parsedData: processedResult,
      ...tokenUsage,
      generationTimeMs: endTime - startTime,
      status: 'success',
      responseLength: content.length,
      parseSuccess: true
    });

    return processedResult;
  } catch (error) {
    const endTime = Date.now();
    console.error("Error analyzing carbon footprint with OpenAI:", error);
    
    // Save error to prompt history
    const fallbackConfig = await getAIConfig(provider);
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'carbon_footprint_analysis',
      aiModel: fallbackConfig.model,
      userPrompt: `Analyze carbon footprint for: ${productName}`,
      requestData: {
        productName,
        language,
        provider
      }
    };

    await savePromptHistory(context, {
      aiResponse: '',
      status: 'error',
      errorMessage: (error as Error).message,
      generationTimeMs: endTime - startTime,
      responseLength: 0,
      parseSuccess: false
    });
    
    throw new Error("Failed to analyze carbon footprint");
  }
}

interface AIGeneratedIngredients {
  ingredients: string;
  confidence: 'high' | 'medium' | 'low';
  explanation: string;
  isGenerated: true;
}

export async function generateMissingIngredients(
  productName: string,
  brands?: string | null,
  language: string = 'en',
  provider: string = 'ChatGPT Nano',
  userId?: number
): Promise<AIGeneratedIngredients> {
  const startTime = Date.now();
  
  try {
    const languageInstructions: Record<string, string> = {
      'en': 'Provide your response in English.',
      'es': 'Proporciona tu respuesta en español.',
      'fr': 'Fournissez votre réponse en français.',
      'de': 'Stellen Sie Ihre Antwort auf Deutsch bereit.',
      'zh': '请用中文回复。',
      'ja': '日本語で回答してください。',
      'nl': 'Geef je antwoord in het Nederlands.'
    };

    const languageInstruction = languageInstructions[language] || languageInstructions['en'];

    const prompt = `Generate the most likely ingredients list for this food product. ${languageInstruction}

Product Name: ${productName}
Brand: ${brands || 'Unknown'}

Based on the product name and brand, provide the most probable ingredients that would typically be found in this type of product. Consider:

1. **Common ingredients** for this product category
2. **Industry standards** for similar products
3. **Typical formulations** used by food manufacturers
4. **Regulatory requirements** for ingredient listing (most abundant first)
5. **Brand-specific patterns** if recognizable

Important guidelines:
- List ingredients in descending order by typical weight/volume
- Use standard ingredient terminology (not marketing names)
- Include likely preservatives, emulsifiers, and additives for this product type
- Be realistic about commercial food production
- Consider shelf stability requirements
- Account for common allergens that might be present

Provide your response in JSON format:
{
  "ingredients": "comprehensive comma-separated ingredients list in typical order",
  "confidence": "high|medium|low",
  "explanation": "detailed explanation of why these ingredients are likely and your confidence level in the requested language",
  "isGenerated": true
}

Confidence levels:
- High: Very common product type with standard formulations
- Medium: Recognizable product but some variation in formulations
- Low: Unique or complex product with uncertain formulation`;

    const systemPrompt = "You are a food technology expert with deep knowledge of commercial food formulations, ingredient functions, and industry practices. Generate realistic, evidence-based ingredient predictions.";
    const modelConfig = await getModelConfig(provider);

    const response = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    const endTime = Date.now();
    const tokenUsage = extractTokenUsage(response);

    const processedResult: AIGeneratedIngredients = {
      ingredients: result.ingredients || "Unable to generate ingredients",
      confidence: result.confidence || 'low',
      explanation: result.explanation || "AI-generated ingredient prediction based on product name",
      isGenerated: true,
    };

    // Save to prompt history
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'ingredient_generation',
      aiModel: aiConfig.model,
      userPrompt: prompt,
      systemPrompt,
      fullPrompt: `${systemPrompt}\n\nUser: ${prompt}`,
      requestData: {
        productName,
        brands: brands || 'Unknown',
        language,
        provider
      }
    };

    await savePromptHistory(context, {
      aiResponse: content,
      processedResponse: JSON.stringify(processedResult),
      parsedData: processedResult,
      ...tokenUsage,
      generationTimeMs: endTime - startTime,
      status: 'success',
      responseLength: content.length,
      parseSuccess: true
    });

    return processedResult;

  } catch (error) {
    console.error("Error generating ingredients:", error);
    
    // Save error to prompt history
    const fallbackConfig = await getAIConfig(provider);
    const context: PromptHistoryContext = {
      userId,
      sessionId: generateSessionId(),
      feature: 'ingredient_generation',
      aiModel: fallbackConfig.model,
      userPrompt: `Generate ingredients for: ${productName}`,
      systemPrompt: "AI ingredient generation",
      fullPrompt: `Generate ingredients for: ${productName}`,
      requestData: {
        productName,
        brands: brands || 'Unknown',
        language,
        provider
      }
    };

    await savePromptHistory(context, {
      aiResponse: "",
      processedResponse: "",
      parsedData: null,
      promptTokens: 0,
      completionTokens: 0,
      generationTimeMs: Date.now() - startTime,
      status: 'error',
      responseLength: 0,
      parseSuccess: false
    });
    
    // Return fallback result
    return {
      ingredients: "Unable to generate ingredients at this time",
      confidence: 'low',
      explanation: "AI ingredient generation failed",
      isGenerated: true,
    };
  }
}
