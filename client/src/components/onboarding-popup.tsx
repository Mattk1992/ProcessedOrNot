import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Target, ChevronRight, X } from "lucide-react";

interface OnboardingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

export default function OnboardingPopup({ 
  isOpen, 
  onClose, 
  onContinue, 
  onSkip 
}: OnboardingPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Complete Your Profile
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            To provide you with the best personalized nutrition experience, we'd like to learn more about you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1">Personalized Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Get tailored nutrition insights based on your health goals, dietary preferences, and lifestyle.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            The profile setup takes just 3-5 minutes and helps us:
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Recommend the right nutrition targets for you
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Provide insights tailored to your health conditions
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Suggest foods that align with your preferences
            </li>
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onSkip}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Skip for Now
          </Button>
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto order-1 sm:order-2 flex items-center gap-2"
          >
            Continue Setup
            <ChevronRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}