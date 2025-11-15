import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useParams, Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Target, Flame, Scale, Utensils, Trophy, CheckCircle, Users, Calendar, UserPlus, Shield } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { MVLBadge } from "@/components/MVLBadge";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StreakCalendar } from "@/components/StreakCalendar";
import { StreakMilestones } from "@/components/StreakMilestones";
import { PRComparison } from "@/components/PRComparison";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StatsPage() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCrewId, setSelectedCrewId] = useState<string>("");

  // Use the userId from params, or the logged-in user's id
  const targetUserId = userId || user?.id;

  // Determine if viewing own stats or someone else's
  const isOwnStats = !userId || userId === user?.id;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats", targetUserId],
    enabled: !!targetUserId,
  });

  // Fetch all users for browsing
  const { data: allUsers } = useQuery({
    queryKey: ["/api/users"],
  });

  // Fetch all crews (for admin assignment)
  const { data: allCrews } = useQuery({
    queryKey: ["/api/crews"],
    enabled: !!user?.isAdmin && !isOwnStats,
  });

  // Fetch user's crew to check if they're a leader
  const { data: userCrew } = useQuery({
    queryKey: ["/api/crews/my-crew"],
    enabled: !!user && !isOwnStats,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const displayName = (stats as any)?.displayName || (stats as any)?.username || "User";

  // Check if user is a leader of their crew
  const isCrewLeader = userCrew && (userCrew as any).role === "leader";

  // Invite to crew mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ crewId, targetUserId }: { crewId: string; targetUserId: string }) => {
      return await apiRequest("POST", `/api/crews/${crewId}/invite`, { targetUserId });
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent!",
        description: `Invited ${displayName} to your crew.`,
      });
      setInviteDialogOpen(false);
      setSelectedCrewId("");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Admin assign to crew mutation
  const assignMutation = useMutation({
    mutationFn: async ({ crewId, targetUserId }: { crewId: string; targetUserId: string }) => {
      return await apiRequest("POST", "/api/admin/assign-to-crew", { crewId, targetUserId });
    },
    onSuccess: () => {
      toast({
        title: "User assigned!",
        description: `Assigned ${displayName} to the crew.`,
      });
      setAssignDialogOpen(false);
      setSelectedCrewId("");
      queryClient.invalidateQueries({ queryKey: ["/api/stats", targetUserId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to assign user",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInvite = () => {
    if (userCrew && targetUserId) {
      inviteMutation.mutate({ crewId: (userCrew as any).crewId, targetUserId });
    }
  };

  const handleAssign = () => {
    if (selectedCrewId && targetUserId) {
      assignMutation.mutate({ crewId: selectedCrewId, targetUserId });
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

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl font-bold">
              {isOwnStats ? "Your Stats" : `${displayName}'s Stats`}
            </h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            {isOwnStats ? "Track your progress and performance" : `View ${displayName}'s fitness journey`}
          </p>
        </div>

        {/* Crew Actions - Show when viewing someone else's profile */}
        {!isOwnStats && user && (
          <div className="flex flex-wrap gap-2 justify-center">
            {/* Crew Leader Invitation */}
            {isCrewLeader && (
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="default" data-testid="button-invite-to-crew">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite to Crew
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite {displayName} to {(userCrew as any)?.crew?.name}</DialogTitle>
                    <DialogDescription>
                      Send an invitation for this user to join your crew.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      {displayName} will receive an invitation to join <span className="font-semibold">{(userCrew as any)?.crew?.name}</span>. They can accept or decline the invitation.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setInviteDialogOpen(false)}
                      data-testid="button-cancel-invite"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInvite} 
                      disabled={inviteMutation.isPending}
                      data-testid="button-send-invite"
                    >
                      {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Admin Assignment */}
            {user.isAdmin && allCrews && (
              <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="default" data-testid="button-admin-assign">
                    <Shield className="h-4 w-4 mr-2" />
                    Assign to Crew (Admin)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign {displayName} to Crew</DialogTitle>
                    <DialogDescription>
                      Directly assign this user to a crew (bypasses invitation).
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Select value={selectedCrewId} onValueChange={setSelectedCrewId}>
                      <SelectTrigger data-testid="select-admin-crew">
                        <SelectValue placeholder="Select a crew" />
                      </SelectTrigger>
                      <SelectContent>
                        {(allCrews as any[]).map((crew: any) => (
                          <SelectItem key={crew.id} value={crew.id}>
                            {crew.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setAssignDialogOpen(false)}
                      data-testid="button-cancel-assign"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAssign} 
                      disabled={!selectedCrewId || assignMutation.isPending}
                      data-testid="button-confirm-assign"
                    >
                      {assignMutation.isPending ? "Assigning..." : "Assign to Crew"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : (
          <>
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
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
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <div className="font-display text-2xl md:text-3xl mb-1">
                    {(stats as any)?.mvlWins || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">MVL Wins</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="font-display text-2xl md:text-3xl mb-1">
                    {(stats as any)?.completedGoals || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Goals Done</p>
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

            {/* Streak Calendar */}
            {(stats as any)?.checkinHistory && (
              <StreakCalendar 
                checkinDates={(stats as any).checkinHistory} 
                currentStreak={(stats as any)?.currentStreak || 0}
              />
            )}

            {/* Streak Milestones */}
            <StreakMilestones currentStreak={(stats as any)?.currentStreak || 0} />

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

            {/* PR Progression Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  PR Progression
                </CardTitle>
                <CardDescription>Your strength gains over time</CardDescription>
              </CardHeader>
              <CardContent>
                {(stats as any)?.prProgression && (stats as any).prProgression.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(stats as any).prProgression}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        className="text-xs"
                      />
                      <YAxis className="text-xs" label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft', className: 'text-xs' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))' 
                        }}
                        labelFormatter={(label) => `Date: ${formatDate(label)}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="squat" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Squat"
                        dot={{ fill: '#3b82f6' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="bench" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="Bench"
                        dot={{ fill: '#f59e0b' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="deadlift" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        name="Deadlift"
                        dot={{ fill: '#ef4444' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        name="Total"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    No PR data yet. Update your personal records to see your progress!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* PR Comparison */}
            {(stats as any)?.currentPR && targetUserId && (
              <PRComparison 
                userId={targetUserId}
                squat={(stats as any).currentPR.squat}
                bench={(stats as any).currentPR.bench}
                deadlift={(stats as any).currentPR.deadlift}
              />
            )}

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

            {/* Active Goals */}
            {(stats as any)?.goals && (
              <>
                {/* Weekly Goals */}
                {(stats as any).goals.weekly && (stats as any).goals.weekly.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Weekly Goals
                      </CardTitle>
                      <CardDescription>Active goals for this week</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(stats as any).goals.weekly.map((goal: any) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{goal.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={(goal.currentValue / goal.targetValue) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Yearly Goals */}
                {(stats as any).goals.yearly && (stats as any).goals.yearly.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Yearly Goals
                      </CardTitle>
                      <CardDescription>Active goals for this year</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(stats as any).goals.yearly.map((goal: any) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{goal.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={(goal.currentValue / goal.targetValue) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Lifetime Goals */}
                {(stats as any).goals.lifetime && (stats as any).goals.lifetime.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Lifetime Goals
                      </CardTitle>
                      <CardDescription>Long-term fitness goals</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(stats as any).goals.lifetime.map((goal: any) => (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{goal.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {goal.currentValue} / {goal.targetValue} {goal.unit}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                            </Badge>
                          </div>
                          <Progress 
                            value={(goal.currentValue / goal.targetValue) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

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

            {/* Browse Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Browse Users
                </CardTitle>
                <CardDescription>Click on any user to view their stats</CardDescription>
              </CardHeader>
              <CardContent>
                {allUsers && (allUsers as any[]).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {(allUsers as any[]).map((u: any) => (
                      <Link key={u.id} href={`/stats/${u.id}`}>
                        <div
                          className="p-3 rounded-lg border border-border hover-elevate active-elevate-2 cursor-pointer"
                          data-testid={`user-card-${u.username}`}
                        >
                          <div className="flex flex-col items-center gap-2 relative">
                            {u.mvlWins > 0 && (
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
                                <MVLBadge mvlWins={u.mvlWins} size="sm" />
                              </div>
                            )}
                            <AvatarDisplay
                              level={u.level}
                              size="sm"
                              gender={u.gender || "male"}
                              skinColor={u.skinColor || "light"}
                              characterType={u.characterType || "classic"}
                              shirtColor={u.shirtColor}
                              shortsColor={u.shortsColor}
                              hairStyle={u.hairStyle}
                              hairColor={u.hairColor}
                              headband={u.headband}
                              wristbands={u.wristbands}
                            />
                            <div className="text-center w-full">
                              <p className="font-semibold text-sm truncate">
                                {u.displayName || u.username}
                              </p>
                              <p className="text-xs text-muted-foreground">{u.title}</p>
                              <p className="text-xs text-primary font-medium mt-1">
                                Lv {u.level} • {u.xp.toLocaleString()} XP
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No users to display
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
