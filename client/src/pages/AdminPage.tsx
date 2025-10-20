import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [newGoal, setNewGoal] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [xpAmount, setXpAmount] = useState("");
  const [editingDisplayName, setEditingDisplayName] = useState<{ userId: string; currentName: string } | null>(null);
  const [newDisplayName, setNewDisplayName] = useState("");

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

  const addChallengeMutation = useMutation({
    mutationFn: async (description: string) => {
      const res = await apiRequest("POST", "/api/admin/challenges", { description });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/challenges"] });
      setNewChallenge("");
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
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      setXpAmount("");
      toast({
        title: "XP added!",
        description: `User now has ${data.newXP.toLocaleString()} XP.`,
      });
    },
  });

  const resetXPMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/xp/reset`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        username={user?.username}
        isAdmin={user?.isAdmin || false}
        isLoggedIn={true}
        userLevel={user?.level}
        userXP={user?.xp}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
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
                  <div className="flex gap-2">
                    <Input
                      id="xp-amount"
                      type="number"
                      placeholder="e.g., 100"
                      value={xpAmount}
                      onChange={(e) => setXpAmount(e.target.value)}
                      data-testid="input-xp-amount"
                    />
                    <Button
                      onClick={() => {
                        const xp = parseInt(xpAmount);
                        if (xp && selectedUser) {
                          addXPMutation.mutate({ userId: selectedUser, xp });
                        }
                      }}
                      disabled={!xpAmount || parseInt(xpAmount) <= 0}
                      data-testid="button-add-xp"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add XP
                    </Button>
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
                      <div className="font-semibold">{u.username}</div>
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

        {/* Challenge Pool Management */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Pool</CardTitle>
            <CardDescription>Manage daily challenges that are randomly assigned to users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter new challenge description"
                value={newChallenge}
                onChange={(e) => setNewChallenge(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newChallenge.trim()) {
                    addChallengeMutation.mutate(newChallenge.trim());
                  }
                }}
                data-testid="input-new-challenge"
              />
              <Button
                onClick={() => {
                  if (newChallenge.trim()) {
                    addChallengeMutation.mutate(newChallenge.trim());
                  }
                }}
                disabled={!newChallenge.trim()}
                data-testid="button-add-challenge"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Challenge
              </Button>
            </div>

            <div className="space-y-2">
              {challenges && (challenges as any[]).length > 0 ? (
                (challenges as any[]).map((challenge: any) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <span>{challenge.description}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteChallengeMutation.mutate(challenge.id)}
                      data-testid={`button-delete-challenge-${challenge.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
      </main>
    </div>
  );
}
