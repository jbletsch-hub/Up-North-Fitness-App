import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Clock } from "lucide-react";
import { Link } from "wouter";
import type { User } from "../../../shared/schema";

interface WeeklyEarner extends User {
  weeklyXP: number;
}

interface MVMWinner {
  id: string;
  userId: string;
  weekStart: string;
  weeklyXP: number;
  awardedAt: Date;
  user: {
    username: string;
    displayName: string | null;
  };
}

export function WeeklyMVMCard() {
  const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery<WeeklyEarner[]>({
    queryKey: ["/api/mvm/leaderboard"],
  });

  const { data: winners, isLoading: loadingWinners } = useQuery<MVMWinner[]>({
    queryKey: ["/api/mvm/winners"],
  });

  const formatWeekDate = (weekStart: string) => {
    const date = new Date(weekStart);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <Card className="border-card-border" data-testid="card-weekly-mvm">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          WEEKLY MVM RACE
        </CardTitle>
        <CardDescription>
          Most Valuable Member - Weekly XP Champions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Week's Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg tracking-wider">THIS WEEK'S RACE</h3>
          </div>
          
          {loadingLeaderboard ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-hover hover-elevate"
                  data-testid={`mvm-rank-${index + 1}`}
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
                      <Link href={`/profile/${user.username}`}>
                        <p className="font-semibold hover:text-primary cursor-pointer">
                          {user.displayName || user.username}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground">{user.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg font-bold text-primary">
                      {user.weeklyXP.toLocaleString()} XP
                    </p>
                    <p className="text-xs text-muted-foreground">this week</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No activity this week yet. Be the first to earn XP!
            </div>
          )}
          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
            <Trophy className="h-4 w-4 inline mr-1" />
            Top earner wins the MVM badge on Monday!
          </div>
        </div>

        {/* Past Winners */}
        {winners && winners.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Trophy className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg tracking-wider">HALL OF FAME</h3>
            </div>
            <div className="space-y-2">
              {winners.slice(0, 5).map((winner, index) => (
                <div
                  key={winner.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-hover hover-elevate"
                  data-testid={`mvm-winner-${index + 1}`}
                >
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary" />
                    <div>
                      <Link href={`/profile/${winner.user.username}`}>
                        <p className="font-semibold hover:text-primary cursor-pointer">
                          {winner.user.displayName || winner.user.username}
                        </p>
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        Week of {formatWeekDate(winner.weekStart)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-primary">
                      {winner.weeklyXP.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
