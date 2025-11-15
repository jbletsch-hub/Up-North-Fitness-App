import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Activity, Target, Dumbbell, Medal } from "lucide-react";
import { Link } from "wouter";

interface CrewStanding {
  crewId: string;
  crewName: string;
}

interface CheckInStanding extends CrewStanding {
  checkInCount: number;
  memberCount: number;
}

interface XPStanding extends CrewStanding {
  totalXP: number;
  memberCount: number;
}

interface ChallengeStanding extends CrewStanding {
  completionRate: number;
  completedCount: number;
  memberCount: number;
}

interface LiftStanding extends CrewStanding {
  totalLifts: number;
  avgLifts: number;
  memberCount: number;
}

function CompetitionSection({ 
  title, 
  description, 
  icon: Icon, 
  standings, 
  renderValue 
}: { 
  title: string;
  description: string;
  icon: React.ElementType;
  standings: any[];
  renderValue: (standing: any, rank: number) => { primary: string; secondary: string };
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg tracking-wider">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      
      {standings && standings.length > 0 ? (
        <div className="space-y-2">
          {standings.slice(0, 5).map((standing, index) => {
            const values = renderValue(standing, index);
            return (
              <div
                key={standing.crewId}
                className="flex items-center justify-between p-3 rounded-lg bg-card-hover hover-elevate"
                data-testid={`crew-rank-${index + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`font-display text-lg ${
                      index === 0
                        ? "text-yellow-500"
                        : index === 1
                        ? "text-gray-400"
                        : index === 2
                        ? "text-amber-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </div>
                  <div>
                    <Link href={`/crews/${standing.crewId}`}>
                      <p className="font-semibold hover:text-primary cursor-pointer">
                        {standing.crewName}
                      </p>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {standing.memberCount} {standing.memberCount === 1 ? 'member' : 'members'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-primary">
                    {values.primary}
                  </p>
                  <p className="text-xs text-muted-foreground">{values.secondary}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No crew data yet. Start competing!
        </div>
      )}
    </div>
  );
}

export function CrewCompetitionsCard() {
  const { data: checkIns } = useQuery<CheckInStanding[]>({
    queryKey: ["/api/crew-competitions/check-ins"],
  });

  const { data: xpWar } = useQuery<XPStanding[]>({
    queryKey: ["/api/crew-competitions/xp"],
  });

  const { data: challenges } = useQuery<ChallengeStanding[]>({
    queryKey: ["/api/crew-competitions/challenges"],
  });

  const { data: lifts } = useQuery<LiftStanding[]>({
    queryKey: ["/api/crew-competitions/lifts"],
  });

  return (
    <Card className="border-card-border" data-testid="card-crew-competitions">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          CREW VS CREW BATTLES
        </CardTitle>
        <CardDescription>
          Compete against other crews across multiple categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <CompetitionSection
          title="WEEKLY CHECK-IN BATTLE"
          description="Total crew check-ins this week"
          icon={Activity}
          standings={checkIns || []}
          renderValue={(s: CheckInStanding) => ({
            primary: s.checkInCount.toString(),
            secondary: "check-ins"
          })}
        />

        <CompetitionSection
          title="MONTHLY XP WAR"
          description="Total crew XP earned this month"
          icon={Medal}
          standings={xpWar || []}
          renderValue={(s: XPStanding) => ({
            primary: s.totalXP.toLocaleString(),
            secondary: "total XP"
          })}
        />

        <CompetitionSection
          title="CHALLENGE COMPLETION %"
          description="Percentage of crew members who completed challenges this week"
          icon={Target}
          standings={challenges || []}
          renderValue={(s: ChallengeStanding) => ({
            primary: `${s.completionRate.toFixed(0)}%`,
            secondary: `${s.completedCount}/${s.memberCount} completed`
          })}
        />

        <CompetitionSection
          title="TOTAL LIFT SHOWDOWN"
          description="Combined squat + bench + deadlift totals"
          icon={Dumbbell}
          standings={lifts || []}
          renderValue={(s: LiftStanding) => ({
            primary: `${s.totalLifts.toLocaleString()} lbs`,
            secondary: `${s.avgLifts.toLocaleString()} avg`
          })}
        />
      </CardContent>
    </Card>
  );
}
