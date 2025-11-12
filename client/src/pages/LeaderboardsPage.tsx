import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Award, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { MVLBadge } from "@/components/MVLBadge";

export default function LeaderboardsPage() {
  const { user } = useAuth();

  const { data: homeData } = useQuery({
    queryKey: ["/api/home"],
  });

  const { data: prLeaderboards } = useQuery({
    queryKey: ["/api/leaderboards/prs"],
  });

  if (!homeData || !prLeaderboards) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  const { leaderboard } = homeData as any;
  const { bench, squat, deadlift } = prLeaderboards as any;

  const renderPRLeaderboard = (title: string, data: any[], unit: string = "lbs") => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>Top 3 Personal Records</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No records yet</p>
        ) : (
          <div className="space-y-3">
            {data.map((record: any, index: number) => (
              <div
                key={record.userId}
                className="flex items-center justify-between p-3 rounded-lg bg-card-hover"
                data-testid={`pr-${title.toLowerCase().split(' ')[0]}-${index + 1}`}
              >
                <div className="flex items-center gap-2 md:gap-3 flex-1">
                  <div
                    className={`font-display text-xl md:text-2xl ${
                      index === 0
                        ? "text-yellow-500"
                        : index === 1
                        ? "text-gray-400"
                        : "text-amber-600"
                    }`}
                  >
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                  </div>
                  <div className="flex-1">
                    <Link href={`/profile/${record.username}`}>
                      <p
                        className="font-semibold hover:text-primary cursor-pointer text-sm md:text-base"
                        data-testid={`text-username-${index + 1}`}
                      >
                        {record.displayName || record.username}
                      </p>
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-display text-base md:text-xl font-bold" data-testid={`text-value-${index + 1}`}>
                      {record.value} {unit}
                    </p>
                  </div>
                  <Link href={`/stats/${record.userId}`}>
                    <Button variant="ghost" size="icon" data-testid={`button-view-stats-${title.toLowerCase().split(' ')[0]}-${index + 1}`}>
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        username={user?.username}
        isAdmin={user?.isAdmin ?? undefined}
        userLevel={user?.level}
        userXP={user?.xp}
        userTitle={user?.title}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <h1 className="font-display text-3xl md:text-5xl font-bold">Leaderboards</h1>
          <p className="text-sm md:text-base text-muted-foreground">See who's leading the pack</p>
        </div>

        {/* XP Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              XP Leaderboard
            </CardTitle>
            <CardDescription>Top performers by total experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((u: any, index: number) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card-hover"
                  data-testid={`leaderboard-xp-${index + 1}`}
                >
                  <div className="flex items-center gap-2 md:gap-3 flex-1">
                    <div className="font-display text-base md:text-xl font-bold text-muted-foreground w-6 md:w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${u.username}`}>
                          <p
                            className="font-semibold hover:text-primary cursor-pointer"
                            data-testid={`text-username-${index + 1}`}
                          >
                            {u.displayName || u.username}
                          </p>
                        </Link>
                        <MVLBadge mvlWins={u.mvlWins} size="sm" />
                      </div>
                      <p className="text-sm text-muted-foreground">{u.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-right">
                      <p className="font-display text-base md:text-xl font-bold" data-testid={`text-xp-${index + 1}`}>
                        {u.xp.toLocaleString()} XP
                      </p>
                      <p className="text-sm text-muted-foreground">Level {u.level}</p>
                    </div>
                    <Link href={`/stats/${u.id}`}>
                      <Button variant="ghost" size="icon" data-testid={`button-view-stats-${index + 1}`}>
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PR Leaderboards */}
        <div className="grid md:grid-cols-3 gap-6">
          {renderPRLeaderboard("Bench Press", bench)}
          {renderPRLeaderboard("Squat", squat)}
          {renderPRLeaderboard("Deadlift", deadlift)}
        </div>
      </main>
    </div>
  );
}
