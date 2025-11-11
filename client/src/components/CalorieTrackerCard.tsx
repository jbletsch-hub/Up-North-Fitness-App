import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

interface CalorieTrackerCardProps {
  hasLoggedToday?: boolean;
  onLogCalories?: (event: React.FormEvent) => void;
  isPending?: boolean;
}

export function CalorieTrackerCard({ hasLoggedToday, onLogCalories, isPending }: CalorieTrackerCardProps) {
  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    onLogCalories?.(e);
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Utensils className="h-5 w-5 text-primary" />
          CALORIE LOG
        </CardTitle>
        <p className="text-sm text-muted-foreground">+15 XP once per day</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Track your daily calorie intake to stay accountable to your fitness goals.
          </p>
          <Button
            onClick={handleClick}
            className="w-full"
            disabled={hasLoggedToday || isPending}
            data-testid="button-log-calories"
          >
            {isPending
              ? "Logging..."
              : hasLoggedToday
              ? "Logged Today ✓"
              : "Log Calories"}
          </Button>
          {hasLoggedToday && (
            <p className="text-xs text-center text-muted-foreground">
              You've already logged your calories today!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
