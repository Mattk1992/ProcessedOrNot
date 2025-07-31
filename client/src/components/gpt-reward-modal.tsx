import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GPTRewardModalProps {
  isVisible: boolean;
  onClose: () => void;
  adDuration?: number;
}

export function GPTRewardModal({ isVisible, onClose, adDuration = 5000 }: GPTRewardModalProps) {
  const [countdown, setCountdown] = useState(Math.floor(adDuration / 1000));
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setCountdown(Math.floor(adDuration / 1000));
      setIsCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsCompleted(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      setIsCompleted(true);
      setTimeout(onClose, 1000);
    }, adDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isVisible, adDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto border-2 border-primary/20 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              {isCompleted ? (
                <Gift className="w-8 h-8 text-white animate-pulse" />
              ) : (
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-foreground">
              {isCompleted ? "Thank You!" : "Loading Reward Ad"}
            </h3>
            <p className="text-muted-foreground">
              {isCompleted 
                ? "You can now continue using the camera scanner" 
                : "Please wait while we show a quick ad to support the app"
              }
            </p>
          </div>

          {!isCompleted && (
            <div className="space-y-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-primary/60 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((Math.floor(adDuration / 1000) - countdown) / Math.floor(adDuration / 1000)) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {countdown} seconds remaining
              </p>
            </div>
          )}

          {isCompleted && (
            <Button onClick={onClose} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}

          <div id="gpt-reward-ad-display" className="min-h-[100px] bg-muted/30 rounded-lg flex items-center justify-center">
            {!isCompleted ? (
              <p className="text-xs text-muted-foreground">Ad space</p>
            ) : (
              <p className="text-xs text-muted-foreground">Ad completed</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GPTRewardModal;