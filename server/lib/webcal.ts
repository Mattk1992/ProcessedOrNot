import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format as formatDate } from 'date-fns';

interface NutritionEntry {
  date: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  meals: Array<{
    name: string;
    type: string;
    time: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    portion?: string;
    preparation?: string;
    isGenerated?: boolean;
    isSubItem?: boolean;
    mealData?: any; // Complete meal data from AI generator
    foodData?: any; // Complete food data from AI generator
    notes?: string;
    recipeId?: string;
    recipeUrl?: string;
    recipeInstructions?: string[];
    recipeSource?: string;
  }>;
}

export function generateWebcalFeed(entries: NutritionEntry[], userId: number, userTimezone: string = 'UTC'): string {
  const now = new Date();
  const timestamp = formatDate(now, "yyyyMMdd'T'HHmmss'Z'");
  
  // Generate unique UID for the calendar
  const calendarUid = `nutrition-calendar-${userId}@processedornot.com`;
  
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ProcessedOrNot//Nutrition Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ProcessedOrNot Nutrition Calendar',
    'X-WR-CALDESC:Your daily nutrition tracking from ProcessedOrNot Scanner',
    `X-WR-TIMEZONE:${userTimezone}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H', // Refresh every hour
  ].join('\r\n');

  // Add nutrition summary events for each day
  entries.forEach((entry) => {
    const eventDate = entry.date.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
    const eventUid = `nutrition-${entry.date}-${userId}@processedornot.com`;
    
    // Check if this day has generated meals
    const hasGeneratedMeals = entry.meals.some(meal => meal.isGenerated);
    const hasRegularMeals = entry.meals.some(meal => !meal.isGenerated);
    
    // Create a daily nutrition summary event
    let summary = hasGeneratedMeals ? '🤖🍽️ AI Nutrition Plan' : '🍽️ Daily Nutrition';
    let description = hasGeneratedMeals ? 'AI-Generated Nutrition Plan\n\n' : 'Daily Nutrition Summary\n\n';
    
    if (entry.calories) {
      description += `📊 Calories: ${entry.calories}\n`;
    }
    if (entry.protein) {
      description += `🥩 Protein: ${entry.protein}g\n`;
    }
    if (entry.carbohydrates) {
      description += `🍞 Carbs: ${entry.carbohydrates}g\n`;
    }
    if (entry.fat) {
      description += `🥑 Fat: ${entry.fat}g\n`;
    }
    
    if (entry.meals.length > 0) {
      // Group meals by generated vs regular
      const generatedMeals = entry.meals.filter(meal => meal.isGenerated && !meal.isSubItem);
      const regularMeals = entry.meals.filter(meal => !meal.isGenerated);
      
      if (generatedMeals.length > 0) {
        description += '\n🤖 AI-Generated Meals:\n';
        generatedMeals.forEach((meal) => {
          const mealIcon = getMealIcon(meal.type);
          description += `${mealIcon} ${meal.name}`;
          if (meal.calories) {
            description += ` (${meal.calories} cal)`;
          }
          description += '\n';
          
          // Add sub-items (food details) with comprehensive nutrition info
          const subItems = entry.meals.filter(m => m.isSubItem && m.time === meal.time && m.type === meal.type);
          subItems.forEach((subItem) => {
            description += `  ${subItem.name}`;
            if (subItem.calories || subItem.protein || subItem.carbs || subItem.fat) {
              const nutritionParts = [];
              if (subItem.calories) nutritionParts.push(`${subItem.calories} cal`);
              if (subItem.protein) nutritionParts.push(`${subItem.protein}g protein`);
              if (subItem.carbs) nutritionParts.push(`${subItem.carbs}g carbs`);
              if (subItem.fat) nutritionParts.push(`${subItem.fat}g fat`);
              description += ` (${nutritionParts.join(', ')})`;
            }
            if (subItem.preparation) {
              description += ` - ${subItem.preparation}`;
            }
            
            // Add recipe data in summary format
            if (subItem.recipeUrl) {
              description += `\n    🔗 Recipe: ${subItem.recipeUrl}`;
            }
            if (subItem.recipeSource) {
              description += ` (${subItem.recipeSource})`;
            }
            
            description += '\n';
          });
          
          // Add meal notes if available
          if (meal.mealData && meal.mealData.notes) {
            description += `  💡 Notes: ${meal.mealData.notes}\n`;
          }
        });
      }
      
      if (regularMeals.length > 0) {
        description += generatedMeals.length > 0 ? '\n📱 Tracked Meals:\n' : '\nMeals:\n';
        regularMeals.forEach((meal) => {
          const mealIcon = getMealIcon(meal.type);
          description += `${mealIcon} ${meal.name}`;
          if (meal.calories) {
            description += ` (${meal.calories} cal)`;
          }
          description += '\n';
        });
      }
    }
    
    if (hasGeneratedMeals && hasRegularMeals) {
      description += '\nGenerated by AI + Tracked with ProcessedOrNot Scanner';
    } else if (hasGeneratedMeals) {
      description += '\nGenerated by ProcessedOrNot AI';
    } else {
      description += '\nTracked with ProcessedOrNot Scanner';
    }

    // Calculate next day for all-day event end date
    const nextDay = new Date(entry.date);
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = formatDate(nextDay, 'yyyyMMdd');
    
    icalContent += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${eventUid}`,
      `DTSTAMP:${timestamp}`,
      `CREATED:${timestamp}`,
      `LAST-MODIFIED:${timestamp}`,
      `DTSTART;VALUE=DATE:${eventDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'SEQUENCE:0',
      'CATEGORIES:Health,Nutrition',
      'END:VEVENT'
    ].join('\r\n');

    // Add individual meal events (exclude sub-items)
    entry.meals.filter(meal => !meal.isSubItem).forEach((meal, index) => {
      const mealUid = `meal-${entry.date}-${index}-${userId}@processedornot.com`;
      const mealIcon = getMealIcon(meal.type);
      const mealTime = meal.time || '12:00'; // Default to noon if no time specified
      
      // Convert meal time to user's timezone for proper calendar display
      const mealDateTimeLocal = `${entry.date}T${mealTime}:00`;
      const localDateTime = new Date(mealDateTimeLocal);
      
      // Convert to UTC for iCal format, considering user's timezone
      let utcDateTime;
      try {
        // If user has a valid timezone, convert from their timezone to UTC
        if (userTimezone && userTimezone !== 'UTC') {
          const zonedTime = fromZonedTime(localDateTime, userTimezone);
          utcDateTime = formatDate(zonedTime, "yyyyMMdd'T'HHmmss'Z'");
        } else {
          // If no timezone or UTC, treat as UTC
          utcDateTime = formatDate(localDateTime, "yyyyMMdd'T'HHmmss'Z'");
        }
      } catch (error) {
        // Fallback to treating as UTC if timezone conversion fails
        utcDateTime = formatDate(localDateTime, "yyyyMMdd'T'HHmmss'Z'");
      }
      
      const mealTypeText = meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
      let mealDescription = meal.isGenerated ? 
        `🤖 AI-Generated ${mealTypeText} meal\n\n` : 
        `${mealTypeText} meal\n\n`;
      
      mealDescription += `📋 ${meal.name}\n`;
      if (meal.calories) {
        mealDescription += `🔥 ${meal.calories} calories\n`;
      }
      
      // Add comprehensive food details for generated meals
      if (meal.isGenerated) {
        const subItems = entry.meals.filter(m => m.isSubItem && m.time === meal.time && m.type === meal.type);
        if (subItems.length > 0) {
          mealDescription += '\n📝 Detailed Food Breakdown:\n';
          subItems.forEach((subItem) => {
            mealDescription += `\n🍽️ ${subItem.name}\n`;
            if (subItem.portion) {
              mealDescription += `📏 Portion: ${subItem.portion}\n`;
            }
            if (subItem.calories || subItem.protein || subItem.carbs || subItem.fat) {
              mealDescription += '📊 Nutrition per portion:\n';
              if (subItem.calories) mealDescription += `  • Calories: ${subItem.calories}\n`;
              if (subItem.protein) mealDescription += `  • Protein: ${subItem.protein}g\n`;
              if (subItem.carbs) mealDescription += `  • Carbs: ${subItem.carbs}g\n`;
              if (subItem.fat) mealDescription += `  • Fat: ${subItem.fat}g\n`;
            }
            if (subItem.preparation) {
              mealDescription += `👨‍🍳 Preparation: ${subItem.preparation}\n`;
            }
            
            // Add recipe information if available
            if (subItem.recipeUrl) {
              mealDescription += `🔗 Recipe Link: ${subItem.recipeUrl}\n`;
            }
            if (subItem.recipeInstructions && subItem.recipeInstructions.length > 0) {
              mealDescription += `📋 Recipe Instructions:\n`;
              subItem.recipeInstructions.slice(0, 5).forEach((instruction, idx) => {
                mealDescription += `  ${idx + 1}. ${instruction}\n`;
              });
              if (subItem.recipeInstructions.length > 5) {
                mealDescription += `  ... and ${subItem.recipeInstructions.length - 5} more steps\n`;
              }
            }
            if (subItem.recipeSource) {
              mealDescription += `📚 Recipe Source: ${subItem.recipeSource}\n`;
            }
          });
        }
        
        // Add meal-level notes and total nutrition
        if (meal.mealData) {
          if (meal.mealData.notes) {
            mealDescription += `\n💡 Meal Notes: ${meal.mealData.notes}\n`;
          }
          
          // Add meal total nutrition summary
          mealDescription += '\n📈 Meal Totals:\n';
          if (meal.calories) mealDescription += `🔥 Total Calories: ${meal.calories}\n`;
          
          // Calculate totals from food items for more detailed breakdown
          const totalProtein = subItems.reduce((sum, item) => sum + (item.protein || 0), 0);
          const totalCarbs = subItems.reduce((sum, item) => sum + (item.carbs || 0), 0);
          const totalFat = subItems.reduce((sum, item) => sum + (item.fat || 0), 0);
          
          if (totalProtein > 0) mealDescription += `🥩 Total Protein: ${totalProtein}g\n`;
          if (totalCarbs > 0) mealDescription += `🍞 Total Carbs: ${totalCarbs}g\n`;
          if (totalFat > 0) mealDescription += `🥑 Total Fat: ${totalFat}g\n`;
        }
      }
      
      mealDescription += meal.isGenerated ? 
        '\nGenerated by ProcessedOrNot AI' : 
        '\nLogged with ProcessedOrNot Scanner';

      // Calculate end time (1 hour after start) using timezone-aware datetime
      let mealEndDateTime;
      try {
        const startTime = userTimezone && userTimezone !== 'UTC' 
          ? fromZonedTime(new Date(`${entry.date}T${mealTime}:00`), userTimezone) 
          : new Date(`${entry.date}T${mealTime}:00Z`);
        startTime.setHours(startTime.getHours() + 1);
        mealEndDateTime = formatDate(startTime, "yyyyMMdd'T'HHmmss'Z'");
      } catch (error) {
        // Fallback for end time
        const mealEndTime = new Date(`${entry.date}T${mealTime}:00Z`);
        mealEndTime.setHours(mealEndTime.getHours() + 1);
        mealEndDateTime = formatDate(mealEndTime, "yyyyMMdd'T'HHmmss'Z'");
      }
      
      icalContent += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${mealUid}`,
        `DTSTAMP:${timestamp}`,
        `CREATED:${timestamp}`,
        `LAST-MODIFIED:${timestamp}`,
        `DTSTART:${utcDateTime}`,
        `DTEND:${mealEndDateTime}`,
        `SUMMARY:${meal.isGenerated ? '🤖' : ''}${mealIcon} ${meal.name}`,
        `DESCRIPTION:${mealDescription}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'CATEGORIES:Health,Nutrition,Meal',
        'END:VEVENT'
      ].join('\r\n');
    });
  });

  icalContent += '\r\nEND:VCALENDAR';
  
  return icalContent;
}

function getMealIcon(mealType: string): string {
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return '🌅';
    case 'lunch':
      return '🌞';
    case 'dinner':
      return '🌙';
    case 'snack':
      return '🍎';
    default:
      return '🍽️';
  }
}

export function generateWebcalUrl(userId: number, baseUrl: string): string {
  // Generate a secure token for the calendar URL
  const token = Buffer.from(`${userId}-${Date.now()}`).toString('base64url');
  return `webcal://${baseUrl.replace(/^https?:\/\//, '')}/api/webcal/${userId}/${token}.ics`;
}

export function generateHttpsWebcalUrl(userId: number, baseUrl: string): string {
  // Generate a secure token for the calendar URL
  const token = Buffer.from(`${userId}-${Date.now()}`).toString('base64url');
  return `${baseUrl}/api/webcal/${userId}/${token}.ics`;
}

export async function generateWebcalUrls(userId: number, entries: any[]): Promise<{
  webcalUrl: string;
  httpsUrl: string;
  instructions: any;
}> {
  // Generate base URL (we'll use a default since we don't have access to req here)
  const baseUrl = process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 'http://localhost:5000';
  
  return {
    webcalUrl: generateWebcalUrl(userId, baseUrl),
    httpsUrl: generateHttpsWebcalUrl(userId, baseUrl),
    instructions: {
      ios: 'Tap the webcal link to automatically add to your iOS Calendar app',
      android: 'Copy the HTTPS URL and import it into Google Calendar or your preferred calendar app',
      desktop: 'Copy the webcal link and add it as a calendar subscription in your calendar application'
    }
  };
}