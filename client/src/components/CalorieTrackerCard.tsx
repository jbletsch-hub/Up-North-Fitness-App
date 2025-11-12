import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Utensils } from "lucide-react";
import { useState } from "react";

interface CalorieTrackerCardProps {
  hasLoggedToday?: boolean;
  onLogCalories?: (calories: number) => void;
  isPending?: boolean;
}

export function CalorieTrackerCard({ hasLoggedToday, onLogCalories, isPending }: CalorieTrackerCardProps) {
  const [calories, setCalories] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calorieValue = parseInt(calories);
    if (calorieValue > 0) {
      onLogCalories?.(calorieValue);
      setCalories("");
    }
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
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Track your daily calorie intake to stay accountable to your fitness goals.
          </p>
          {!hasLoggedToday && (
            <Input
              type="number"
              placeholder="Enter calories (e.g., 2000)"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              disabled={isPending}
              min="1"
              data-testid="input-calories"
            />
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={hasLoggedToday || isPending || !calories || parseInt(calories) <= 0}
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
        </form>
      </CardContent>
    </Card>
  );
}
