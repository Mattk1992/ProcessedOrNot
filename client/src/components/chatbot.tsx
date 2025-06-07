import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm NutriBot, your friendly AI nutritionist! 🌱 I'm here to help you make healthier food choices and answer any questions about nutrition. What would you like to know?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat", {
        message: input,
        messages: messages
      });
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
        } glow-effect floating-animation`}
        style={{ animationDelay: '0.5s' }}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 h-96 glass-effect border shadow-2xl slide-up">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg pb-4">
            <CardTitle className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span>NutriBot</span>
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            </CardTitle>
            <p className="text-green-100 text-sm">Your AI Nutritionist</p>
          </CardHeader>
          
          <CardContent className="p-0 flex flex-col h-80">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div className={`rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about nutrition, recipes, or health tips..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}