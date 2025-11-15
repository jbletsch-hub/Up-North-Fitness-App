import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

interface CheckInCardProps {
  streak: number;
  hasCheckedInToday: boolean;
  onCheckIn?: (event: React.MouseEvent) => void;
}

export function CheckInCard({ streak, hasCheckedInToday, onCheckIn }: CheckInCardProps) {
  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider">CHECK-IN</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <div className="font-display text-3xl">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </div>
        </div>
        <Button
          className="w-full"
          onClick={onCheckIn}
          disabled={hasCheckedInToday}
          data-testid="button-checkin"
        >
          {hasCheckedInToday ? "Checked In Today!" : "Check In (+15 XP)"}
        </Button>
      </CardContent>
    </Card>
  );
}
