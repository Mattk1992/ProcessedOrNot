import { format } from 'date-fns';

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
  }>;
}

export function generateWebcalFeed(entries: NutritionEntry[], userId: number): string {
  const now = new Date();
  const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
  
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
    'X-WR-TIMEZONE:UTC',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H', // Refresh every hour
  ].join('\r\n');

  // Add nutrition summary events for each day
  entries.forEach((entry) => {
    const eventDate = entry.date.replace(/-/g, ''); // Convert YYYY-MM-DD to YYYYMMDD
    const eventUid = `nutrition-${entry.date}-${userId}@processedornot.com`;
    
    // Create a daily nutrition summary event
    let summary = '🍽️ Daily Nutrition';
    let description = 'Daily Nutrition Summary\\n\\n';
    
    if (entry.calories) {
      description += `📊 Calories: ${entry.calories}\\n`;
    }
    if (entry.protein) {
      description += `🥩 Protein: ${entry.protein}g\\n`;
    }
    if (entry.carbohydrates) {
      description += `🍞 Carbs: ${entry.carbohydrates}g\\n`;
    }
    if (entry.fat) {
      description += `🥑 Fat: ${entry.fat}g\\n`;
    }
    
    if (entry.meals.length > 0) {
      description += '\\nMeals:\\n';
      entry.meals.forEach((meal) => {
        const mealIcon = getMealIcon(meal.type);
        description += `${mealIcon} ${meal.name}`;
        if (meal.calories) {
          description += ` (${meal.calories} cal)`;
        }
        description += '\\n';
      });
    }
    
    description += '\\nTracked with ProcessedOrNot Scanner';

    icalContent += '\r\n' + [
      'BEGIN:VEVENT',
      `UID:${eventUid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${eventDate}`,
      `DTEND;VALUE=DATE:${eventDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'TRANSP:TRANSPARENT',
      'CATEGORIES:Health,Nutrition',
      'END:VEVENT'
    ].join('\r\n');

    // Add individual meal events
    entry.meals.forEach((meal, index) => {
      const mealUid = `meal-${entry.date}-${index}-${userId}@processedornot.com`;
      const mealIcon = getMealIcon(meal.type);
      const mealTime = meal.time || '12:00'; // Default to noon if no time specified
      const mealDateTime = `${eventDate}T${mealTime.replace(':', '')}00Z`;
      
      let mealDescription = `${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} meal\\n\\n`;
      mealDescription += `📋 ${meal.name}\\n`;
      if (meal.calories) {
        mealDescription += `🔥 ${meal.calories} calories\\n`;
      }
      mealDescription += '\\nLogged with ProcessedOrNot Scanner';

      icalContent += '\r\n' + [
        'BEGIN:VEVENT',
        `UID:${mealUid}`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${mealDateTime}`,
        `DTEND:${mealDateTime}`,
        `SUMMARY:${mealIcon} ${meal.name}`,
        `DESCRIPTION:${mealDescription}`,
        'STATUS:CONFIRMED',
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