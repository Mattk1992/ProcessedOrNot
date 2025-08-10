import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";

type CalendarView = "monthly" | "weekly" | "daily";

export default function NutritionCalendar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("monthly");

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Sample nutrition data (in a real app, this would come from the API)
  const nutritionData: Record<string, { calories: number; protein: number; carbs: number; fat: number; scans: number }> = {
    "2025-01-10": { calories: 2150, protein: 120, carbs: 280, fat: 75, scans: 3 },
    "2025-01-09": { calories: 1980, protein: 110, carbs: 240, fat: 68, scans: 2 },
    "2025-01-08": { calories: 2300, protein: 135, carbs: 320, fat: 85, scans: 4 },
  };

  const formatDateKey = (date: Date) => format(date, "yyyy-MM-dd");

  const getDaysToShow = () => {
    switch (view) {
      case "monthly":
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
      case "weekly":
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case "daily":
        return [currentDate];
      default:
        return [];
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    switch (view) {
      case "monthly":
        setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
      case "weekly":
        setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case "daily":
        setCurrentDate(direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1));
        break;
    }
  };

  const getTitle = () => {
    switch (view) {
      case "monthly":
        return format(currentDate, "MMMM yyyy");
      case "weekly":
        return `Week of ${format(startOfWeek(currentDate), "MMM dd, yyyy")}`;
      case "daily":
        return format(currentDate, "EEEE, MMMM dd, yyyy");
    }
  };

  const days = getDaysToShow();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/nutri-dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nutrition Calendar</h1>
              <p className="text-muted-foreground mt-1">Track your daily nutrition and meal patterns</p>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex gap-2">
              <Button
                variant={view === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={view === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={view === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("daily")}
              >
                Daily
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => navigateDate("prev")}>
                ←
              </Button>
              <CardTitle className="text-xl">{getTitle()}</CardTitle>
              <Button variant="outline" onClick={() => navigateDate("next")}>
                →
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Calendar Grid */}
        <div className={`grid gap-4 ${
          view === "monthly" ? "grid-cols-7" : 
          view === "weekly" ? "grid-cols-7" : 
          "grid-cols-1"
        }`}>
          {/* Day Headers for Monthly/Weekly View */}
          {view !== "daily" && ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-semibold text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day) => {
            const dateKey = formatDateKey(day);
            const dayData = nutritionData[dateKey];
            const isCurrentMonth = view === "monthly" ? isSameMonth(day, currentDate) : true;
            const isDayToday = isToday(day);
            const isSelected = view === "daily" ? isSameDay(day, currentDate) : false;

            return (
              <Card
                key={dateKey}
                className={`
                  ${view === "daily" ? "h-auto" : "h-32"}
                  ${!isCurrentMonth ? "opacity-50" : ""}
                  ${isDayToday ? "ring-2 ring-primary" : ""}
                  ${isSelected ? "ring-2 ring-blue-500" : ""}
                  cursor-pointer hover:shadow-md transition-all
                `}
                onClick={() => {
                  if (view !== "daily") {
                    setCurrentDate(day);
                    setView("daily");
                  }
                }}
              >
                <CardContent className="p-2">
                  <div className="flex flex-col h-full">
                    {/* Date */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${isDayToday ? "text-primary" : ""}`}>
                        {format(day, "d")}
                      </span>
                      {dayData && (
                        <Badge variant="secondary" className="text-xs">
                          {dayData.scans} scans
                        </Badge>
                      )}
                    </div>

                    {/* Nutrition Summary */}
                    {dayData && (
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {dayData.calories} cal
                          </div>
                          {view === "daily" && (
                            <>
                              <div className="mt-1">Protein: {dayData.protein}g</div>
                              <div>Carbs: {dayData.carbs}g</div>
                              <div>Fat: {dayData.fat}g</div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {!dayData && isCurrentMonth && (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                        No data
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Daily View Detailed Card */}
        {view === "daily" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detailed View - {format(currentDate, "EEEE, MMMM dd, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nutritionData[formatDateKey(currentDate)] ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {nutritionData[formatDateKey(currentDate)].calories}
                      </div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {nutritionData[formatDateKey(currentDate)].protein}g
                      </div>
                      <div className="text-sm text-muted-foreground">Protein</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {nutritionData[formatDateKey(currentDate)].carbs}g
                      </div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {nutritionData[formatDateKey(currentDate)].fat}g
                      </div>
                      <div className="text-sm text-muted-foreground">Fat</div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No nutrition data for this day</h3>
                  <p className="text-muted-foreground mb-4">
                    Start scanning products to track your nutrition intake
                  </p>
                  <Button onClick={() => setLocation("/product-lookup")}>
                    Scan a Product
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}