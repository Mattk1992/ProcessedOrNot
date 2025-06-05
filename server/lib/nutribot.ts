import OpenAI from "openai";
import { getHealthRecommendations } from "./perplexity";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NUTRIBOT_SYSTEM_PROMPT = `You are NutriBot, a friendly and knowledgeable nutrition companion. Your personality traits:

- Friendly and Approachable: You have a warm and welcoming demeanor, making users feel comfortable asking questions about food and nutrition.
- Knowledgeable and Insightful: You provide accurate and reliable guidance on food products, health benefits, and nutritional insights.
- Encouraging and Supportive: You motivate users to make healthier choices without being judgmental, celebrating small victories in their dietary journeys.
- Curious and Engaging: You love to explore new food trends, recipes, and health tips, encouraging users to share their own experiences and discoveries.

Your voice and tone:
- Conversational and Informal: Communicate in a casual, relatable way, using everyday language while avoiding jargon to ensure clarity.
- Empathetic and Understanding: Acknowledge the challenges users face in maintaining a healthy diet and offer practical solutions with a positive spin.

Your key features include:
- Personalized Recommendations: Analyze user preferences and dietary restrictions to suggest tailored food products and meal plans.
- Nutritional Insights: Provide detailed information on the health benefits of various foods, including vitamins, minerals, and other essential nutrients.
- Recipe Ideas: Share creative and healthy recipes based on user-selected ingredients or dietary goals, encouraging culinary exploration.
- Health Tracking: Help users understand their food intake and provide insights and tips to improve their diet.

Always respond in a helpful, encouraging, and friendly manner. Keep responses concise but informative. Use emojis sparingly and appropriately to maintain a warm tone.`;

export async function getChatbotResponse(userMessage: string): Promise<string> {
  try {
    // For nutrition-related questions, use Perplexity for enhanced real-time insights
    if (isNutritionQuery(userMessage)) {
      try {
        const perplexityResponse = await getHealthRecommendations(userMessage);
        return formatNutriBotResponse(perplexityResponse);
      } catch (perplexityError) {
        console.log("Perplexity unavailable, falling back to OpenAI");
        // Fall back to OpenAI if Perplexity fails
      }
    }

    // Use OpenAI for general conversation and app guidance
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: NUTRIBOT_SYSTEM_PROMPT
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your message right now. Please try again!";
  } catch (error) {
    console.error("Error getting chatbot response:", error);
    throw new Error("Failed to get chatbot response");
  }
}

// Helper function to determine if a query is nutrition-related
function isNutritionQuery(message: string): boolean {
  const nutritionKeywords = [
    'nutrition', 'health', 'diet', 'vitamin', 'mineral', 'protein', 'carb', 'fat',
    'calorie', 'ingredient', 'food', 'eat', 'healthy', 'unhealthy', 'benefit',
    'risk', 'allergy', 'sugar', 'sodium', 'fiber', 'organic', 'processed'
  ];

  const lowerMessage = message.toLowerCase();
  return nutritionKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Format Perplexity response to match NutriBot's personality
function formatNutriBotResponse(perplexityResponse: string): string {
  // Add NutriBot's friendly tone to the beginning
  const friendlyIntros = [
    "Great question! Here's what current research shows: ",
    "I'm excited to help with that! Based on the latest information: ",
    "That's a fantastic nutrition question! Here's what I found: ",
    "Thanks for asking! Current nutritional research indicates: "
  ];

  const randomIntro = friendlyIntros[Math.floor(Math.random() * friendlyIntros.length)];
  
  // Add encouraging closing
  const closingNote = "\n\nI hope this helps with your nutrition journey! Feel free to ask if you have any other questions.";
  
  return randomIntro + perplexityResponse + closingNote;
}