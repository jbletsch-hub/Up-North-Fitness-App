import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";
import { LiftingClubBadge } from "@/components/LiftingClubBadge";
import { getLiftingClubInfo } from "@/lib/liftingClubUtils";

interface LiftingClubWidgetProps {
  squat: number;
  bench: number;
  deadlift: number;
}

export function LiftingClubWidget({ squat, bench, deadlift }: LiftingClubWidgetProps) {
  const clubInfo = getLiftingClubInfo(squat, bench, deadlift);
  
  return (
    <Card className="border-card-border" data-testid="card-lifting-club-widget">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display tracking-wider flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          LIFTING CLUB
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Total and Badge */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-display text-primary">
              {clubInfo.totalLift.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Lift</div>
          </div>
          {clubInfo.currentClub && (
            <LiftingClubBadge club={clubInfo.currentClub} tier={clubInfo.tier} size="sm" />
          )}
        </div>

        {/* Progress to next */}
        {clubInfo.nextClub && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Next: {clubInfo.nextClub}lb</span>
              <span>{clubInfo.lbsToNext} lbs</span>
            </div>
            <Progress value={clubInfo.progress} className="h-2" />
          </div>
        )}

        {/* Maxed out */}
        {!clubInfo.nextClub && clubInfo.currentClub && (
          <div className="text-xs text-center text-muted-foreground">
            🏆 Maximum level!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
