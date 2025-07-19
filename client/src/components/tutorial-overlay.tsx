import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Camera, Search, MessageCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetSelector?: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function TutorialOverlay({ isOpen, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { t } = useLanguage();

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to ProcessedOrNot Scanner!',
      description: 'Let\'s take a quick tour to help you discover how processed your food really is.',
      icon: <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">👋</span>
      </div>,
      position: 'center'
    },
    {
      id: 'camera-scan',
      title: 'Scan with Camera',
      description: 'Click "Start Camera Scanner" to scan product barcodes instantly with your device camera.',
      icon: <Camera className="w-6 h-6 text-primary" />,
      targetSelector: '[data-tutorial="camera-button"]',
      position: 'bottom',
      highlight: true
    },
    {
      id: 'manual-entry',
      title: 'Manual Entry & Text Search',
      description: 'Enter barcodes manually or type product names like "Greek Yogurt" for text-based search.',
      icon: <Search className="w-6 h-6 text-accent" />,
      targetSelector: '[data-tutorial="manual-input"]',
      position: 'top',
      highlight: true
    },
    {
      id: 'processing-analysis',
      title: 'AI Processing Analysis',
      description: 'Get detailed analysis of processing levels, ingredient breakdown, and health insights powered by AI.',
      icon: <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-500 rounded text-white flex items-center justify-center">
        <span className="text-xs font-bold">AI</span>
      </div>,
      position: 'center'
    },
    {
      id: 'nutribot',
      title: 'Ask NutriBot',
      description: 'Chat with our AI nutritionist for personalized advice about any product or nutrition question.',
      icon: <MessageCircle className="w-6 h-6 text-purple-500" />,
      targetSelector: '[data-tutorial="nutribot"]',
      position: 'left',
      highlight: true
    },
    {
      id: 'menu-features',
      title: 'Explore More Features',
      description: 'Access language settings, help documentation, and account features through the menu.',
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      targetSelector: '[data-tutorial="menu-dropdown"]',
      position: 'bottom',
      highlight: true
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start scanning products to discover their processing levels and make healthier food choices.',
      icon: <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">✓</span>
      </div>,
      position: 'center'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const currentStepData = tutorialSteps[currentStep];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('processedornot-tutorial-disabled', 'true');
    }
    onComplete();
    onClose();
    setCurrentStep(0);
    setDontShowAgain(false);
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('processedornot-tutorial-disabled', 'true');
    }
    onClose();
    setCurrentStep(0);
    setDontShowAgain(false);
  };

  const getStepPosition = () => {
    if (!currentStepData.targetSelector) {
      return 'center';
    }

    const targetElement = document.querySelector(currentStepData.targetSelector);
    if (!targetElement) {
      return 'center';
    }

    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Determine best position based on element location
    if (rect.top < viewportHeight / 3) return 'bottom';
    if (rect.top > (viewportHeight * 2) / 3) return 'top';
    if (rect.left < viewportWidth / 3) return 'right';
    if (rect.left > (viewportWidth * 2) / 3) return 'left';
    return 'center';
  };

  const renderHighlight = () => {
    if (!currentStepData.highlight || !currentStepData.targetSelector) {
      return null;
    }

    const targetElement = document.querySelector(currentStepData.targetSelector);
    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    
    return (
      <div
        className="absolute bg-white/10 border-2 border-primary rounded-lg pointer-events-none tutorial-highlight"
        style={{
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          zIndex: 1001,
        }}
      />
    );
  };

  const getTutorialCardPosition = () => {
    const position = getStepPosition();
    
    if (!currentStepData.targetSelector || position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const targetElement = document.querySelector(currentStepData.targetSelector);
    if (!targetElement) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = targetElement.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        return {
          top: rect.top - 20,
          left: Math.max(20, Math.min(rect.left, window.innerWidth - 320)),
          transform: 'translateY(-100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: Math.max(20, Math.min(rect.left, window.innerWidth - 320)),
        };
      case 'left':
        return {
          top: rect.top,
          left: rect.left - 20,
          transform: 'translateX(-100%)',
        };
      case 'right':
        return {
          top: rect.top,
          left: rect.right + 20,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] tutorial-overlay">
      {/* Background overlay with camera-safe zones */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm tutorial-backdrop" />
      
      {/* Highlight for current target */}
      {renderHighlight()}
      
      {/* Tutorial card */}
      <Card 
        className="absolute w-80 max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl tutorial-card"
        style={getTutorialCardPosition()}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {currentStepData.icon}
              <div>
                <h3 className="font-semibold text-foreground">{currentStepData.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center space-x-2 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
            <Checkbox 
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              className="h-4 w-4"
            />
            <label 
              htmlFor="dont-show-again" 
              className="text-sm text-muted-foreground cursor-pointer select-none"
            >
              Don't show this tutorial again
            </label>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Tour
              </Button>
              
              <Button
                onClick={handleNext}
                size="sm"
                className="bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tutorialSteps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}