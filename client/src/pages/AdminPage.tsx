import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus, Users, Trophy, Zap, RefreshCw, UserX, Edit2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [newChallenge, setNewChallenge] = useState("");
  const [newChallengeXP, setNewChallengeXP] = useState("20");
  const [newGoal, setNewGoal] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [editingDisplayName, setEditingDisplayName] = useState<{ userId: string; currentName: string } | null>(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [editingChallenge, setEditingChallenge] = useState<{ id: string; text: string; xpValue: number } | null>(null);
  const [editChallengeXP, setEditChallengeXP] = useState("20");
  
  // Crew challenge state
  const [newCrewChallenge, setNewCrewChallenge] = useState({
    text: "",
    description: "",
    targetValue: "",
    unit: "lbs",
  });

  // Redirect non-admins
  if (user && !user.isAdmin) {
    navigate("/");
  }

  if (!user?.isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-2xl">Access Denied</div>
      </div>
    </div>;
  }

  const { data: challenges } = useQuery({
    queryKey: ["/api/admin/challenges"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/home"],
  });

  const { data: crewChallenges = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/crew-challenges"],
  });

  const addChallengeMutation = useMutation({
    mutationFn: async ({ text, xpValue }: { text: string; xpValue: number }) => {
      const res = await apiRequest("POST", "/api/admin/challenges", { text, xpValue });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      setNewChallenge("");
      setNewChallengeXP("20");
      toast({
        title: "Challenge added!",
        description: "The challenge has been added to the pool.",
      });
    },
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/challenges/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      toast({
        title: "Challenge deleted",
        description: "The challenge has been removed from the pool.",
      });
    },
  });

  const editChallengeMutation = useMutation({
    mutationFn: async ({ id, xpValue }: { id: string; xpValue: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/challenges/${id}`, { xpValue });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      setEditingChallenge(null);
      setEditChallengeXP("20");
      toast({
        title: "Challenge updated!",
        description: "The challenge XP value has been updated.",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (goal: number) => {
      const res = await apiRequest("POST", "/api/admin/goal", { goal });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setNewGoal("");
      toast({
        title: "Goal updated!",
        description: "The crew goal has been updated.",
      });
    },
  });

  const resetGoalTo5000Mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/goal/reset-to-5000");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Goal reset!",
        description: "Crew goal has been reset to 5,000 lbs.",
      });
    },
  });

  const advanceGoalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/goal/advance");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Goal advanced!",
        description: `Crew goal increased to ${data.goal.toLocaleString()} lbs.`,
      });
    },
  });

  const addXPMutation = useMutation({
    mutationFn: async ({ userId, xp }: { userId: string; xp: number }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/xp/add`, { xp });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/user"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"], refetchType: 'all' });
      setXpAmount("");
      toast({
        title: "XP added!",
        description: `User now has ${data.newXP.toLocaleString()} XP (Level ${data.level}).`,
      });
    },
  });

  const removeXPMutation = useMutation({
    mutationFn: async ({ userId, xp }: { userId: string; xp: number }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/xp/remove`, { xp });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/user"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"], refetchType: 'all' });
      setXpAmount("");
      toast({
        title: "XP removed!",
        description: `User now has ${data.newXP.toLocaleString()} XP (Level ${data.level}).`,
      });
    },
  });

  const resetXPMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/xp/reset`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/user"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"], refetchType: 'all' });
      toast({
        title: "XP reset!",
        description: "User XP has been reset to 0.",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      setSelectedUser("");
      toast({
        title: "User deleted",
        description: "The user has been removed from the platform.",
      });
    },
  });

  const updateDisplayNameMutation = useMutation({
    mutationFn: async ({ userId, displayName }: { userId: string; displayName: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/display-name`, { displayName });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      setEditingDisplayName(null);
      setNewDisplayName("");
      toast({
        title: "Display name updated!",
        description: "The user's leaderboard display name has been changed.",
      });
    },
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/toggle-admin`, { isAdmin });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      toast({
        title: variables.isAdmin ? "Admin granted!" : "Admin revoked",
        description: variables.isAdmin ? "User is now an admin." : "User is no longer an admin.",
      });
    },
  });

  const recalculateLevelsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/recalculate-levels");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/user"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"], refetchType: 'all' });
      toast({
        title: "Levels recalculated!",
        description: `Updated ${data.usersUpdated} user(s). Refreshing page...`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
  });

  const awardMVLMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/award-mvl");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/user"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboards/mvl"], refetchType: 'all' });
      toast({
        title: "MVL Badge Awarded! 🏆",
        description: `${data.winner.displayName || data.winner.username} won with ${data.winner.dailyXp} XP!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to award MVL badge",
        variant: "destructive",
      });
    },
  });

  const addCrewChallengeMutation = useMutation({
    mutationFn: async (data: typeof newCrewChallenge) => {
      const res = await apiRequest("POST", "/api/admin/crew-challenges", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crew-challenges"] });
      setNewCrewChallenge({ text: "", description: "", targetValue: "", unit: "lbs" });
      toast({
        title: "Crew challenge created!",
        description: "The crew challenge has been added to the pool.",
      });
    },
  });

  const deleteCrewChallengeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/crew-challenges/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/crew-challenges"] });
      toast({
        title: "Crew challenge deleted",
        description: "The crew challenge has been removed from the pool.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        username={user?.username}
        isAdmin={user?.isAdmin || false}
        isLoggedIn={true}
        userLevel={user?.level}
        userXP={user?.xp}
        userTitle={user?.title}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6 space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-display tracking-wider">ADMIN PANEL</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Platform Stats
              </CardTitle>
              <CardDescription>Overview of the Iron Crew platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Users:</span>
                <span className="font-display text-2xl">{(stats as any)?.leaderboard?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Weight Lifted:</span>
                <span className="font-display text-2xl">{((stats as any)?.total || 0).toLocaleString()} lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Goal:</span>
                <span className="font-display text-2xl">{((stats as any)?.goal || 0).toLocaleString()} lbs</span>
              </div>
            </CardContent>
          </Card>

          {/* Crew Goal Management */}
          <Card>
            <CardHeader>
              <CardTitle>Crew Goal Management</CardTitle>
              <CardDescription>Manage the crew's lifting goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => resetGoalTo5000Mutation.mutate()}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-reset-goal-5000"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to 5,000
                </Button>
                <Button
                  onClick={() => advanceGoalMutation.mutate()}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-advance-goal-250"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  +250 lbs
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal">Custom Goal (lbs)</Label>
                <div className="flex gap-2">
                  <Input
                    id="goal"
                    type="number"
                    placeholder="e.g., 10000"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    data-testid="input-new-goal"
                  />
                  <Button
                    onClick={() => {
                      const goal = parseInt(newGoal);
                      if (goal > 0) {
                        updateGoalMutation.mutate(goal);
                      }
                    }}
                    disabled={!newGoal || parseInt(newGoal) <= 0}
                    data-testid="button-update-goal"
                  >
                    Set Goal
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* XP Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              XP Management
            </CardTitle>
            <CardDescription>Add or reset XP for any user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-select">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger id="user-select" data-testid="select-user">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {(stats as any)?.leaderboard?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.username} (Level {u.level} - {u.xp.toLocaleString()} XP)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="space-y-4 p-4 border rounded-lg bg-card/50">
                <div className="space-y-2">
                  <Label htmlFor="xp-amount">XP Amount</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="xp-amount"
                        type="number"
                        placeholder="e.g., 100"
                        value={xpAmount}
                        onChange={(e) => setXpAmount(e.target.value)}
                        data-testid="input-xp-amount"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const xp = parseInt(xpAmount);
                          if (xp && selectedUser) {
                            addXPMutation.mutate({ userId: selectedUser, xp });
                          }
                        }}
                        disabled={!xpAmount || parseInt(xpAmount) <= 0}
                        className="flex-1"
                        data-testid="button-add-xp"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add XP
                      </Button>
                      <Button
                        onClick={() => {
                          const xp = parseInt(xpAmount);
                          if (xp && selectedUser) {
                            removeXPMutation.mutate({ userId: selectedUser, xp });
                          }
                        }}
                        disabled={!xpAmount || parseInt(xpAmount) <= 0}
                        variant="outline"
                        className="flex-1"
                        data-testid="button-remove-xp"
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Remove XP
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedUser) {
                        resetXPMutation.mutate(selectedUser);
                      }
                    }}
                    className="flex-1"
                    data-testid="button-reset-xp"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset XP to 0
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (selectedUser && confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
                        deleteUserMutation.mutate(selectedUser);
                      }
                    }}
                    className="flex-1"
                    data-testid="button-delete-user"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Delete User
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>View and manage all users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(stats as any)?.leaderboard && (stats as any).leaderboard.length > 0 ? (
                (stats as any).leaderboard.map((u: any) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{u.username}</span>
                        {u.isAdmin && (
                          <Badge variant="default" className="text-xs">Admin</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Level {u.level} • {u.xp.toLocaleString()} XP
                      </div>
                      {u.displayName && (
                        <div className="text-xs text-muted-foreground">
                          Leaderboard name: {u.displayName}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={editingDisplayName?.userId === u.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingDisplayName(null);
                          setNewDisplayName("");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingDisplayName({ userId: u.id, currentName: u.displayName || u.username });
                              setNewDisplayName(u.displayName || u.username);
                            }}
                            data-testid={`button-edit-displayname-${u.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Display Name for {u.username}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="display-name-input">Display Name (max 50 characters)</Label>
                              <Input
                                id="display-name-input"
                                value={newDisplayName}
                                onChange={(e) => setNewDisplayName(e.target.value)}
                                maxLength={50}
                                placeholder="Enter display name..."
                                data-testid="input-edit-displayname"
                              />
                              <p className="text-xs text-muted-foreground">
                                This will appear on the leaderboard. Current: {u.displayName || "Not set"}
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingDisplayName(null);
                                setNewDisplayName("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                if (newDisplayName.trim() && editingDisplayName) {
                                  updateDisplayNameMutation.mutate({
                                    userId: editingDisplayName.userId,
                                    displayName: newDisplayName.trim(),
                                  });
                                }
                              }}
                              disabled={!newDisplayName.trim() || updateDisplayNameMutation.isPending}
                              data-testid="button-save-displayname"
                            >
                              {updateDisplayNameMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const action = u.isAdmin ? "revoke admin access from" : "promote to admin";
                          if (confirm(`Are you sure you want to ${action} ${u.username}?`)) {
                            toggleAdminMutation.mutate({ userId: u.id, isAdmin: !u.isAdmin });
                          }
                        }}
                        data-testid={`button-toggle-admin-${u.id}`}
                        title={u.isAdmin ? "Revoke Admin" : "Promote to Admin"}
                      >
                        <Zap className={`h-4 w-4 ${u.isAdmin ? 'text-primary' : 'text-muted-foreground'}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${u.username}? This action cannot be undone.`)) {
                            deleteUserMutation.mutate(u.id);
                          }
                        }}
                        data-testid={`button-delete-user-${u.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No users found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              System Tools
            </CardTitle>
            <CardDescription>Maintenance and system-wide operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Fix Level Calculation Issues</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Recalculates all user levels based on their current XP. Use this if users are stuck at incorrect levels.
                </p>
                <Button
                  onClick={() => {
                    if (confirm("This will recalculate levels for all users based on their XP. Continue?")) {
                      recalculateLevelsMutation.mutate();
                    }
                  }}
                  disabled={recalculateLevelsMutation.isPending}
                  data-testid="button-recalculate-levels"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {recalculateLevelsMutation.isPending ? "Recalculating..." : "Recalculate All Levels"}
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Award Daily MVL Badge</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Awards the Most Valuable Lifter (MVL) badge to today's top XP earner and resets everyone's daily XP counter.
                </p>
                <Button
                  onClick={() => {
                    if (confirm("Award MVL badge to today's top earner and reset daily XP for everyone?")) {
                      awardMVLMutation.mutate();
                    }
                  }}
                  disabled={awardMVLMutation.isPending}
                  data-testid="button-award-mvl"
                  variant="default"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {awardMVLMutation.isPending ? "Awarding..." : "Award MVL Badge"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Pool Management */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Pool</CardTitle>
            <CardDescription>Manage daily challenges that are randomly assigned to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter new challenge description"
                  value={newChallenge}
                  onChange={(e) => setNewChallenge(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newChallenge.trim()) {
                      addChallengeMutation.mutate({ text: newChallenge.trim(), xpValue: parseInt(newChallengeXP) });
                    }
                  }}
                  data-testid="input-new-challenge"
                  className="flex-1"
                />
                <Select value={newChallengeXP} onValueChange={setNewChallengeXP}>
                  <SelectTrigger className="w-[100px]" data-testid="select-challenge-xp">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 XP</SelectItem>
                    <SelectItem value="20">20 XP</SelectItem>
                    <SelectItem value="25">25 XP</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    if (newChallenge.trim()) {
                      addChallengeMutation.mutate({ text: newChallenge.trim(), xpValue: parseInt(newChallengeXP) });
                    }
                  }}
                  disabled={!newChallenge.trim()}
                  data-testid="button-add-challenge"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {challenges && (challenges as any[]).length > 0 ? (
                (challenges as any[]).map((challenge: any) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="flex-1">{challenge.text}</span>
                      <span className="text-sm font-semibold text-primary px-2 py-1 rounded bg-primary/10">
                        {challenge.xpValue || 20} XP
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Dialog open={editingChallenge?.id === challenge.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingChallenge(null);
                          setEditChallengeXP("20");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingChallenge(challenge);
                              setEditChallengeXP(challenge.xpValue?.toString() || "20");
                            }}
                            data-testid={`button-edit-challenge-${challenge.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Challenge XP</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Challenge</Label>
                              <p className="text-sm text-muted-foreground">{challenge.text}</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-xp">XP Value</Label>
                              <Select value={editChallengeXP} onValueChange={setEditChallengeXP}>
                                <SelectTrigger id="edit-xp" data-testid="select-edit-challenge-xp">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 XP</SelectItem>
                                  <SelectItem value="20">20 XP</SelectItem>
                                  <SelectItem value="25">25 XP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingChallenge(null);
                                setEditChallengeXP("20");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                if (editingChallenge) {
                                  editChallengeMutation.mutate({
                                    id: editingChallenge.id,
                                    xpValue: parseInt(editChallengeXP),
                                  });
                                }
                              }}
                              disabled={editChallengeMutation.isPending}
                              data-testid="button-save-challenge-xp"
                            >
                              {editChallengeMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteChallengeMutation.mutate(challenge.id)}
                        data-testid={`button-delete-challenge-${challenge.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No challenges in the pool yet. Add some above!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Crew Challenge Pool Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Crew Challenge Pool
            </CardTitle>
            <CardDescription>Manage weekly crew challenges. One challenge is randomly selected every Monday.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="crew-challenge-text">Challenge Name</Label>
                <Input
                  id="crew-challenge-text"
                  placeholder="e.g., Crew Squat Challenge"
                  value={newCrewChallenge.text}
                  onChange={(e) => setNewCrewChallenge({ ...newCrewChallenge, text: e.target.value })}
                  data-testid="input-crew-challenge-text"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crew-challenge-desc">Description</Label>
                <Input
                  id="crew-challenge-desc"
                  placeholder="e.g., Team up and squat together!"
                  value={newCrewChallenge.description}
                  onChange={(e) => setNewCrewChallenge({ ...newCrewChallenge, description: e.target.value })}
                  data-testid="input-crew-challenge-desc"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="crew-challenge-target">Target Value</Label>
                  <Input
                    id="crew-challenge-target"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g., 50000"
                    value={newCrewChallenge.targetValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setNewCrewChallenge({ ...newCrewChallenge, targetValue: value });
                    }}
                    data-testid="input-crew-challenge-target"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crew-challenge-unit">Unit</Label>
                  <Select
                    value={newCrewChallenge.unit}
                    onValueChange={(value) => setNewCrewChallenge({ ...newCrewChallenge, unit: value })}
                  >
                    <SelectTrigger id="crew-challenge-unit" data-testid="select-crew-challenge-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="reps">reps</SelectItem>
                      <SelectItem value="miles">miles</SelectItem>
                      <SelectItem value="minutes">minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (newCrewChallenge.text.trim() && newCrewChallenge.description.trim() && newCrewChallenge.targetValue) {
                    addCrewChallengeMutation.mutate({
                      ...newCrewChallenge,
                      targetValue: newCrewChallenge.targetValue,
                    });
                  }
                }}
                disabled={!newCrewChallenge.text.trim() || !newCrewChallenge.description.trim() || !newCrewChallenge.targetValue}
                data-testid="button-add-crew-challenge"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Crew Challenge
              </Button>
            </div>

            <div className="space-y-2">
              {crewChallenges.length > 0 ? (
                crewChallenges.map((challenge: any) => (
                  <div
                    key={challenge.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-card gap-3"
                    data-testid={`crew-challenge-${challenge.id}`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{challenge.text}</div>
                      <div className="text-sm text-muted-foreground">{challenge.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Target: {challenge.targetValue.toLocaleString()} {challenge.unit}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm(`Delete "${challenge.text}"?`)) {
                          deleteCrewChallengeMutation.mutate(challenge.id);
                        }
                      }}
                      data-testid={`button-delete-crew-challenge-${challenge.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No crew challenges in the pool yet. Add some above!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
