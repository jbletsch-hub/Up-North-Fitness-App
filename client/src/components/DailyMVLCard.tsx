import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame } from "lucide-react";
import { Link } from "wouter";
import type { User } from "../../../shared/schema";

export function DailyMVLCard() {
  const { data: leaderboard, isLoading } = useQuery<User[]>({
    queryKey: ["/api/leaderboards/mvl"],
  });

  if (isLoading) {
    return (
      <Card className="border-card-border" data-testid="card-daily-mvl">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            TODAY'S MVL RACE
          </CardTitle>
          <CardDescription>Most Valuable Lifter - Daily XP Leaders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="border-card-border" data-testid="card-daily-mvl">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            TODAY'S MVL RACE
          </CardTitle>
          <CardDescription>Most Valuable Lifter - Daily XP Leaders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No activity today. Be the first to earn XP!
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out users with 0 daily XP
  const activeUsers = leaderboard.filter(user => user.dailyXp > 0);

  if (activeUsers.length === 0) {
    return (
      <Card className="border-card-border" data-testid="card-daily-mvl">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            TODAY'S MVL RACE
          </CardTitle>
          <CardDescription>Most Valuable Lifter - Daily XP Leaders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            No activity today. Be the first to earn XP!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border" data-testid="card-daily-mvl">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          TODAY'S MVL RACE
        </CardTitle>
        <CardDescription>Most Valuable Lifter - Daily XP Leaders</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeUsers.slice(0, 5).map((user, index) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg bg-card-hover hover-elevate"
            data-testid={`mvl-rank-${index + 1}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`font-display text-xl ${
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
                  <p className="font-semibold hover:text-primary cursor-pointer" data-testid={`mvl-username-${index + 1}`}>
                    {user.displayName || user.username}
                  </p>
                </Link>
                <p className="text-xs text-muted-foreground">{user.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-bold text-primary" data-testid={`mvl-daily-xp-${index + 1}`}>
                {user.dailyXp.toLocaleString()} XP
              </p>
              <p className="text-xs text-muted-foreground">today</p>
            </div>
          </div>
        ))}
        {activeUsers.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No one has earned XP today yet. Be the first!
          </div>
        )}
        <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border">
          <Trophy className="h-4 w-4 inline mr-1" />
          Top earner wins the MVL badge at midnight!
        </div>
      </CardContent>
    </Card>
  );
}
