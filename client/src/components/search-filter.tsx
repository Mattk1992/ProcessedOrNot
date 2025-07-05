import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, X, Plus, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchFilters {
  includeBrands: string[];
  excludeBrands: string[];
}

interface SearchFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isVisible: boolean;
}

export default function SearchFilter({ filters, onFiltersChange, isVisible }: SearchFilterProps) {
  const { t } = useLanguage();
  const [includeInput, setIncludeInput] = useState("");
  const [excludeInput, setExcludeInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset expanded state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setIsExpanded(false);
    }
  }, [isVisible]);

  const addIncludeBrand = () => {
    if (includeInput.trim() && !filters.includeBrands.includes(includeInput.trim())) {
      onFiltersChange({
        ...filters,
        includeBrands: [...filters.includeBrands, includeInput.trim()]
      });
      setIncludeInput("");
    }
  };

  const addExcludeBrand = () => {
    if (excludeInput.trim() && !filters.excludeBrands.includes(excludeInput.trim())) {
      onFiltersChange({
        ...filters,
        excludeBrands: [...filters.excludeBrands, excludeInput.trim()]
      });
      setExcludeInput("");
    }
  };

  const removeIncludeBrand = (brand: string) => {
    onFiltersChange({
      ...filters,
      includeBrands: filters.includeBrands.filter(b => b !== brand)
    });
  };

  const removeExcludeBrand = (brand: string) => {
    onFiltersChange({
      ...filters,
      excludeBrands: filters.excludeBrands.filter(b => b !== brand)
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      includeBrands: [],
      excludeBrands: []
    });
  };

  const hasActiveFilters = filters.includeBrands.length > 0 || filters.excludeBrands.length > 0;

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30 border-2 border-border/20 shadow-lg mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Search Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {filters.includeBrands.length + filters.excludeBrands.length} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2"
            >
              {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-6">
            
            {/* Include Brands Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm text-foreground">Include Brands</h4>
                <Badge variant="outline" className="text-xs">
                  Show only these brands
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Spar, Jumbo, Albert Heijn"
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIncludeBrand()}
                  className="flex-1"
                />
                <Button
                  onClick={addIncludeBrand}
                  size="sm"
                  disabled={!includeInput.trim()}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {filters.includeBrands.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.includeBrands.map((brand) => (
                    <Badge
                      key={brand}
                      variant="secondary"
                      className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                    >
                      {brand}
                      <button
                        onClick={() => removeIncludeBrand(brand)}
                        className="ml-1 hover:text-green-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Exclude Brands Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm text-foreground">Exclude Brands</h4>
                <Badge variant="outline" className="text-xs">
                  Hide these brands
                </Badge>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Lidl, Aldi, Generic"
                  value={excludeInput}
                  onChange={(e) => setExcludeInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExcludeBrand()}
                  className="flex-1"
                />
                <Button
                  onClick={addExcludeBrand}
                  size="sm"
                  disabled={!excludeInput.trim()}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {filters.excludeBrands.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.excludeBrands.map((brand) => (
                    <Badge
                      key={brand}
                      variant="secondary"
                      className="flex items-center gap-1 bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                    >
                      {brand}
                      <button
                        onClick={() => removeExcludeBrand(brand)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <>
                <Separator />
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Active filters:</strong>
                    {filters.includeBrands.length > 0 && (
                      <span className="text-green-700">
                        {" "}Only showing products from: {filters.includeBrands.join(", ")}
                      </span>
                    )}
                    {filters.excludeBrands.length > 0 && (
                      <span className="text-red-700">
                        {filters.includeBrands.length > 0 ? " and" : ""} Excluding products from: {filters.excludeBrands.join(", ")}
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}