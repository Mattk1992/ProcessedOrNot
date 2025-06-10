import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles } from "lucide-react";

interface FunFactsProps {
  facts: string[];
  productName?: string;
}

export default function FunFacts({ facts, productName }: FunFactsProps) {
  if (!facts || facts.length === 0) {
    return null;
  }

  return (
    <Card className="glass-card border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-md glow-effect">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">Fun Facts</span>
          <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
        </CardTitle>
        {productName && (
          <p className="text-sm text-muted-foreground">
            Interesting insights about {productName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {facts.map((fact, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 rounded-2xl bg-gradient-to-r from-background/50 to-muted/30 border border-border/30 hover:border-primary/30 transition-all duration-300 slide-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <Badge 
              variant="secondary" 
              className="flex-shrink-0 mt-1 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20"
            >
              {index + 1}
            </Badge>
            <p className="text-sm leading-relaxed text-foreground/90">
              {fact}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}