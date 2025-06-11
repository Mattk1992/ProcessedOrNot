import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Lightbulb, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FunFactsProps {
  productName: string;
  ingredients: string;
  nutriments: Record<string, any> | null;
  processingScore: number;
}

interface FunFact {
  title: string;
  fact: string;
  category: 'nutrition' | 'history' | 'processing' | 'environment';
  icon: React.ReactNode;
}

export default function FunFacts({ productName, ingredients, nutriments, processingScore }: FunFactsProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const { t } = useLanguage();

  const generateFunFacts = (): FunFact[] => {
    const facts: FunFact[] = [];

    // Nutrition-based facts
    if (nutriments) {
      if (nutriments.energy_100g || nutriments.energy) {
        const energy = nutriments.energy_100g || nutriments.energy;
        facts.push({
          title: "Energy Equivalent",
          fact: `${energy} calories is enough energy to power an LED light bulb for about ${Math.round(energy / 0.01)} hours!`,
          category: 'nutrition',
          icon: <Zap className="w-4 h-4" />
        });
      }

      if (nutriments.sugars_100g || nutriments.sugars) {
        const sugars = nutriments.sugars_100g || nutriments.sugars;
        const sugarCubes = Math.round(sugars / 4);
        if (sugarCubes > 0) {
          facts.push({
            title: "Sugar Content",
            fact: `This product contains about ${sugarCubes} sugar cube${sugarCubes !== 1 ? 's' : ''} worth of sugar per 100g.`,
            category: 'nutrition',
            icon: <Sparkles className="w-4 h-4" />
          });
        }
      }

      if (nutriments.proteins_100g || nutriments.proteins) {
        const proteins = nutriments.proteins_100g || nutriments.proteins;
        if (proteins > 15) {
          facts.push({
            title: "Protein Power",
            fact: `With ${proteins.toFixed(1)}g of protein per 100g, this product contains more protein than most nuts!`,
            category: 'nutrition',
            icon: <Lightbulb className="w-4 h-4" />
          });
        }
      }
    }

    // Processing-based facts
    if (processingScore) {
      if (processingScore >= 8) {
        facts.push({
          title: "Ultra-Processed",
          fact: "Ultra-processed foods were first categorized by Brazilian nutrition researcher Carlos Monteiro in 2009.",
          category: 'processing',
          icon: <Lightbulb className="w-4 h-4" />
        });
      } else if (processingScore <= 3) {
        facts.push({
          title: "Minimally Processed",
          fact: "Minimally processed foods retain most of their natural nutritional and physical properties.",
          category: 'processing',
          icon: <Sparkles className="w-4 h-4" />
        });
      }
    }

    // Ingredient-based facts
    if (ingredients) {
      const ingredientList = ingredients.toLowerCase();
      
      if (ingredientList.includes('palm oil')) {
        facts.push({
          title: "Palm Oil Impact",
          fact: "Palm oil is the most widely used vegetable oil globally, found in about 50% of packaged products.",
          category: 'environment',
          icon: <Lightbulb className="w-4 h-4" />
        });
      }

      if (ingredientList.includes('cocoa') || ingredientList.includes('chocolate')) {
        facts.push({
          title: "Cocoa History",
          fact: "Cocoa beans were so valuable to the Aztecs that they used them as currency!",
          category: 'history',
          icon: <Sparkles className="w-4 h-4" />
        });
      }

      if (ingredientList.includes('vanilla')) {
        facts.push({
          title: "Vanilla Fact",
          fact: "Vanilla is the second most expensive spice in the world after saffron because it's hand-pollinated!",
          category: 'history',
          icon: <Lightbulb className="w-4 h-4" />
        });
      }

      if (ingredientList.includes('milk') || ingredientList.includes('dairy')) {
        facts.push({
          title: "Dairy Science",
          fact: "A single cow produces an average of 6-7 gallons of milk per day!",
          category: 'nutrition',
          icon: <Zap className="w-4 h-4" />
        });
      }
    }

    // Product-specific facts based on name
    const productLower = productName.toLowerCase();
    
    if (productLower.includes('cola') || productLower.includes('coca')) {
      facts.push({
        title: "Cola Origins",
        fact: "The original Coca-Cola recipe included coca leaf extract and was sold as a medicinal tonic in 1886.",
        category: 'history',
        icon: <Lightbulb className="w-4 h-4" />
      });
    }

    if (productLower.includes('potato') || productLower.includes('chips') || productLower.includes('crisp')) {
      facts.push({
        title: "Potato Chips",
        fact: "Potato chips were invented by accident in 1853 when a chef tried to make the thinnest french fries possible!",
        category: 'history',
        icon: <Sparkles className="w-4 h-4" />
      });
    }

    if (productLower.includes('bread') || productLower.includes('wheat')) {
      facts.push({
        title: "Bread History",
        fact: "Bread is one of humanity's oldest prepared foods, with evidence of bread-making dating back 30,000 years!",
        category: 'history',
        icon: <Lightbulb className="w-4 h-4" />
      });
    }

    // General fun facts if we don't have enough specific ones
    if (facts.length < 3) {
      facts.push(
        {
          title: "Food Packaging",
          fact: "The average person encounters over 300 food products in a typical grocery store visit!",
          category: 'environment',
          icon: <Sparkles className="w-4 h-4" />
        },
        {
          title: "Taste Buds",
          fact: "Humans have about 10,000 taste buds, and they regenerate every 1-2 weeks!",
          category: 'nutrition',
          icon: <Zap className="w-4 h-4" />
        },
        {
          title: "Food Colors",
          fact: "The colors of food can actually affect how we perceive taste - red foods often taste sweeter!",
          category: 'nutrition',
          icon: <Lightbulb className="w-4 h-4" />
        }
      );
    }

    return facts.slice(0, 5); // Limit to 5 facts
  };

  const facts = generateFunFacts();

  useEffect(() => {
    if (facts.length <= 1) return;

    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
        setIsRotating(false);
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, [facts.length]);

  const rotateFact = () => {
    if (facts.length <= 1) return;
    
    setIsRotating(true);
    setTimeout(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
      setIsRotating(false);
    }, 200);
  };

  if (facts.length === 0) return null;

  const currentFact = facts[currentFactIndex];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'nutrition': return 'bg-green-100 text-green-800 border-green-200';
      case 'history': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'environment': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
              <p className="text-sm text-white/80">{t('funfacts.subtitle')}</p>
            </div>
          </div>
          {facts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={rotateFact}
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <div className={`transition-all duration-500 transform ${isRotating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-accent/20 to-primary/20 text-accent mr-4">
                {currentFact.icon}
              </div>
              <Badge className={`${getCategoryColor(currentFact.category)} border capitalize`}>
                {t(`funfacts.category.${currentFact.category}`)}
              </Badge>
            </div>
            
            <h4 className="text-xl font-bold text-foreground mb-3">
              {currentFact.title}
            </h4>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              {currentFact.fact}
            </p>
          </div>

          {/* Fact Navigation Dots */}
          {facts.length > 1 && (
            <div className="flex justify-center space-x-2">
              {facts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFactIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFactIndex 
                      ? 'bg-accent scale-125 glow-effect' 
                      : 'bg-muted hover:bg-muted-foreground/30 scale-on-hover'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}