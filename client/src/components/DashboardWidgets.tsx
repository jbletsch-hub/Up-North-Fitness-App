import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Flame, Target, Trophy, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";

// Today's XP Widget - Shows daily XP breakdown
export function TodayXPWidget({ dailyXp }: { dailyXp: number }) {
  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display tracking-wider flex items-center gap-2">
          <Star className="h-4 w-4 text-chart-3" fill="currentColor" />
          TODAY'S XP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold text-primary">
              {dailyXp.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">XP earned</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Daily activities reset at midnight CT
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// MVL Countdown Widget - Shows current leader and time remaining
export function MVLCountdownWidget({ currentUserId }: { currentUserId: string }) {
  const [timeRemaining, setTimeRemaining] = useState("");

  const { data: leaderboard } = useQuery<any[]>({
    queryKey: ["/api/leaderboards/mvl"],
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
      
      const midnight = new Date(centralTime);
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight.getTime() - centralTime.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeUsers = leaderboard?.filter(u => u.dailyXp > 0) || [];
  const leader = activeUsers[0];
  const userRank = activeUsers.findIndex(u => u.id === currentUserId);
  const userPosition = userRank >= 0 ? userRank + 1 : null;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display tracking-wider flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          MVL RACE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leader ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Current Leader</p>
                  <Link href={`/profile/${leader.username}`}>
                    <p className="font-semibold hover:text-primary cursor-pointer truncate">
                      {leader.displayName || leader.username}
                    </p>
                  </Link>
                  <Badge variant="outline" className="mt-1">
                    <Trophy className="h-3 w-3 mr-1" />
                    {leader.dailyXp.toLocaleString()} XP
                  </Badge>
                </div>
              </div>
              
              {userPosition && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    You're in <span className="font-semibold text-foreground">#{userPosition}</span> place
                  </p>
                </div>
              )}
              
              <div className="pt-2 border-t border-border flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Ends in <span className="font-mono font-semibold text-foreground">{timeRemaining}</span>
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No activity today. Be the first!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Active Challenge Status Widget - Shows daily challenges progress
export function ActiveChallengeWidget({ challenges }: { challenges: any[] }) {
  const completed = challenges.filter(c => c.completed).length;
  const total = challenges.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const allComplete = completed === total;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display tracking-wider flex items-center gap-2">
          <Target className="h-4 w-4 text-chart-2" />
          DAILY CHALLENGES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold">
                {completed}/{total}
              </span>
              <span className="text-sm text-muted-foreground">complete</span>
            </div>
            {allComplete && (
              <Badge className="bg-chart-3 text-white border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Done!
              </Badge>
            )}
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {!allComplete && (
            <p className="text-xs text-muted-foreground">
              {total - completed} challenge{total - completed !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
