import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Gift, ExternalLink, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RewardModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentCount: number;
  maxCount: number;
  rewardUrl: string;
  onOpenRewardUrl: () => void;
  isResetting?: boolean;
}

export default function RewardModal({
  isOpen,
  onOpenChange,
  currentCount,
  maxCount,
  rewardUrl,
  onOpenRewardUrl,
  isResetting = false
}: RewardModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Reward Required
          </DialogTitle>
          <DialogDescription>
            You've completed {currentCount} searches! To continue, please visit our reward page.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              After visiting the reward page, you can continue with unlimited searches until your next {maxCount} searches.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Search count: {currentCount}/{maxCount}
            </p>
            
            <Button 
              onClick={onOpenRewardUrl}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              disabled={isResetting}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {isResetting ? "Processing..." : "Visit Reward Page"}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              The reward page will open in a new tab. After visiting, you can close this dialog.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}