import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, Calendar, Target, Check } from "lucide-react";
import { useParams } from "wouter";

export default function ProfilePage() {
  const { user } = useAuth();
  const params = useParams();
  const username = params.username || "";

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ["/api/profile", username],
    queryFn: async () => {
      const response = await fetch(`/api/profile/${username}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch profile" }));
        throw new Error(errorData.message || "Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!username,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-2xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation
          isLoggedIn={!!user}
          username={user?.username}
          isAdmin={user?.isAdmin || false}
          userLevel={user?.level}
          userXP={user?.xp}
        />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Card className="border-card-border">
            <CardContent className="py-12 text-center">
              <p className="text-xl font-display mb-2">User Not Found</p>
              <p className="text-muted-foreground">
                {(error as Error).message || "The profile you're looking for doesn't exist."}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const { user: profileUser, pr, photos, activities, challenges = [], weeklyGoals = [], lifetimeGoals = [] } = profileData;

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

        {/* Daily Challenges */}
        {challenges.length > 0 && (
          <Card className="border-card-border">
            <CardHeader>
              <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                DAILY CHALLENGES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {challenges.map((challenge: any) => (
                  <div
                    key={challenge.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border border-border ${
                      challenge.completed ? "opacity-60" : ""
                    }`}
                  >
                    {challenge.completed ? (
                      <Check className="h-5 w-5 text-chart-3 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                    )}
                    <span className={challenge.completed ? "line-through text-muted-foreground" : ""}>
                      {challenge.text}
                    </span>
                    {challenge.completed && (
                      <Badge className="ml-auto bg-chart-3 text-white border-0">✓</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Goals Section */}
        {(weeklyGoals.length > 0 || lifetimeGoals.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Weekly Goals */}
            {weeklyGoals.length > 0 && (
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
                    <Target className="h-5 w-5 text-chart-2" />
                    WEEKLY GOALS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {weeklyGoals.filter((g: any) => !g.completed).map((goal: any) => {
                    const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-muted-foreground text-sm">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                  {weeklyGoals.filter((g: any) => g.completed).length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Completed</p>
                      {weeklyGoals.filter((g: any) => g.completed).map((goal: any) => (
                        <div key={goal.id} className="flex justify-between items-center py-2 opacity-60">
                          <span className="text-sm line-through">{goal.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {goal.targetValue} {goal.unit} ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lifetime Goals */}
            {lifetimeGoals.length > 0 && (
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    LIFETIME GOALS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lifetimeGoals.filter((g: any) => !g.completed).map((goal: any) => {
                    const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-muted-foreground text-sm">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                  {lifetimeGoals.filter((g: any) => g.completed).length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Completed</p>
                      {lifetimeGoals.filter((g: any) => g.completed).map((goal: any) => (
                        <div key={goal.id} className="flex justify-between items-center py-2 opacity-60">
                          <span className="text-sm line-through">{goal.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {goal.targetValue} {goal.unit} ✓
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
