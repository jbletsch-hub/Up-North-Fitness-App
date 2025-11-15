import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Award } from "lucide-react";

interface StreakMilestonesProps {
  currentStreak: number;
}

const MILESTONES = [
  { days: 7, name: "Week Warrior", color: "bg-blue-500", unlocked: false },
  { days: 30, name: "Monthly Master", color: "bg-purple-500", unlocked: false },
  { days: 100, name: "Century Crusher", color: "bg-yellow-500", unlocked: false },
  { days: 365, name: "Yearly Legend", color: "bg-red-500", unlocked: false },
];

export function StreakMilestones({ currentStreak }: StreakMilestonesProps) {
  const milestones = MILESTONES.map(m => ({
    ...m,
    unlocked: currentStreak >= m.days
  }));

  const nextMilestone = milestones.find(m => !m.unlocked);
  const daysUntilNext = nextMilestone ? nextMilestone.days - currentStreak : 0;

  return (
    <Card data-testid="card-streak-milestones">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Streak Milestones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Milestone badges grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {milestones.map((milestone) => (
              <div
                key={milestone.days}
                className={`
                  relative rounded-lg border p-4 text-center transition-all
                  ${milestone.unlocked 
                    ? `${milestone.color} text-white shadow-lg` 
                    : 'bg-muted/30 text-muted-foreground'
                  }
                `}
                data-testid={`milestone-${milestone.days}-${milestone.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Flame className={`h-6 w-6 ${milestone.unlocked ? '' : 'opacity-30'}`} />
                  <div className="text-xs font-semibold">{milestone.name}</div>
                  <div className="text-lg font-bold">{milestone.days}</div>
                  {milestone.unlocked && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Unlocked!
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress to next milestone */}
          {nextMilestone && (
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <div className="text-sm text-muted-foreground">
                Next milestone: <span className="font-semibold text-foreground">{nextMilestone.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''} to go!
              </div>
            </div>
          )}

          {currentStreak >= 365 && (
            <div className="text-center p-4 rounded-lg bg-gradient-to-r from-yellow-500/20 to-red-500/20">
              <div className="text-sm font-semibold">
                🏆 All milestones unlocked! You're a true legend!
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
