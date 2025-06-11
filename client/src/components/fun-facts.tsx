import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Lightbulb, Zap, Leaf, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FunFactsProps {
  productName: string;
  ingredients: string;
  nutriments: Record<string, any> | null;
  processingScore: number;
  barcode: string;
}

interface FunFact {
  title: string;
  fact: string;
  category: 'nutrition' | 'history' | 'processing' | 'environment';
  icon: React.ReactNode;
}

export default function FunFacts({ productName, ingredients, nutriments, processingScore, barcode }: FunFactsProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const { t, language } = useLanguage();

  const { data: apiFacts, isLoading } = useQuery<{ facts: Array<{title: string, fact: string, category: string}> }>({
    queryKey: ["/api/products", barcode, "fun-facts", language],
    queryFn: async () => {
      const response = await fetch(`/api/products/${barcode}/fun-facts?language=${language}`);
      if (!response.ok) throw new Error('Failed to get fun facts');
      return response.json();
    },
    enabled: !!barcode,
  });

  const getIconForCategory = (category: string): React.ReactNode => {
    switch (category) {
      case 'nutrition': return <Zap className="w-4 h-4" />;
      case 'history': return <Lightbulb className="w-4 h-4" />;
      case 'processing': return <Sparkles className="w-4 h-4" />;
      case 'environment': return <Leaf className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const processedFacts: FunFact[] = apiFacts?.facts?.map(fact => ({
    title: fact.title,
    fact: fact.fact,
    category: fact.category as 'nutrition' | 'history' | 'processing' | 'environment',
    icon: getIconForCategory(fact.category)
  })) || [];

  const facts = processedFacts;

  const nextFact = () => {
    setIsRotating(true);
    setTimeout(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
      setIsRotating(false);
    }, 200);
  };

  useEffect(() => {
    if (facts.length > 0) {
      const interval = setInterval(nextFact, 8000);
      return () => clearInterval(interval);
    }
  }, [facts.length]);

  if (isLoading) {
    return (
      <Card className="nutrition-spotlight-entrance">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('funfacts.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">{t('funfacts.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (facts.length === 0) return null;

  const currentFact = facts[currentFactIndex];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'history': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
      case 'environment': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600';
    }
  };

  return (
    <Card className="glass-card border-2 border-accent/20 shadow-xl glow-effect overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-accent to-primary text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center floating-animation">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('funfacts.title')}</h3>
              <p className="text-white/80 text-sm">{t('funfacts.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getCategoryColor(currentFact.category)}>
              {currentFact.icon}
              <span className="ml-1.5 capitalize">{t(`funfacts.category.${currentFact.category}`)}</span>
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextFact}
              className="text-white hover:bg-white/20 p-2"
              disabled={isRotating}
            >
              <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className={`transition-all duration-300 ${isRotating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
          <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            {currentFact.icon}
            {currentFact.title}
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {currentFact.fact}
          </p>
        </div>
        
        {facts.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {facts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFactIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentFactIndex
                    ? 'bg-primary w-6'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}