import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, RefreshCw } from "lucide-react";

interface CrewGoalMeterProps {
  current: number;
  goal: number;
  isAdmin?: boolean;
  onReset?: () => void;
}

export function CrewGoalMeter({ current, goal, isAdmin, onReset }: CrewGoalMeterProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <Card className="border-card-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-2xl font-display tracking-wider">CREW GOAL</CardTitle>
        <div className="flex items-center gap-2">
          <Trophy className={`h-6 w-6 ${isComplete ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          {isAdmin && onReset && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              data-testid="button-reset-crew-goal"
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Set Next Goal
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-to-r from-primary to-chart-2 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-display text-3xl text-foreground">{current.toLocaleString()}</span>
            <span className="ml-2">lbs lifted</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Goal: <span className="font-display text-xl text-foreground">{goal.toLocaleString()}</span> lbs
          </div>
        </div>
        {isComplete && (
          <p className="text-sm text-center text-primary font-semibold">
            🎉 Goal achieved! The crew is unstoppable!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
