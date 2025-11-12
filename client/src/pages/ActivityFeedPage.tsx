import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeedPage() {
  const { user } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activity-feed"],
  });

  const formatActivityDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pr":
        return "💪";
      case "challenge":
        return "🎯";
      case "goal":
        return "🏆";
      case "photo":
        return "📸";
      case "achievement":
        return "⭐";
      case "checkin":
        return "✅";
      case "weighin":
        return "⚖️";
      case "calories":
        return "🍽️";
      default:
        return "📝";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        username={user?.username}
        isAdmin={user?.isAdmin || false}
        userLevel={user?.level}
        userXP={user?.xp}
        userTitle={user?.title}
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl font-bold">Crew Feed</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            See what everyone's been up to
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : !activities || (activities as any[]).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No activity yet. Be the first!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(activities as any[]).map((activity: any) => (
              <Card 
                key={activity.id} 
                className="hover-elevate transition-all"
                data-testid={`activity-${activity.id}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0" aria-label="Activity icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-1">
                        <Link href={`/profile/${activity.username}`}>
                          <span className="font-semibold hover:text-primary cursor-pointer text-sm md:text-base">
                            {activity.username}
                          </span>
                        </Link>
                        {activity.xpAwarded > 0 && (
                          <span className="text-xs font-semibold text-primary">
                            +{activity.xpAwarded} XP
                          </span>
                        )}
                      </div>
                      <p className="text-sm md:text-base text-foreground mb-2">
                        {activity.detail}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatActivityDate(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
