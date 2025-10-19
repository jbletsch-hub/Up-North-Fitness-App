import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface CrewGoalMeterProps {
  current: number;
  goal: number;
}

export function CrewGoalMeter({ current, goal }: CrewGoalMeterProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = current >= goal;

  return (
    <Card className="border-card-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-display tracking-wider">CREW GOAL</CardTitle>
        <Trophy className={`h-6 w-6 ${isComplete ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
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
