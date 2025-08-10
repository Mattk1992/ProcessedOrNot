import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, X, Send, Bot, User, Loader2, Flag, AlertTriangle, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

type ReportType = 'bug' | 'translation' | 'suspicious' | 'wrong_info';

export default function NutriBotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Report dialog state
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType | ''>('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/nutribot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content.trim(),
          history: messages.slice(-10), // Send last 10 messages for context
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from NutriBot');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: t('nutribot.error'),
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const openReportDialog = (messageId?: string) => {
    setReportingMessageId(messageId || null);
    setReportType('');
    setReportDescription('');
    setIsReportDialogOpen(true);
  };

  const submitReport = async () => {
    if (!reportType || !reportDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a report type and provide a description.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingReport(true);

    try {
      const reportData = {
        type: reportType,
        description: reportDescription.trim(),
        messageId: reportingMessageId,
        messageContent: reportingMessageId ? messages.find(m => m.id === reportingMessageId)?.content : null,
        language: language,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/nutribot/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We'll review your report shortly.",
      });

      setIsReportDialogOpen(false);
      setReportType('');
      setReportDescription('');
      setReportingMessageId(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    const welcomeMessage: Message = {
      id: 'welcome',
      content: "Hi there! 🌟 I'm NutriBot, your friendly AI nutritionist! I'm here to help you make healthier food choices, understand nutrition labels, suggest recipes, and answer any questions about the foods you're scanning. What would you like to know about nutrition today?",
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      startNewConversation();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={openChat}
          data-tutorial="nutribot"
          className="fixed bottom-6 right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-300 z-50 glow-effect floating-animation"
          size="icon"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] z-50 slide-up">
          <Card className="h-full glass-card border-2 border-primary/20 shadow-2xl glow-effect">
            <CardHeader className="bg-gradient-to-r from-primary to-accent text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">NutriBot</CardTitle>
                    <p className="text-xs text-white/80">Your AI Nutritionist</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => openReportDialog()}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                    title="Report an issue"
                  >
                    <Flag className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={startNewConversation}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                    title="New conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full flex flex-col">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                      <div className="flex flex-col space-y-1 max-w-[80%]">
                        <div
                          className={`rounded-2xl p-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-primary to-accent text-white'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            {message.role === 'assistant' && (
                              <Bot className="w-4 h-4 mt-1 text-primary" />
                            )}
                            {message.role === 'user' && (
                              <User className="w-4 h-4 mt-1 text-white" />
                            )}
                            <div className="text-sm leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                        </div>
                        {/* Report button for individual messages */}
                        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <Button
                            onClick={() => openReportDialog(message.id)}
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Flag className="w-3 h-3 mr-1" />
                            Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-2xl p-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-primary" />
                          <div className="flex items-center space-x-1">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-sm text-muted-foreground">NutriBot is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-border/50 p-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask about nutrition, recipes, ingredients..."
                    disabled={isLoading}
                    className="flex-1 border-2 border-border/20 focus:border-primary/50 rounded-xl"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-4 rounded-xl"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Ask me about nutrition, ingredients, or healthy recipes!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Report Issue
            </DialogTitle>
            <DialogDescription>
              {reportingMessageId 
                ? "Report a problem with this specific message" 
                : "Report a general issue with NutriBot"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select 
                value={reportType} 
                onValueChange={(value: ReportType) => setReportType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select what you want to report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug / Technical Issue</SelectItem>
                  <SelectItem value="translation">Bad Translation</SelectItem>
                  <SelectItem value="suspicious">Suspicious User Activity</SelectItem>
                  <SelectItem value="wrong_info">Wrong Information/Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Please describe the issue in detail..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {reportingMessageId && (
              <div className="p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Reported Message:</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  "{messages.find(m => m.id === reportingMessageId)?.content}"
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
              disabled={isSubmittingReport}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReport}
              disabled={isSubmittingReport || !reportType || !reportDescription.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmittingReport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}