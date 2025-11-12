import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Target, Trophy, Calendar, Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function GoalsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTargetValue, setNewGoalTargetValue] = useState("");
  const [newGoalUnit, setNewGoalUnit] = useState("times");
  const [newGoalType, setNewGoalType] = useState<"weekly" | "yearly" | "lifetime">("weekly");

  const { data: goalsData, isLoading } = useQuery({
    queryKey: ["/api/goals"],
  });

  const createGoalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/goals", {
        title: newGoalTitle,
        targetValue: parseFloat(newGoalTargetValue),
        unit: newGoalUnit,
        type: newGoalType,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setNewGoalTitle("");
      setNewGoalTargetValue("");
      setNewGoalUnit("times");
      toast({
        title: "Goal created!",
        description: "Your new goal has been added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  const completeGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const res = await apiRequest("PATCH", `/api/goals/${goalId}/complete`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Goal completed!",
        description: `You earned ${data.xpAwarded} XP!`,
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      await apiRequest("DELETE", `/api/goals/${goalId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "The goal has been removed.",
      });
    },
  });

  const getGoalTypeInfo = (type: string) => {
    switch (type) {
      case "weekly":
        return { label: "Weekly", icon: Calendar, xp: "100 XP", color: "text-blue-500" };
      case "yearly":
        return { label: "Yearly", icon: Target, xp: "2,000 XP", color: "text-purple-500" };
      case "lifetime":
        return { label: "Lifetime", icon: Trophy, xp: "5,000 XP", color: "text-yellow-500" };
      default:
        return { label: "Goal", icon: Target, xp: "0 XP", color: "text-primary" };
    }
  };

  const renderGoalSection = (title: string, goals: any[], type: string) => {
    const activeGoals = goals.filter((g: any) => !g.completed);
    const completedGoals = goals.filter((g: any) => g.completed);
    const typeInfo = getGoalTypeInfo(type);
    const Icon = typeInfo.icon;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${typeInfo.color}`} />
            {title}
          </CardTitle>
          <CardDescription>
            {activeGoals.length} active · {completedGoals.length} completed · {typeInfo.xp} reward
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeGoals.length === 0 && completedGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No {type} goals yet
            </p>
          ) : (
            <>
              {activeGoals.map((goal: any) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-lg border border-border space-y-2"
                  data-testid={`goal-${goal.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => completeGoalMutation.mutate(goal.id)}
                        disabled={completeGoalMutation.isPending}
                        data-testid={`button-complete-${goal.id}`}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                        disabled={deleteGoalMutation.isPending}
                        data-testid={`button-delete-${goal.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Progress 
                    value={(goal.currentValue / goal.targetValue) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
              {completedGoals.length > 0 && (
                <div className="pt-3 border-t border-border space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">Completed</p>
                  {completedGoals.map((goal: any) => (
                    <div
                      key={goal.id}
                      className="p-3 rounded-lg bg-secondary/30 opacity-60 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <p className="text-sm line-through flex-1">{goal.title}</p>
                      </div>
                      {goal.completedAt && (
                        <p className="text-xs text-muted-foreground pl-6">
                          {new Date(goal.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
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

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Target className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl font-bold">Your Goals</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Set and track your fitness goals
          </p>
        </div>

        {/* Create New Goal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newGoalTitle.trim() && newGoalTargetValue) {
                  createGoalMutation.mutate();
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal Type</Label>
                <Select value={newGoalType} onValueChange={(value: any) => setNewGoalType(value)}>
                  <SelectTrigger id="goal-type" data-testid="select-goal-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly (100 XP)</SelectItem>
                    <SelectItem value="yearly">Yearly (2,000 XP)</SelectItem>
                    <SelectItem value="lifetime">Lifetime (5,000 XP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Description</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Hit the gym this week"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  data-testid="input-goal-title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    placeholder="e.g., 4"
                    value={newGoalTargetValue}
                    onChange={(e) => setNewGoalTargetValue(e.target.value)}
                    data-testid="input-goal-target"
                    min="0"
                    step="any"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-unit">Unit</Label>
                  <Select value={newGoalUnit} onValueChange={setNewGoalUnit}>
                    <SelectTrigger id="goal-unit" data-testid="select-goal-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="times">times</SelectItem>
                      <SelectItem value="workouts">workouts</SelectItem>
                      <SelectItem value="lbs">lbs</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="minutes">minutes</SelectItem>
                      <SelectItem value="hours">hours</SelectItem>
                      <SelectItem value="miles">miles</SelectItem>
                      <SelectItem value="km">km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!newGoalTitle.trim() || !newGoalTargetValue || createGoalMutation.isPending}
                data-testid="button-create-goal"
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Goals List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {renderGoalSection("Weekly Goals", (goalsData as any)?.weekly || [], "weekly")}
            {renderGoalSection("Yearly Goals", (goalsData as any)?.yearly || [], "yearly")}
            {renderGoalSection("Lifetime Goals", (goalsData as any)?.lifetime || [], "lifetime")}
          </div>
        )}
      </main>
    </div>
  );
}
