interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations?: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function queryPerplexity(messages: PerplexityMessage[]): Promise<string> {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0]?.message?.content || 'No response received';

  } catch (error) {
    console.error('Error querying Perplexity:', error);
    throw error;
  }
}

export async function getEnhancedNutritionalInsights(productName: string, ingredients?: string): Promise<string> {
  try {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a nutrition expert providing evidence-based analysis of food products. Focus on health benefits, potential concerns, and nutritional value. Be concise and informative.'
      },
      {
        role: 'user',
        content: `Analyze the nutritional profile and health implications of "${productName}"${ingredients ? ` with ingredients: ${ingredients}` : ''}. Include recent research on health benefits or concerns, recommended consumption levels, and how it fits into a balanced diet.`
      }
    ];

    return await queryPerplexity(messages);
  } catch (error) {
    console.error('Error getting enhanced nutritional insights:', error);
    return 'Unable to retrieve enhanced nutritional insights at this time.';
  }
}

export async function getIngredientAnalysis(ingredient: string): Promise<string> {
  try {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a food science expert. Provide factual information about food ingredients including their purpose, safety profile, and any health considerations.'
      },
      {
        role: 'user',
        content: `Provide a detailed analysis of the food ingredient "${ingredient}". Include its function in food products, safety profile, any health benefits or concerns, and current regulatory status.`
      }
    ];

    return await queryPerplexity(messages);
  } catch (error) {
    console.error('Error analyzing ingredient:', error);
    return `Unable to analyze ingredient "${ingredient}" at this time.`;
  }
}

export async function getProcessingAnalysis(processingLevel: string, productName: string): Promise<string> {
  try {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are a nutrition scientist specializing in food processing and its health implications. Provide evidence-based analysis of processing levels and their impact on nutrition and health.'
      },
      {
        role: 'user',
        content: `Explain the health implications of ${processingLevel} food processing for "${productName}". Include how processing affects nutritional value, any health concerns, and recommendations for consumption.`
      }
    ];

    return await queryPerplexity(messages);
  } catch (error) {
    console.error('Error analyzing processing level:', error);
    return 'Unable to analyze processing level at this time.';
  }
}

export async function getHealthRecommendations(userQuery: string, productContext?: string): Promise<string> {
  try {
    const messages: PerplexityMessage[] = [
      {
        role: 'system',
        content: 'You are NutriBot, a friendly and knowledgeable nutrition assistant. Provide helpful, evidence-based nutritional advice while being encouraging and supportive. Always recommend consulting healthcare professionals for specific medical concerns.'
      },
      {
        role: 'user',
        content: `${userQuery}${productContext ? ` (Context: discussing ${productContext})` : ''}`
      }
    ];

    return await queryPerplexity(messages);
  } catch (error) {
    console.error('Error getting health recommendations:', error);
    return 'I apologize, but I cannot access current health information right now. Please consult with a healthcare professional for specific nutritional advice.';
  }
}