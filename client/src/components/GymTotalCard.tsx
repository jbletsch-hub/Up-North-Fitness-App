import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface GymTotalCardProps {
  total: number;
}

export function GymTotalCard({ total }: GymTotalCardProps) {
  return (
    <Card className="border-card-border">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-2xl font-display tracking-wider">GYM COMBINED TOTAL</CardTitle>
        <Trophy className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Collective Strength of the Entire Gym
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-display text-5xl text-foreground">{total.toLocaleString()}</span>
            <span className="ml-2 text-lg">lbs combined</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total of all members' squat + bench + deadlift PRs
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
