import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target } from "lucide-react";
import { LiftingClubBadge } from "@/components/LiftingClubBadge";
import { getLiftingClubInfo } from "@/lib/liftingClubUtils";

interface LiftingClubProgressProps {
  squat: number;
  bench: number;
  deadlift: number;
}

export function LiftingClubProgress({ squat, bench, deadlift }: LiftingClubProgressProps) {
  const clubInfo = getLiftingClubInfo(squat, bench, deadlift);
  
  return (
    <Card className="border-card-border" data-testid="card-lifting-club">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          LIFTING CLUB STATUS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Lift Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-display text-primary" data-testid="text-total-lift">
            {clubInfo.totalLift.toLocaleString()} lbs
          </div>
          <div className="text-sm text-muted-foreground">Total Lift</div>
        </div>

        {/* Current Club Badge */}
        {clubInfo.currentClub && (
          <div className="flex justify-center">
            <LiftingClubBadge club={clubInfo.currentClub} tier={clubInfo.tier} size="lg" />
          </div>
        )}

        {/* Progress to Next Club */}
        {clubInfo.nextClub && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next Milestone</span>
              </div>
              <span className="font-semibold" data-testid="text-next-club">
                {clubInfo.nextClub} lbs
              </span>
            </div>
            
            <Progress value={clubInfo.progress} className="h-3" data-testid="progress-club" />
            
            <div className="text-center">
              <span className="text-lg font-medium" data-testid="text-lbs-to-next">
                {clubInfo.lbsToNext.toLocaleString()} lbs to {clubInfo.nextClub}lb Club!
              </span>
            </div>
          </div>
        )}

        {/* Reached Max */}
        {!clubInfo.nextClub && clubInfo.currentClub && (
          <div className="text-center py-2 text-muted-foreground">
            🏆 Maximum club achieved! You're a legend!
          </div>
        )}

        {/* Haven't reached any club yet */}
        {!clubInfo.currentClub && clubInfo.nextClub && (
          <div className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              You're on your way to the {clubInfo.nextClub}lb Club!
            </div>
            <Progress value={clubInfo.progress} className="h-3" data-testid="progress-club" />
            <div className="text-lg font-medium" data-testid="text-lbs-to-next">
              {clubInfo.lbsToNext.toLocaleString()} lbs to go!
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="pt-2 border-t border-border">
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold">{squat}</div>
              <div className="text-xs text-muted-foreground">Squat</div>
            </div>
            <div>
              <div className="font-semibold">{bench}</div>
              <div className="text-xs text-muted-foreground">Bench</div>
            </div>
            <div>
              <div className="font-semibold">{deadlift}</div>
              <div className="text-xs text-muted-foreground">Deadlift</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
