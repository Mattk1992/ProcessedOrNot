import OpenAI from "openai";
import { UserOnboarding } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ScheduleFormData {
  goal: string;
  startDate: string;
  duration: string;
  caloriesTarget: string;
  proteinTarget: string;
  carbsTarget: string;
  fatTarget: string;
  specialNotes: string;
  aiModel?: string;
  mealTimes?: {
    breakfastTime?: string;
    lunchTime?: string;
    dinnerTime?: string;
    snackTime?: string;
  };
}

interface GeneratedSchedule {
  title: string;
  description: string;
  type: string;
  goal: string;
  duration: number;
  startDate: string;
  endDate: string;
  dailyCalories: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  specialNotes: string;
  recommendations?: string[];
  dailySchedule?: Array<{
    day: number;
    date: string;
    meals: Array<{
      name: string;
      time: string;
      foods: Array<{
        item: string;
        portion: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        preparation?: string;
      }>;
      totalCalories: number;
      notes?: string;
    }>;
    dailyTotalCalories: number;
    dailyTotalProtein: number;
    dailyTotalCarbs: number;
    dailyTotalFat: number;
  }>;
  // Keep old structure for backward compatibility
  mealSuggestions?: Array<{
    meal: string;
    foods: string[];
    calories: number;
  }>;
}

export class AIScheduleGenerator {
  private static formatUserProfile(profile: UserOnboarding): string {
    const profileData = [];
    
    if (profile.age) profileData.push(`Age: ${profile.age}`);
    if (profile.gender) profileData.push(`Gender: ${profile.gender}`);
    if (profile.height) profileData.push(`Height: ${profile.height} cm`);
    if (profile.weight) profileData.push(`Weight: ${profile.weight} kg`);
    if (profile.activityLevel) profileData.push(`Activity Level: ${profile.activityLevel}`);
    if (profile.weightGoals) profileData.push(`Weight Goals: ${profile.weightGoals}`);
    if (profile.targetWeight) profileData.push(`Target Weight: ${profile.targetWeight} kg`);
    if (profile.healthGoals?.length) profileData.push(`Health Goals: ${profile.healthGoals.join(', ')}`);
    if (profile.medicalConditions?.length) profileData.push(`Medical Conditions: ${profile.medicalConditions.join(', ')}`);
    if (profile.allergies?.length) profileData.push(`Allergies: ${profile.allergies.join(', ')}`);
    if (profile.foodPreferences?.length) profileData.push(`Food Preferences: ${profile.foodPreferences.join(', ')}`);
    if (profile.dietaryRestrictions?.length) profileData.push(`Dietary Restrictions: ${profile.dietaryRestrictions.join(', ')}`);
    if (profile.exerciseFrequency) profileData.push(`Exercise Frequency: ${profile.exerciseFrequency}`);
    if (profile.exerciseTypes?.length) profileData.push(`Exercise Types: ${profile.exerciseTypes.join(', ')}`);
    if (profile.mealsPerDay) profileData.push(`Meals Per Day: ${profile.mealsPerDay}`);
    if (profile.cookingSkill) profileData.push(`Cooking Skill: ${profile.cookingSkill}`);
    if (profile.cookingFrequency) profileData.push(`Cooking Frequency: ${profile.cookingFrequency}`);
    if (profile.sleepHours) profileData.push(`Sleep Hours: ${profile.sleepHours}`);
    if (profile.stressLevel) profileData.push(`Stress Level: ${profile.stressLevel}`);
    if (profile.waterIntake) profileData.push(`Water Intake: ${profile.waterIntake} glasses/day`);
    
    return profileData.join('\n');
  }

  private static createPrompt(formData: ScheduleFormData, userProfile: UserOnboarding): string {
    const userProfileText = this.formatUserProfile(userProfile);
    
    // Build meal times dynamically based on user preferences
    const mealTimesText = formData.mealTimes ? 
      Object.entries(formData.mealTimes)
        .filter(([_, time]) => time) // Only include meals with set times
        .map(([mealType, time]) => {
          const mealName = mealType.replace('Time', '').charAt(0).toUpperCase() + mealType.replace('Time', '').slice(1);
          return `- ${mealName}: ${time}`;
        }).join('\n') 
      : '- Breakfast: 08:00\n- Lunch: 13:00\n- Dinner: 18:00\n- Snack: 20:00';

    const activeMeals = formData.mealTimes ? 
      Object.entries(formData.mealTimes)
        .filter(([_, time]) => time)
        .map(([mealType, time]) => ({
          name: mealType.replace('Time', '').charAt(0).toUpperCase() + mealType.replace('Time', '').slice(1),
          time: time
        }))
      : [
        { name: 'Breakfast', time: '08:00' },
        { name: 'Lunch', time: '13:00' },
        { name: 'Dinner', time: '18:00' },
        { name: 'Snack', time: '20:00' }
      ];

    // Generate meal structure examples for the JSON template
    const mealExamples = activeMeals.map(meal => `        {
          "name": "${meal.name}",
          "time": "${meal.time}",
          "foods": [
            {
              "item": "Specific food product or recipe name for ${meal.name.toLowerCase()}",
              "portion": "Amount and unit",
              "calories": 150,
              "protein": 8,
              "carbs": 12,
              "fat": 6,
              "preparation": "Brief preparation instructions if needed"
            }
          ],
          "totalCalories": 300,
          "notes": "Any specific preparation or timing notes"
        }`).join(',\n');
    
    return `You are a professional nutritionist and dietitian AI assistant. Create a personalized nutrition schedule/plan based on the user's profile and goals.

USER PROFILE:
${userProfileText}

SCHEDULE REQUEST:
- Title: ${formData.goal}
- Duration: ${formData.duration} days
- Start Date: ${formData.startDate}
- Target Calories: ${formData.caloriesTarget}
- Target Protein: ${formData.proteinTarget || 'Not specified'} g
- Target Carbs: ${formData.carbsTarget || 'Not specified'} g
- Target Fat: ${formData.fatTarget || 'Not specified'} g
- Special Notes: ${formData.specialNotes || 'None'}

MEAL TIMES:
${mealTimesText}

INSTRUCTIONS:
1. Create a comprehensive daily nutrition schedule with specific food products and recipes for each meal time
2. Base the number of meals and their timing EXACTLY on the user's meal times provided above - only include meals that have times set
3. For each day in the ${formData.duration}-day schedule, provide specific food items, recipes, or real products with detailed nutritional information
4. Include realistic portion sizes, preparation methods, and distribute calories appropriately across all scheduled meals
5. Consider the user's cooking skills, dietary restrictions, allergies, and food preferences when selecting foods
6. Ensure meals align with their activity level, weight goals, and health conditions
7. Provide variety across different days while maintaining nutritional consistency and hitting daily targets
8. Use real food products, brand names when appropriate, and authentic recipes that people can actually purchase and prepare

Please respond with a JSON object containing the following structure:
{
  "title": "Descriptive title for the nutrition schedule",
  "description": "Detailed description explaining the schedule approach and benefits",
  "type": "schedule",
  "goal": "${formData.goal}",
  "duration": ${parseInt(formData.duration)},
  "startDate": "${formData.startDate}",
  "endDate": "calculated end date based on duration",
  "dailyCalories": ${parseInt(formData.caloriesTarget)},
  "dailyProtein": ${parseFloat(formData.proteinTarget) || null},
  "dailyCarbs": ${parseFloat(formData.carbsTarget) || null},
  "dailyFat": ${parseFloat(formData.fatTarget) || null},
  "specialNotes": "Personalized notes and recommendations based on user profile",
  "recommendations": ["List of 5-8 key recommendations"],
  "dailySchedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "meals": [
${mealExamples}
      ],
      "dailyTotalCalories": 2000,
      "dailyTotalProtein": 120,
      "dailyTotalCarbs": 250,
      "dailyTotalFat": 67
    }
    // ... repeat for all ${formData.duration} days with different food choices but same meal structure and times
  ]
}

Make sure the response is valid JSON and all recommendations are safe, evidence-based, and appropriate for the user's health profile.`;
  }

  static async generateSchedule(
    formData: ScheduleFormData,
    userProfile: UserOnboarding
  ): Promise<{
    schedule: GeneratedSchedule;
    prompt: string;
    aiResponse: string;
    tokensUsed?: number;
    generationTimeMs: number;
  }> {
    const startTime = Date.now();
    
    try {
      const prompt = this.createPrompt(formData, userProfile);
      
      const selectedModel = formData.aiModel || "gpt-4o";
      const response = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: "You are a professional nutritionist and dietitian AI assistant. Always respond with valid JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const generationTimeMs = Date.now() - startTime;
      const aiResponse = response.choices[0].message.content || "";
      
      let schedule: GeneratedSchedule;
      try {
        schedule = JSON.parse(aiResponse);
      } catch (parseError) {
        throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
      }

      // Calculate end date if not provided
      if (!schedule.endDate && schedule.startDate && schedule.duration) {
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + schedule.duration - 1);
        schedule.endDate = endDate.toISOString().split('T')[0];
      }

      return {
        schedule,
        prompt,
        aiResponse,
        tokensUsed: response.usage?.total_tokens,
        generationTimeMs
      };
    } catch (error) {
      const generationTimeMs = Date.now() - startTime;
      console.error('AI Schedule Generation Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        formData,
        userProfile: userProfile.id || 'unknown'
      });
      throw new Error(`AI schedule generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}