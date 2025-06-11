import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

function getNutriBotSystemPrompt(language: string): string {
  const languageInstructions: Record<string, string> = {
    'en': 'Respond in English.',
    'es': 'Responde en español de manera natural y fluida.',
    'fr': 'Réponds en français de manière naturelle et fluide.',
    'de': 'Antworte auf Deutsch in natürlicher und fließender Weise.',
    'zh': '用中文自然流畅地回答。',
    'ja': '日本語で自然で流暢に回答してください。',
    'nl': 'Antwoord in het Nederlands op een natuurlijke en vloeiende manier.'
  };

  const languageInstruction = languageInstructions[language] || languageInstructions['en'];

  return `You are NutriBot, a friendly AI nutritionist. ${languageInstruction}

PERSONALITY TRAITS:
- Friendly and Approachable: Create a warm, welcoming environment that makes users comfortable asking nutrition questions
- Knowledgeable and Insightful: Provide accurate, science-based nutritional guidance tailored to individual needs
- Encouraging and Supportive: Motivate users toward healthier choices and celebrate their progress
- Curious and Engaging: Show enthusiasm for food trends and encourage users to share their experiences

VOICE AND TONE:
- Conversational and Informal: Use everyday language that's relatable and clear
- Empathetic and Understanding: Acknowledge dietary challenges and offer practical, positive solutions
- Encouraging: Always focus on progress and positive changes

KEY CAPABILITIES:
- Personalized Recommendations: Tailor food suggestions and meal plans based on user preferences
- Nutritional Insights: Provide detailed information on health benefits of various foods
- Recipe Ideas: Share creative, healthy recipes based on user-selected ingredients
- Health Tracking: Help users understand food intake and nutritional goals with actionable tips
- Product Analysis: Help interpret nutrition labels, ingredient lists, and processing levels

GUIDELINES:
- Keep responses helpful but concise (2-3 paragraphs max unless more detail is specifically requested)
- Use emojis sparingly and naturally (1-2 per response)
- Always provide actionable advice when possible
- If asked about medical conditions, remind users to consult healthcare providers
- Focus on sustainable, realistic dietary changes
- Celebrate small wins and progress
- Ask follow-up questions to better understand user needs

Remember: You're a supportive companion on their health journey, making nutrition enjoyable and achievable!`;
}

export async function getNutriBotResponse(message: string, history: ChatMessage[], language: string = 'en'): Promise<string> {
  try {
    // Convert chat history to OpenAI format
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: getNutriBotSystemPrompt(language) }
    ];

    // Add recent conversation history for context (last 10 messages)
    history.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add the current user message
    messages.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    return response.choices[0].message.content || "I'm sorry, I didn't catch that. Could you ask me about nutrition in a different way?";

  } catch (error) {
    console.error('NutriBot API error:', error);
    throw new Error('Failed to generate response from NutriBot');
  }
}

export async function generateFunFacts(productName: string, ingredients: string, nutriments: Record<string, any> | null, processingScore: number, language: string = 'en'): Promise<Array<{title: string, fact: string, category: string}>> {
  try {
    const nutritionData = nutriments ? Object.entries(nutriments)
      .filter(([key, value]) => typeof value === 'number' && value > 0)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ') : 'No nutrition data available';

    const prompt = `Generate 4 interesting fun facts about this food product:
    
Product: ${productName}
Ingredients: ${ingredients}
Nutrition per 100g: ${nutritionData}
Processing Score: ${processingScore}/10

Create exactly 4 fun facts covering:
1. A surprising nutritional comparison or energy equivalent
2. An interesting food history or cultural fact
3. A processing or ingredient insight
4. An environmental or sustainability angle

Make each fact engaging, educational, and memorable. Each fact should be 1-2 sentences.

Return as JSON array: [{"title": "Fact Title", "fact": "The actual fact text", "category": "nutrition|history|processing|environment"}]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: getNutriBotSystemPrompt(language) + " Always respond with valid JSON format." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content generated');
    
    const result = JSON.parse(content);
    return Array.isArray(result) ? result : result.facts || [];

  } catch (error) {
    console.error('Fun facts generation error:', error);
    throw new Error('Failed to generate fun facts');
  }
}

export async function generateProductNutritionInsight(productName: string, ingredients: string, processingScore: number, language: string = 'en'): Promise<string> {
  try {
    const prompt = `As NutriBot, provide a friendly nutritional insight about this product:
    
Product: ${productName}
Ingredients: ${ingredients}
Processing Score: ${processingScore}/10 (where 10 is highly processed)

Give a brief, encouraging assessment covering:
1. Key nutritional highlights or concerns
2. Processing level explanation
3. One practical tip for healthier choices

Keep it conversational, supportive, and actionable (2-3 sentences max).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: getNutriBotSystemPrompt(language) },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "This product looks interesting! Feel free to ask me any specific questions about its nutrition.";

  } catch (error) {
    console.error('NutriBot insight generation error:', error);
    return "I'd love to help you understand this product better! Ask me any questions about its ingredients or nutrition.";
  }
}