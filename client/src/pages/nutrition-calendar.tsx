import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, TrendingUp, ArrowLeft, Download, Copy, ExternalLink, Smartphone, Monitor, Plus, Sparkles, Settings, Edit, Trash2, MoreVertical } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { CalendarEntry } from "@shared/schema";

type CalendarView = "monthly" | "weekly" | "daily";

export default function NutritionCalendar() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("daily");
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
    specialNotes: '',
    aiModel: 'gpt-4o'
  });
  const [selectedAiModel, setSelectedAiModel] = useState('gpt-4o');
  const [editingEntry, setEditingEntry] = useState<CalendarEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    goal: '',
    duration: '',
    dailyCalories: '',
    dailyProtein: '',
    dailyCarbs: '',
    dailyFat: '',
    specialNotes: ''
  });
  
  // Sync AI model with form
  useEffect(() => {
    setScheduleForm(prev => ({
      ...prev,
      aiModel: selectedAiModel
    }));
  }, [selectedAiModel]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);
  const { toast } = useToast();

  // Open edit dialog and populate form
  const openEditDialog = (entry: CalendarEntry) => {
    setEditingEntry(entry);
    setEditForm({
      title: entry.title || '',
      description: entry.description || '',
      goal: entry.goal || '',
      duration: entry.duration?.toString() || '',
      dailyCalories: entry.dailyCalories?.toString() || '',
      dailyProtein: entry.dailyProtein?.toString() || '',
      dailyCarbs: entry.dailyCarbs?.toString() || '',
      dailyFat: entry.dailyFat?.toString() || '',
      specialNotes: entry.specialNotes || ''
    });
    setIsEditDialogOpen(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    const updateData = {
      title: editForm.title,
      description: editForm.description,
      goal: editForm.goal,
      duration: editForm.duration ? parseInt(editForm.duration) : null,
      dailyCalories: editForm.dailyCalories ? parseInt(editForm.dailyCalories) : null,
      dailyProtein: editForm.dailyProtein ? parseInt(editForm.dailyProtein) : null,
      dailyCarbs: editForm.dailyCarbs ? parseInt(editForm.dailyCarbs) : null,
      dailyFat: editForm.dailyFat ? parseInt(editForm.dailyFat) : null,
      specialNotes: editForm.specialNotes
    };

    updateEntryMutation.mutate({ id: editingEntry.id, data: updateData });
  };

  // Handle delete confirmation
  const handleDelete = (entry: CalendarEntry) => {
    deleteEntryMutation.mutate(entry.id);
  };

  // Fetch calendar entries
  const { data: calendarEntries = [], isLoading: isLoadingEntries } = useQuery<CalendarEntry[]>({
    queryKey: ['/api/calendar/entries'],
    enabled: isAuthenticated,
  });

  // Fetch user's meal times and percentages
  const { data: mealData } = useQuery({
    queryKey: ['/api/nutrition/meal-times'],
    enabled: isAuthenticated,
  });

  // Update calendar entry mutation
  const updateEntryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest('PUT', `/api/calendar/entries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/entries'] });
      toast({
        title: "Plan Updated",
        description: "Your nutrition plan has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update nutrition plan.",
        variant: "destructive",
      });
    },
  });

  // Delete calendar entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest('DELETE', `/api/calendar/entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/entries'] });
      toast({
        title: "Plan Deleted",
        description: "Your nutrition plan has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete nutrition plan.",
        variant: "destructive",
      });
    },
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
      // Include user's meal times and percentages in the request
      const enhancedFormData = {
        ...formData,
        mealTimes: mealData && typeof mealData === 'object' ? {
          breakfastTime: (mealData as any).breakfastTime,
          lunchTime: (mealData as any).lunchTime,
          dinnerTime: (mealData as any).dinnerTime,
          snackTime: (mealData as any).snackTime,
        } : undefined,
        mealPercentages: mealData && typeof mealData === 'object' ? {
          breakfast: (mealData as any).breakfastPercent,
          lunch: (mealData as any).lunchPercent,
          dinner: (mealData as any).dinnerPercent,
          snack: (mealData as any).snackPercent,
        } : undefined,
      };
      
      const response = await fetch('/api/calendar/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enhancedFormData),
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
      
      // Automatically update webcal URLs if they were returned
      if (data.webcalUrls) {
        setWebcalUrls(data.webcalUrls);
      }
      
      toast({
        title: "AI Schedule Generated!",
        description: `Successfully created "${data.schedule?.title || 'your schedule'}" with personalized recommendations. Calendar feed updated automatically.`,
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
      specialNotes: '',
      aiModel: selectedAiModel
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
    generateScheduleMutation.mutate({
      ...scheduleForm,
      aiModel: selectedAiModel
    });
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
              
              {/* Admin AI Model Selector */}
              {user?.accountType === 'Admin' && (
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Settings className="w-4 h-4" />
                        {selectedAiModel}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>AI Model</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setSelectedAiModel('gpt-4o')}
                        className={selectedAiModel === 'gpt-4o' ? 'bg-accent' : ''}
                      >
                        GPT-4o (Latest)
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSelectedAiModel('gpt-4o-mini')}
                        className={selectedAiModel === 'gpt-4o-mini' ? 'bg-accent' : ''}
                      >
                        GPT-4o Mini
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSelectedAiModel('gpt-4-turbo')}
                        className={selectedAiModel === 'gpt-4-turbo' ? 'bg-accent' : ''}
                      >
                        GPT-4 Turbo
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSelectedAiModel('gpt-3.5-turbo')}
                        className={selectedAiModel === 'gpt-3.5-turbo' ? 'bg-accent' : ''}
                      >
                        GPT-3.5 Turbo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              
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
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold">{entry.title}</h3>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => openEditDialog(entry)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Plan
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the nutrition plan "{entry.title}". This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(entry)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
                          
                          {/* Display detailed daily schedule if available */}
                          {entry.dailySchedule && Array.isArray(entry.dailySchedule) && (
                            <div className="mt-4 space-y-4">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Daily Meal Plans
                              </h4>
                              
                              {entry.dailySchedule.map((daySchedule: any) => {
                                const scheduleDate = new Date(daySchedule.date);
                                const isCurrentDay = isSameDay(scheduleDate, currentDate);
                                
                                if (isCurrentDay && daySchedule.meals) {
                                  return (
                                    <div key={daySchedule.day} className="border rounded-lg p-4 bg-background">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium text-md">
                                          Day {daySchedule.day} - {format(scheduleDate, "MMM dd")}
                                        </h5>
                                        <div className="text-sm text-muted-foreground">
                                          Total: {daySchedule.dailyTotalCalories || 0} cal
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        {daySchedule.meals.map((meal: any, mealIndex: number) => (
                                          <div key={mealIndex} className="border rounded p-3 bg-muted/50">
                                            <div className="flex items-center justify-between mb-2">
                                              <h6 className="font-medium text-sm flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4" />
                                                {meal.name} - {meal.time}
                                              </h6>
                                              <span className="text-xs text-muted-foreground">
                                                {meal.totalCalories} cal
                                              </span>
                                            </div>
                                            
                                            {meal.foods && meal.foods.length > 0 && (
                                              <div className="space-y-2">
                                                {meal.foods.map((food: any, foodIndex: number) => (
                                                  <div key={foodIndex} className="flex items-center justify-between text-xs">
                                                    <div className="flex-1">
                                                      <div className="font-medium">{food.item}</div>
                                                      <div className="text-muted-foreground">{food.portion}</div>
                                                      {food.preparation && (
                                                        <div className="text-muted-foreground italic">
                                                          {food.preparation}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <div className="text-right text-muted-foreground min-w-0 ml-2">
                                                      <div>{food.calories} cal</div>
                                                      <div className="flex gap-1 text-xs">
                                                        <span className="text-green-600">P:{food.protein}g</span>
                                                        <span className="text-orange-600">C:{food.carbs}g</span>
                                                        <span className="text-purple-600">F:{food.fat}g</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                            
                                            {meal.notes && (
                                              <div className="mt-2 text-xs text-muted-foreground italic">
                                                Note: {meal.notes}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      
                                      {/* Daily totals breakdown */}
                                      <div className="mt-3 pt-3 border-t">
                                        <div className="grid grid-cols-4 gap-2 text-xs text-center">
                                          <div>
                                            <div className="font-medium">{daySchedule.dailyTotalCalories || 0}</div>
                                            <div className="text-muted-foreground">Calories</div>
                                          </div>
                                          <div>
                                            <div className="font-medium text-green-600">{daySchedule.dailyTotalProtein || 0}g</div>
                                            <div className="text-muted-foreground">Protein</div>
                                          </div>
                                          <div>
                                            <div className="font-medium text-orange-600">{daySchedule.dailyTotalCarbs || 0}g</div>
                                            <div className="text-muted-foreground">Carbs</div>
                                          </div>
                                          <div>
                                            <div className="font-medium text-purple-600">{daySchedule.dailyTotalFat || 0}g</div>
                                            <div className="text-muted-foreground">Fat</div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}
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

                  {/* Timezone Settings */}
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-1 block">
                          Time Zone Settings
                        </Label>
                        <p className="text-xs text-orange-600 dark:text-orange-300">
                          Calendar events are synced based on your timezone. Update your timezone settings for accurate meal times.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsWebcalDialogOpen(false);
                          window.location.href = '/nutri-dashboard/profile';
                        }}
                        className="ml-3 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/40"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Set Timezone
                      </Button>
                    </div>
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

        {/* Edit Plan Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Nutrition Plan</DialogTitle>
              <DialogDescription>
                Update the details of your nutrition plan
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Plan Title</Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Enter plan title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-goal">Goal</Label>
                  <Input
                    id="edit-goal"
                    value={editForm.goal}
                    onChange={(e) => setEditForm({ ...editForm, goal: e.target.value })}
                    placeholder="Weight loss, muscle gain, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Brief description of the plan"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="edit-duration">Duration (days)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min="1"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    placeholder="7"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-calories">Daily Calories</Label>
                  <Input
                    id="edit-calories"
                    type="number"
                    min="500"
                    max="5000"
                    value={editForm.dailyCalories}
                    onChange={(e) => setEditForm({ ...editForm, dailyCalories: e.target.value })}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-protein">Protein (g)</Label>
                  <Input
                    id="edit-protein"
                    type="number"
                    min="0"
                    value={editForm.dailyProtein}
                    onChange={(e) => setEditForm({ ...editForm, dailyProtein: e.target.value })}
                    placeholder="150"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-carbs">Carbs (g)</Label>
                  <Input
                    id="edit-carbs"
                    type="number"
                    min="0"
                    value={editForm.dailyCarbs}
                    onChange={(e) => setEditForm({ ...editForm, dailyCarbs: e.target.value })}
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-fat">Fat (g)</Label>
                  <Input
                    id="edit-fat"
                    type="number"
                    min="0"
                    value={editForm.dailyFat}
                    onChange={(e) => setEditForm({ ...editForm, dailyFat: e.target.value })}
                    placeholder="67"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-notes">Special Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editForm.specialNotes}
                  onChange={(e) => setEditForm({ ...editForm, specialNotes: e.target.value })}
                  placeholder="Any special considerations, allergies, or preferences"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateEntryMutation.isPending}
                  className="flex-1"
                >
                  {updateEntryMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Updating Plan...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Plan
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}