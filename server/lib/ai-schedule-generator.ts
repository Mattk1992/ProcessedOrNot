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

INSTRUCTIONS:
1. Create a comprehensive nutrition schedule that considers the user's health profile, dietary restrictions, and goals
2. Provide personalized recommendations based on their activity level, medical conditions, and preferences
3. Suggest specific meal ideas that align with their cooking skills and time availability
4. Include practical tips for meal preparation and grocery shopping
5. Ensure the nutrition targets are appropriate for their age, gender, weight goals, and activity level
6. Consider any allergies, medical conditions, and dietary restrictions

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
  "mealSuggestions": [
    {
      "meal": "Breakfast",
      "foods": ["List of suggested foods"],
      "calories": "estimated calories"
    },
    {
      "meal": "Lunch", 
      "foods": ["List of suggested foods"],
      "calories": "estimated calories"
    },
    {
      "meal": "Dinner",
      "foods": ["List of suggested foods"], 
      "calories": "estimated calories"
    }
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
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
      throw new Error(`AI schedule generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}