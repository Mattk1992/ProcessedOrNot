import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Leaf, 
  Wheat, 
  Milk, 
  Egg, 
  Fish, 
  Nut, 
  Beef, 
  Cherry,
  Sparkles,
  X
} from "lucide-react";

export interface DietaryRestriction {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface DietaryFilterProps {
  onFiltersChange: (restrictions: string[]) => void;
  className?: string;
}

export default function DietaryFilter({ onFiltersChange, className = "" }: DietaryFilterProps) {
  const { t } = useLanguage();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bounceFilter, setBounceFilter] = useState<string | null>(null);

  const dietaryRestrictions: DietaryRestriction[] = [
    {
      id: "vegetarian",
      name: t("dietary.vegetarian"),
      icon: <Leaf className="w-4 h-4" />,
      color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700",
      description: t("dietary.vegetarian_desc")
    },
    {
      id: "vegan",
      name: t("dietary.vegan"),
      icon: <Sparkles className="w-4 h-4" />,
      color: "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
      description: t("dietary.vegan_desc")
    },
    {
      id: "gluten_free",
      name: t("dietary.gluten_free"),
      icon: <Wheat className="w-4 h-4" />,
      color: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700",
      description: t("dietary.gluten_free_desc")
    },
    {
      id: "dairy_free",
      name: t("dietary.dairy_free"),
      icon: <Milk className="w-4 h-4" />,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
      description: t("dietary.dairy_free_desc")
    },
    {
      id: "egg_free",
      name: t("dietary.egg_free"),
      icon: <Egg className="w-4 h-4" />,
      color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700",
      description: t("dietary.egg_free_desc")
    },
    {
      id: "fish_free",
      name: t("dietary.fish_free"),
      icon: <Fish className="w-4 h-4" />,
      color: "bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 border-cyan-300 dark:border-cyan-700",
      description: t("dietary.fish_free_desc")
    },
    {
      id: "nut_free",
      name: t("dietary.nut_free"),
      icon: <Nut className="w-4 h-4" />,
      color: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700",
      description: t("dietary.nut_free_desc")
    },
    {
      id: "halal",
      name: t("dietary.halal"),
      icon: <Beef className="w-4 h-4" />,
      color: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700",
      description: t("dietary.halal_desc")
    },
    {
      id: "kosher",
      name: t("dietary.kosher"),
      icon: <Cherry className="w-4 h-4" />,
      color: "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-300 dark:border-pink-700",
      description: t("dietary.kosher_desc")
    }
  ];

  const toggleFilter = (restrictionId: string) => {
    const newFilters = selectedFilters.includes(restrictionId)
      ? selectedFilters.filter(id => id !== restrictionId)
      : [...selectedFilters, restrictionId];
    
    setSelectedFilters(newFilters);
    onFiltersChange(newFilters);
    
    // Add bounce animation
    setBounceFilter(restrictionId);
    setTimeout(() => setBounceFilter(null), 300);
  };

  const clearAllFilters = () => {
    setSelectedFilters([]);
    onFiltersChange([]);
  };

  const visibleRestrictions = isExpanded ? dietaryRestrictions : dietaryRestrictions.slice(0, 4);

  return (
    <Card className={`dietary-filter-card ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("dietary.filter_title")}
          </h3>
          {selectedFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-3 h-3 mr-1" />
              {t("dietary.clear_all")}
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {visibleRestrictions.map((restriction) => {
            const isSelected = selectedFilters.includes(restriction.id);
            return (
              <button
                key={restriction.id}
                className={`
                  inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 
                  cursor-pointer hover:scale-105 active:scale-95 border transform
                  ${bounceFilter === restriction.id ? 'animate-bounce' : ''}
                  ${isSelected 
                    ? restriction.color + " shadow-lg shadow-current/20" 
                    : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                  }
                `}
                onClick={() => toggleFilter(restriction.id)}
              >
                <span className="mr-1.5">{restriction.icon}</span>
                {restriction.name}
              </button>
            );
          })}
        </div>

        {dietaryRestrictions.length > 4 && (
          <>
            <Separator className="my-3" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full h-8 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {isExpanded ? t("dietary.show_less") : t("dietary.show_more")}
            </Button>
          </>
        )}

        {selectedFilters.length > 0 && (
          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t("dietary.active_filters")}: {selectedFilters.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}