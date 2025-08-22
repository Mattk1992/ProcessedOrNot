import OpenAI from "openai";
import { UserOnboarding } from "@shared/schema";
import { storage } from '../storage';

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
  mealPercentages?: {
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    snack?: number;
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
    
    // Handle both camelCase and snake_case field names due to database mapping issues
    const getField = (camelCase: string, snakeCase: string) => {
      return (profile as any)[camelCase] || (profile as any)[snakeCase];
    };
    
    if (profile.age) profileData.push(`Age: ${profile.age}`);
    if (profile.gender) profileData.push(`Gender: ${profile.gender}`);
    if (profile.height) profileData.push(`Height: ${profile.height} cm`);
    if (profile.weight) profileData.push(`Weight: ${profile.weight} kg`);
    
    const activityLevel = getField('activityLevel', 'activity_level');
    if (activityLevel) profileData.push(`Activity Level: ${activityLevel}`);
    
    const weightGoals = getField('weightGoals', 'weight_goals');
    if (weightGoals) profileData.push(`Weight Goals: ${weightGoals}`);
    
    const targetWeight = getField('targetWeight', 'target_weight');
    if (targetWeight) profileData.push(`Target Weight: ${targetWeight} kg`);
    
    const healthGoals = getField('healthGoals', 'health_goals');
    if (healthGoals?.length) profileData.push(`Health Goals: ${healthGoals.join(', ')}`);
    
    const medicalConditions = getField('medicalConditions', 'medical_conditions');
    if (medicalConditions?.length) profileData.push(`Medical Conditions: ${medicalConditions.join(', ')}`);
    
    if (profile.allergies?.length) profileData.push(`Allergies: ${profile.allergies.join(', ')}`);
    
    const foodPreferences = getField('foodPreferences', 'food_preferences');
    if (foodPreferences?.length) profileData.push(`Food Preferences: ${foodPreferences.join(', ')}`);
    
    const dietaryRestrictions = getField('dietaryRestrictions', 'dietary_restrictions');
    if (dietaryRestrictions?.length) profileData.push(`Dietary Restrictions: ${dietaryRestrictions.join(', ')}`);
    
    const exerciseFrequency = getField('exerciseFrequency', 'exercise_frequency');
    if (exerciseFrequency) profileData.push(`Exercise Frequency: ${exerciseFrequency}`);
    
    const exerciseTypes = getField('exerciseTypes', 'exercise_types');
    if (exerciseTypes?.length) profileData.push(`Exercise Types: ${exerciseTypes.join(', ')}`);
    
    const mealsPerDay = getField('mealsPerDay', 'meals_per_day');
    if (mealsPerDay) profileData.push(`Meals Per Day: ${mealsPerDay}`);
    
    const cookingSkill = getField('cookingSkill', 'cooking_skill');
    if (cookingSkill) profileData.push(`Cooking Skill: ${cookingSkill}`);
    
    const cookingFrequency = getField('cookingFrequency', 'cooking_frequency');
    if (cookingFrequency) profileData.push(`Cooking Frequency: ${cookingFrequency}`);
    
    const sleepHours = getField('sleepHours', 'sleep_hours');
    if (sleepHours) profileData.push(`Sleep Hours: ${sleepHours}`);
    
    const stressLevel = getField('stressLevel', 'stress_level');
    if (stressLevel) profileData.push(`Stress Level: ${stressLevel}`);
    
    const waterIntake = getField('waterIntake', 'water_intake');
    if (waterIntake) profileData.push(`Water Intake: ${waterIntake} glasses/day`);
    
    return profileData.join('\n');
  }

  private static createPrompt(formData: ScheduleFormData, userProfile: UserOnboarding): string {
    const userProfileText = this.formatUserProfile(userProfile);
    
    // Calculate calorie targets for each meal based on percentages
    const totalCalories = parseInt(formData.caloriesTarget);
    const defaultPercentages = { breakfast: 25, lunch: 35, dinner: 30, snack: 10 };
    
    // Build meal times and calorie targets dynamically based on user preferences
    const activeMeals = formData.mealTimes ? 
      Object.entries(formData.mealTimes)
        .filter(([_, time]) => time)
        .map(([mealType, time]) => {
          const mealName = mealType.replace('Time', '').charAt(0).toUpperCase() + mealType.replace('Time', '').slice(1);
          const mealKey = mealType.replace('Time', '') as keyof typeof defaultPercentages;
          const percentage = formData.mealPercentages?.[mealKey] || defaultPercentages[mealKey] || 25;
          const targetCalories = Math.round((percentage / 100) * totalCalories);
          
          return {
            name: mealName,
            time: time as string,
            percentage: percentage,
            targetCalories: targetCalories
          };
        })
      : [
        { name: 'Breakfast', time: '08:00', percentage: 25, targetCalories: Math.round(0.25 * totalCalories) },
        { name: 'Lunch', time: '13:00', percentage: 35, targetCalories: Math.round(0.35 * totalCalories) },
        { name: 'Dinner', time: '18:00', percentage: 30, targetCalories: Math.round(0.30 * totalCalories) },
        { name: 'Snack', time: '20:00', percentage: 10, targetCalories: Math.round(0.10 * totalCalories) }
      ];

    const mealTimesText = activeMeals.map(meal => 
      `- ${meal.name}: ${meal.time} (${meal.percentage}% = ${meal.targetCalories} calories)`
    ).join('\n');

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
          "totalCalories": ${meal.targetCalories},
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

MEAL TIMES & CALORIE TARGETS:
${mealTimesText}

IMPORTANT: Each meal must target the exact calorie amount specified above. Adjust portion sizes and food selections to meet these precise targets.

INSTRUCTIONS:
1. Create a comprehensive daily nutrition schedule with specific food products and recipes for each meal time
2. Base the number of meals and their timing EXACTLY on the user's meal times provided above - only include meals that have times set
3. For each meal, target the EXACT calorie amount specified above based on the user's daily percentage division
4. For each day in the ${formData.duration}-day schedule, provide specific food items, recipes, or real products with detailed nutritional information
5. Include realistic portion sizes and preparation methods to hit the precise calorie targets for each meal
6. Consider the user's cooking skills, dietary restrictions, allergies, and food preferences when selecting foods
7. Ensure meals align with their activity level, weight goals, and health conditions
8. Provide variety across different days while maintaining nutritional consistency and hitting daily targets
9. Use real food products, brand names when appropriate, and authentic recipes that people can actually purchase and prepare
10. The total calories across all meals should equal ${formData.caloriesTarget} calories daily

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
    userProfile: UserOnboarding,
    userId?: number,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    schedule: GeneratedSchedule;
    prompt: string;
    aiResponse: string;
    tokensUsed?: number;
    generationTimeMs: number;
  }> {
    const startTime = Date.now();
    let promptHistoryId: number | undefined;
    
    try {
      const prompt = this.createPrompt(formData, userProfile);
      
      const selectedModel = formData.aiModel || "gpt-4o";
      const systemPrompt = "You are a professional nutritionist and dietitian AI assistant. Always respond with valid JSON in the exact format requested.";
      
      // Log prompt to database before API call
      if (userId) {
        const promptHistoryEntry = await storage.createPromptHistory({
          userId,
          sessionId,
          feature: 'schedule_generation',
          aiModel: selectedModel,
          userPrompt: `Goal: ${formData.goal}`,
          systemPrompt,
          fullPrompt: prompt,
          requestData: {
            formData,
            userProfile: {
              id: userProfile.id,
              age: userProfile.age,
              gender: userProfile.gender,
              activityLevel: userProfile.activityLevel
            }
          },
          status: 'processing',
          ipAddress,
          userAgent
        });
        promptHistoryId = promptHistoryEntry.id;
      }

      const response = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      });

      const generationTimeMs = Date.now() - startTime;
      const aiResponse = response.choices[0].message.content || "";
      let cleanedResponse: string | undefined; // Declare at proper scope
      
      let schedule: GeneratedSchedule;
      try {
        schedule = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Raw AI Response causing parse error:', aiResponse);
        console.error('Parse error details:', parseError);
        
        // Try to clean up the response and parse again
        cleanedResponse = aiResponse.trim();
        
        // Remove any text before the first {
        const firstBrace = cleanedResponse.indexOf('{');
        if (firstBrace > 0) {
          cleanedResponse = cleanedResponse.substring(firstBrace);
        }
        
        // Remove any text after the last }
        const lastBrace = cleanedResponse.lastIndexOf('}');
        if (lastBrace >= 0 && lastBrace < cleanedResponse.length - 1) {
          cleanedResponse = cleanedResponse.substring(0, lastBrace + 1);
        }
        
        try {
          schedule = JSON.parse(cleanedResponse);
          console.log('Successfully parsed cleaned response');
        } catch (secondParseError) {
          throw new Error(`Failed to parse AI response as JSON: ${parseError}\nCleaned response also failed: ${secondParseError}\nOriginal response length: ${aiResponse.length}`);
        }
      }

      // Calculate end date if not provided
      if (!schedule.endDate && schedule.startDate && schedule.duration) {
        const startDate = new Date(schedule.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + schedule.duration - 1);
        schedule.endDate = endDate.toISOString().split('T')[0];
      }

      // Update prompt history with successful result
      if (userId && promptHistoryId) {
        await storage.createPromptHistory({
          userId,
          sessionId,
          feature: 'schedule_generation',
          aiModel: selectedModel,
          userPrompt: `Goal: ${formData.goal}`,
          systemPrompt,
          fullPrompt: prompt,
          requestData: {
            formData,
            userProfile: {
              id: userProfile.id,
              age: userProfile.age,
              gender: userProfile.gender,
              activityLevel: userProfile.activityLevel
            }
          },
          aiResponse,
          processedResponse: cleanedResponse || aiResponse,
          parsedData: schedule,
          tokensUsed: response.usage?.total_tokens,
          promptTokens: response.usage?.prompt_tokens,
          completionTokens: response.usage?.completion_tokens,
          generationTimeMs,
          responseLength: aiResponse.length,
          parseSuccess: true,
          status: 'success',
          ipAddress,
          userAgent
        });
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log error to prompt history
      if (userId && promptHistoryId) {
        await storage.createPromptHistory({
          userId,
          sessionId,
          feature: 'schedule_generation',
          aiModel: formData.aiModel || "gpt-4o",
          userPrompt: `Goal: ${formData.goal}`,
          systemPrompt: "You are a professional nutritionist and dietitian AI assistant. Always respond with valid JSON in the exact format requested.",
          fullPrompt: this.createPrompt(formData, userProfile),
          requestData: {
            formData,
            userProfile: {
              id: userProfile.id,
              age: userProfile.age,
              gender: userProfile.gender,
              activityLevel: userProfile.activityLevel
            }
          },
          generationTimeMs,
          status: 'error',
          errorMessage,
          parseSuccess: false,
          ipAddress,
          userAgent
        });
      }
      
      console.error('AI Schedule Generation Error:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        formData,
        userProfile: userProfile.id || 'unknown'
      });
      throw new Error(`AI schedule generation failed: ${errorMessage}`);
    }
  }
}