import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, TrendingUp, ArrowLeft, Download, Copy, ExternalLink, Smartphone, Monitor, Plus, Sparkles } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { CalendarEntry } from "@shared/schema";

type CalendarView = "monthly" | "weekly" | "daily";

export default function NutritionCalendar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("monthly");
  const [isWebcalDialogOpen, setIsWebcalDialogOpen] = useState(false);
  const [webcalUrls, setWebcalUrls] = useState<{
    webcalUrl: string;
    httpsUrl: string;
    instructions: {
      ios: string;
      android: string;
      desktop: string;
    };
  } | null>(null);
  const [isLoadingWebcal, setIsLoadingWebcal] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    goal: '',
    duration: '7',
    startDate: new Date().toISOString().split('T')[0], // Add start date field with today as default
    caloriesTarget: '',
    proteinTarget: '',
    carbsTarget: '',
    fatTarget: '',
    mealPreferences: [],
    specialNotes: ''
  });
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const { toast } = useToast();

  // Fetch calendar entries
  const { data: calendarEntries = [], isLoading: isLoadingEntries } = useQuery<CalendarEntry[]>({
    queryKey: ['/api/calendar/entries'],
    enabled: isAuthenticated,
  });

  // Create calendar entry mutation
  const createEntryMutation = useMutation({
    mutationFn: (entryData: any) => fetch('/api/calendar/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entryData),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/entries'] });
      setIsScheduleDialogOpen(false);
      resetForm();
      toast({
        title: "Success!",
        description: "Nutrition schedule created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating calendar entry:', error);
      toast({
        title: "Error",
        description: "Failed to create nutrition schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  // AI schedule generation mutation
  const generateScheduleMutation = useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch('/api/calendar/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate schedule');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/entries'] });
      setIsScheduleDialogOpen(false);
      resetForm();
      toast({
        title: "AI Schedule Generated!",
        description: `Successfully created "${data.schedule?.title || 'your schedule'}" with personalized recommendations.`,
      });
    },
    onError: (error: any) => {
      console.error('Error generating AI schedule:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate AI schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setScheduleForm({
      goal: '',
      duration: '7',
      startDate: new Date().toISOString().split('T')[0],
      caloriesTarget: '',
      proteinTarget: '',
      carbsTarget: '',
      fatTarget: '',
      mealPreferences: [],
      specialNotes: ''
    });
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Helper function to get calendar entries for a specific date
  const getEntriesForDate = (date: Date): CalendarEntry[] => {
    const dateKey = formatDateKey(date);
    return calendarEntries.filter(entry => {
      // Check if the date falls within the entry's date range
      const entryStart = new Date(entry.startDate);
      const entryEnd = entry.endDate ? new Date(entry.endDate) : entryStart;
      const currentDate = new Date(dateKey);
      return currentDate >= entryStart && currentDate <= entryEnd;
    });
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

  const fetchWebcalUrls = async () => {
    setIsLoadingWebcal(true);
    try {
      const response = await fetch('/api/webcal/url');
      if (!response.ok) {
        throw new Error('Failed to generate webcal URLs');
      }
      const data = await response.json();
      setWebcalUrls(data);
    } catch (error) {
      console.error('Error fetching webcal URLs:', error);
      toast({
        title: "Error",
        description: "Failed to generate calendar export links. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWebcal(false);
    }
  };

  const openWebcalDialog = () => {
    setIsWebcalDialogOpen(true);
    if (!webcalUrls) {
      fetchWebcalUrls();
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSchedule = async () => {
    if (!scheduleForm.goal || !scheduleForm.startDate || !scheduleForm.caloriesTarget) {
      toast({
        title: "Missing Information",
        description: "Please fill in the schedule title, start date, and calories target.",
        variant: "destructive",
      });
      return;
    }

    // Use AI generation mutation
    generateScheduleMutation.mutate(scheduleForm);
  };

  const handleManualCreate = async () => {
    if (!scheduleForm.goal || !scheduleForm.startDate || !scheduleForm.caloriesTarget) {
      toast({
        title: "Missing Information",
        description: "Please fill in the schedule title, start date, and calories target.",
        variant: "destructive",
      });
      return;
    }
    
    // Create calendar entry data for manual creation
    const entryData = {
      title: `${scheduleForm.goal} - ${scheduleForm.duration} days`,
      description: `Nutrition schedule: ${scheduleForm.goal}`,
      type: 'schedule',
      goal: scheduleForm.goal,
      duration: parseInt(scheduleForm.duration),
      startDate: scheduleForm.startDate,
      dailyCalories: scheduleForm.caloriesTarget ? parseInt(scheduleForm.caloriesTarget) : null,
      dailyProtein: scheduleForm.proteinTarget ? parseFloat(scheduleForm.proteinTarget) : null,
      dailyCarbs: scheduleForm.carbsTarget ? parseFloat(scheduleForm.carbsTarget) : null,
      dailyFat: scheduleForm.fatTarget ? parseFloat(scheduleForm.fatTarget) : null,
      specialNotes: scheduleForm.specialNotes,
      status: 'active'
    };

    createEntryMutation.mutate(entryData);
  };

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
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
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
              
              {/* Generate Nutrition Schedule Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleDialogOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Nutrition Schedule
              </Button>
              
              {/* Webcal Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={openWebcalDialog}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Export Calendar
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
            const dayEntries = getEntriesForDate(day);
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
                      {dayEntries.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {dayEntries.length} plan{dayEntries.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>

                    {/* Calendar Plans Summary */}
                    {dayEntries.length > 0 && (
                      <div className="flex-1 space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {dayEntries.slice(0, 2).map((entry) => (
                            <div key={entry.id} className="truncate">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {entry.title}
                              </div>
                              {entry.dailyCalories && (
                                <div className="text-xs">Target: {entry.dailyCalories} cal</div>
                              )}
                            </div>
                          ))}
                          {dayEntries.length > 2 && (
                            <div className="text-xs">+{dayEntries.length - 2} more plans</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {dayEntries.length === 0 && isCurrentMonth && (
                      <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
                        No plans
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
              {getEntriesForDate(currentDate).length > 0 ? (
                <div className="space-y-4">
                  {getEntriesForDate(currentDate).map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">{entry.title}</h3>
                            {entry.description && (
                              <p className="text-muted-foreground">{entry.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">{entry.status}</Badge>
                              <Badge variant="secondary">{entry.type}</Badge>
                            </div>
                          </div>
                          
                          {(entry.dailyCalories || entry.dailyProtein || entry.dailyCarbs || entry.dailyFat) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {entry.dailyCalories && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-primary">
                                    {entry.dailyCalories}
                                  </div>
                                  <div className="text-sm text-muted-foreground">Calories</div>
                                </div>
                              )}
                              {entry.dailyProtein && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {entry.dailyProtein}g
                                  </div>
                                  <div className="text-sm text-muted-foreground">Protein</div>
                                </div>
                              )}
                              {entry.dailyCarbs && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-orange-600">
                                    {entry.dailyCarbs}g
                                  </div>
                                  <div className="text-sm text-muted-foreground">Carbs</div>
                                </div>
                              )}
                              {entry.dailyFat && (
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {entry.dailyFat}g
                                  </div>
                                  <div className="text-sm text-muted-foreground">Fat</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {entry.specialNotes && (
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                              <strong>Notes:</strong> {entry.specialNotes}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No nutrition plans for this day</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a nutrition schedule to start planning your meals
                  </p>
                  <Button onClick={() => setIsScheduleDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Webcal Export Dialog */}
        <Dialog open={isWebcalDialogOpen} onOpenChange={setIsWebcalDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Export Nutrition Calendar
              </DialogTitle>
              <DialogDescription>
                Export your nutrition calendar to sync with your favorite calendar apps
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {isLoadingWebcal ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Download className="w-8 h-8 animate-bounce mx-auto text-blue-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Generating calendar links...</p>
                  </div>
                </div>
              ) : webcalUrls ? (
                <>
                  {/* iOS/macOS Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-gray-600" />
                      <Label className="text-base font-semibold">iOS & macOS</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {webcalUrls.instructions.ios}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={webcalUrls.webcalUrl}
                        readOnly
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webcalUrls.webcalUrl, "Webcal URL")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(webcalUrls.webcalUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Android/Google Calendar Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-gray-600" />
                      <Label className="text-base font-semibold">Android & Desktop</Label>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {webcalUrls.instructions.android}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={webcalUrls.httpsUrl}
                        readOnly
                        className="flex-1 font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(webcalUrls.httpsUrl, "HTTPS URL")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(webcalUrls.httpsUrl, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop Instructions */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-blue-600" />
                      <Label className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        Desktop Calendar Apps
                      </Label>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      {webcalUrls.instructions.desktop}
                    </p>
                  </div>

                  {/* What gets exported */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <Label className="text-sm font-semibold mb-2 block">What's included:</Label>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Daily nutrition summaries (calories, protein, carbs, fat)</li>
                      <li>• Individual meal entries with timestamps</li>
                      <li>• Food scan counts and meal types</li>
                      <li>• Automatic updates when you log new meals</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    Failed to generate calendar links. Please try again.
                  </p>
                  <Button
                    variant="outline"
                    onClick={fetchWebcalUrls}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsWebcalDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate Nutrition Schedule Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-500" />
                Create Nutrition Schedule
              </DialogTitle>
              <DialogDescription>
                Generate a personalized nutrition plan based on your goals and preferences
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Basic Information</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Schedule Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Weekly Meal Plan, Nutrition Schedule"
                      value={scheduleForm.goal}
                      onChange={(e) => setScheduleForm({...scheduleForm, goal: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={scheduleForm.startDate}
                      onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Schedule Duration</Label>
                    <Select value={scheduleForm.duration} onValueChange={(value) => setScheduleForm({...scheduleForm, duration: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">1 Week</SelectItem>
                        <SelectItem value="14">2 Weeks</SelectItem>
                        <SelectItem value="30">1 Month</SelectItem>
                        <SelectItem value="90">3 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Nutrition Targets */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Daily Nutrition Targets</Label>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories Target *</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="e.g. 2000"
                      value={scheduleForm.caloriesTarget}
                      onChange={(e) => setScheduleForm({...scheduleForm, caloriesTarget: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      placeholder="e.g. 150"
                      value={scheduleForm.proteinTarget}
                      onChange={(e) => setScheduleForm({...scheduleForm, proteinTarget: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbohydrates (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      placeholder="e.g. 250"
                      value={scheduleForm.carbsTarget}
                      onChange={(e) => setScheduleForm({...scheduleForm, carbsTarget: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      placeholder="e.g. 65"
                      value={scheduleForm.fatTarget}
                      onChange={(e) => setScheduleForm({...scheduleForm, fatTarget: e.target.value})}
                    />
                  </div>
                </div>
              </div>



              {/* Special Notes */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Additional Notes</Label>
                <Textarea
                  placeholder="Any special considerations, health conditions, or preferences..."
                  value={scheduleForm.specialNotes}
                  onChange={(e) => setScheduleForm({...scheduleForm, specialNotes: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Preview */}
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <Label className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 block">
                  Schedule Preview
                </Label>
                <div className="text-xs text-green-600 dark:text-green-300 space-y-1">
                  <p>• Start Date: {scheduleForm.startDate ? new Date(scheduleForm.startDate).toLocaleDateString() : 'Not set'}</p>
                  <p>• Duration: {scheduleForm.duration} days</p>
                  <p>• Daily calories: {scheduleForm.caloriesTarget || 'Not set'}</p>
                  <p>• Title: {scheduleForm.goal || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
                disabled={generateScheduleMutation.isPending || createEntryMutation.isPending}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleManualCreate}
                  disabled={generateScheduleMutation.isPending || createEntryMutation.isPending || !scheduleForm.goal || !scheduleForm.startDate || !scheduleForm.caloriesTarget}
                >
                  {createEntryMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create Manually
                    </div>
                  )}
                </Button>
                <Button
                  onClick={handleGenerateSchedule}
                  disabled={generateScheduleMutation.isPending || createEntryMutation.isPending || !scheduleForm.goal || !scheduleForm.startDate || !scheduleForm.caloriesTarget}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {generateScheduleMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating with AI...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}