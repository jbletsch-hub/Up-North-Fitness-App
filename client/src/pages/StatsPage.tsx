import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, Flame, Scale, Utensils } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StatsPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl font-bold">Your Stats</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Track your progress and performance
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : (
          <>
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="font-display text-2xl md:text-3xl mb-1">
                    {(stats as any)?.totalXP?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="font-display text-2xl md:text-3xl mb-1">
                    {(stats as any)?.currentLevel || 1}
                  </div>
                  <p className="text-xs text-muted-foreground">Level</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <div className="font-display text-2xl md:text-3xl mb-1">
                    {(stats as any)?.currentStreak || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="font-display text-2xl md:text-3xl mb-1">
                    {(stats as any)?.totalActivities || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Activities</p>
                </CardContent>
              </Card>
            </div>

            {/* XP Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  XP Earned (Last 30 Days)
                </CardTitle>
                <CardDescription>Daily XP accumulation over time</CardDescription>
              </CardHeader>
              <CardContent>
                {(stats as any)?.xpTrend && (stats as any).xpTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(stats as any).xpTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                        labelFormatter={(label) => `Date: ${formatDate(label)}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="xp" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    No XP data yet. Start completing challenges to see your progress!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Current Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Current Weight
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.currentWeight ? (
                    <div className="text-center">
                      <div className="font-display text-4xl text-primary mb-2">
                        {(stats as any).currentWeight} <span className="text-2xl">lbs</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No weight recorded yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Latest Calorie Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.calories ? (
                    <div className="text-center">
                      <div className="font-display text-4xl text-primary mb-2">
                        {(stats as any).calories} <span className="text-2xl">cal</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No calories logged yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent PR History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Recent PR Updates
                </CardTitle>
                <CardDescription>Your latest personal record achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {(stats as any)?.prHistory && (stats as any).prHistory.length > 0 ? (
                  <div className="space-y-2">
                    {(stats as any).prHistory.map((activity: any, index: number) => (
                      <div
                        key={activity.id || index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.detail}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {activity.xpAwarded > 0 && (
                          <div className="text-sm font-semibold text-primary">
                            +{activity.xpAwarded} XP
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No PR updates yet. Update your lifts to see them here!
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
