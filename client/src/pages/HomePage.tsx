import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { CrewGoalMeter } from "@/components/CrewGoalMeter";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();

  const { data: homeData } = useQuery({
    queryKey: ["/api/home"],
  });

  if (!homeData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-2xl">Loading...</div>
      </div>
    </div>;
  }

  const { leaderboard, activities, goal, total } = homeData as any;

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        username={user?.username}
        isAdmin={user?.isAdmin}
        userLevel={user?.level}
        userXP={user?.xp}
        userTitle={user?.title}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <CrewGoalMeter current={total} goal={goal} />

        <div className="grid md:grid-cols-2 gap-6">
          <LeaderboardCard users={leaderboard} />
          <ActivityFeed activities={activities} />
        </div>

        {user && (
          <div className="text-center py-8">
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
