import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Calendar } from "lucide-react";
import { useParams } from "wouter";

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const username = params.username || "";

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/profile", username],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
  });

  if (isLoading || !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  const { user: profileUser, pr, photos, activities } = profileData;

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={!!user}
        username={user?.username}
        isAdmin={user?.isAdmin || false}
        userLevel={user?.level}
        userXP={user?.xp}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Profile Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl tracking-wider" data-testid="text-profile-username">
              {profileUser.username?.toUpperCase()}
            </h1>
            {profileUser.isAdmin && (
              <Badge variant="default" className="text-xs">ADMIN</Badge>
            )}
          </div>
          <p className="text-muted-foreground" data-testid="text-profile-stats">
            Level {profileUser.level} · {profileUser.title} · {profileUser.xp.toLocaleString()} XP
          </p>
          {profileUser.streakCount > 0 && (
            <p className="text-primary font-semibold">
              🔥 {profileUser.streakCount} day streak
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Personal Records */}
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                PERSONAL RECORDS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Squat:</span>
                <span className="font-semibold">{pr.squat || 0} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bench:</span>
                <span className="font-semibold">{pr.bench || 0} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deadlift:</span>
                <span className="font-semibold">{pr.deadlift || 0} lbs</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold text-primary">
                  {(pr.squat || 0) + (pr.bench || 0) + (pr.deadlift || 0)} lbs
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-2" />
                STATS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Check-in Streak:</span>
                <span className="font-semibold">{profileUser.streakCount} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Weight:</span>
                <span className="font-semibold">{profileUser.weight || "—"} lbs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress Photos:</span>
                <span className="font-semibold">{photos.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
                <Calendar className="h-5 w-5 text-chart-3" />
                RECENT ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                activities.slice(0, 10).map((activity: any) => (
                  <div key={activity.id} className="text-sm border-b border-border pb-2 last:border-0">
                    <p className="font-medium">{activity.activityDetail}</p>
                    <p className="text-xs text-muted-foreground">
                      +{activity.xpAwarded} XP · {activity.createdAt}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Photos */}
        {photos.length > 0 && (
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-display tracking-wider">
                PROGRESS PHOTOS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo: any) => (
                  <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={photo.imagePath}
                      alt="Progress"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
