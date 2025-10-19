import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Users, Trophy } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [newChallenge, setNewChallenge] = useState("");
  const [newGoal, setNewGoal] = useState("");

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
              <CardDescription>Set a custom crew goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">New Goal (lbs)</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="e.g., 10000"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  data-testid="input-new-goal"
                />
              </div>
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
                Update Goal
              </Button>
            </CardContent>
          </Card>
        </div>

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
