import { useState, useEffect } from 'react';
import { X, Zap, Heart, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NutritionFact {
  id: string;
  title: string;
  fact: string;
  category: 'energy' | 'health' | 'processing' | 'warning' | 'positive';
  value?: string;
  unit?: string;
  icon: React.ReactNode;
}

interface NutritionFactPopupProps {
  productName: string;
  nutriments: Record<string, any> | null;
  processingScore: number;
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function NutritionFactPopup({ 
  productName, 
  nutriments, 
  processingScore, 
  isVisible, 
  onClose, 
  onComplete 
}: NutritionFactPopupProps) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [facts, setFacts] = useState<NutritionFact[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  // Generate nutrition facts based on product data
  useEffect(() => {
    if (!isVisible || !nutriments) return;

    const generatedFacts: NutritionFact[] = [];

    // Energy fact
    if (nutriments.energy_100g || nutriments['energy-kcal_100g']) {
      const calories = nutriments['energy-kcal_100g'] || Math.round(nutriments.energy_100g / 4.184);
      generatedFacts.push({
        id: 'energy',
        title: 'Energy Content',
        fact: `Contains ${calories} calories per 100g`,
        category: calories > 400 ? 'warning' : calories < 200 ? 'positive' : 'energy',
        value: calories.toString(),
        unit: 'kcal/100g',
        icon: <Zap className="w-5 h-5" />
      });
    }

    // Sugar content
    if (nutriments.sugars_100g) {
      const sugars = Math.round(nutriments.sugars_100g * 10) / 10;
      generatedFacts.push({
        id: 'sugar',
        title: 'Sugar Content',
        fact: sugars > 15 ? 'High in sugar - consume in moderation' : sugars < 5 ? 'Low sugar content' : 'Moderate sugar content',
        category: sugars > 15 ? 'warning' : sugars < 5 ? 'positive' : 'health',
        value: sugars.toString(),
        unit: 'g/100g',
        icon: <Heart className="w-5 h-5" />
      });
    }

    // Sodium/Salt content
    if (nutriments.sodium_100g || nutriments.salt_100g) {
      const sodium = nutriments.sodium_100g || (nutriments.salt_100g * 400); // Convert salt to sodium
      const saltEquivalent = Math.round(sodium * 2.5 * 10) / 10; // Convert to salt equivalent
      generatedFacts.push({
        id: 'salt',
        title: 'Salt Content',
        fact: saltEquivalent > 1.5 ? 'High salt content - watch your intake' : saltEquivalent < 0.3 ? 'Low salt content' : 'Moderate salt content',
        category: saltEquivalent > 1.5 ? 'warning' : saltEquivalent < 0.3 ? 'positive' : 'health',
        value: saltEquivalent.toString(),
        unit: 'g/100g',
        icon: <AlertTriangle className="w-5 h-5" />
      });
    }

    // Fat content
    if (nutriments.fat_100g) {
      const fat = Math.round(nutriments.fat_100g * 10) / 10;
      generatedFacts.push({
        id: 'fat',
        title: 'Fat Content',
        fact: fat > 20 ? 'High fat content' : fat < 3 ? 'Low fat content' : 'Moderate fat content',
        category: fat > 20 ? 'warning' : fat < 3 ? 'positive' : 'health',
        value: fat.toString(),
        unit: 'g/100g',
        icon: <TrendingUp className="w-5 h-5" />
      });
    }

    // Processing level fact
    generatedFacts.push({
      id: 'processing',
      title: 'Processing Level',
      fact: processingScore >= 7 ? 'Highly processed food - limit consumption' : 
            processingScore >= 4 ? 'Moderately processed food' : 
            'Minimally processed food - great choice!',
      category: processingScore >= 7 ? 'warning' : processingScore >= 4 ? 'processing' : 'positive',
      value: processingScore.toString(),
      unit: '/10',
      icon: <Shield className="w-5 h-5" />
    });

    // Protein content
    if (nutriments.proteins_100g) {
      const protein = Math.round(nutriments.proteins_100g * 10) / 10;
      generatedFacts.push({
        id: 'protein',
        title: 'Protein Content',
        fact: protein > 10 ? 'Good source of protein' : protein < 3 ? 'Low protein content' : 'Moderate protein content',
        category: protein > 10 ? 'positive' : 'health',
        value: protein.toString(),
        unit: 'g/100g',
        icon: <CheckCircle className="w-5 h-5" />
      });
    }

    setFacts(generatedFacts);
    setCurrentFactIndex(0);
  }, [isVisible, nutriments, processingScore]);

  // Auto-advance through facts
  useEffect(() => {
    if (!isVisible || facts.length === 0) return;

    const timer = setTimeout(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        if (currentFactIndex < facts.length - 1) {
          setCurrentFactIndex(prev => prev + 1);
        } else {
          // All facts shown, close popup
          onComplete();
        }
        setIsAnimating(false);
      }, 300);
    }, 3000); // Show each fact for 3 seconds

    return () => clearTimeout(timer);
  }, [currentFactIndex, facts.length, isVisible, onComplete]);

  if (!isVisible || facts.length === 0) return null;

  const currentFact = facts[currentFactIndex];
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'warning': return 'from-red-500 to-orange-500';
      case 'positive': return 'from-green-500 to-emerald-500';
      case 'energy': return 'from-yellow-500 to-amber-500';
      case 'health': return 'from-blue-500 to-cyan-500';
      case 'processing': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'warning': return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30';
      case 'positive': return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30';
      case 'energy': return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30';
      case 'health': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30';
      case 'processing': return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/30';
      default: return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800/30';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Popup Container */}
        <div 
          className={`relative max-w-md w-full ${getCategoryBg(currentFact.category)} rounded-2xl border-2 shadow-2xl transform transition-all duration-500 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          } nutrition-fact-popup`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200 z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-2xl overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getCategoryColor(currentFact.category)} transition-all duration-300 ease-out`}
              style={{ width: `${((currentFactIndex + 1) / facts.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 pt-8">
            {/* Product Name */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pr-8">
              {productName}
            </h3>

            {/* Fact Card */}
            <div className="text-center space-y-4">
              {/* Icon */}
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${getCategoryColor(currentFact.category)} text-white mx-auto fact-icon-bounce`}>
                {currentFact.icon}
              </div>

              {/* Title */}
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentFact.title}
              </h4>

              {/* Value Display */}
              {currentFact.value && (
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentFact.value}
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-1">
                      {currentFact.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Fact Description */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {currentFact.fact}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center space-x-2 mt-6">
              {facts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentFactIndex 
                      ? `bg-gradient-to-r ${getCategoryColor(currentFact.category)}` 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Skip Button */}
            <button
              onClick={onComplete}
              className="w-full mt-4 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-200 text-sm"
            >
              Skip ({facts.length - currentFactIndex} remaining)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}