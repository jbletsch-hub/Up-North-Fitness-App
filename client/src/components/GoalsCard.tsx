import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Plus, Check, X, Edit } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useXPPopup } from "@/components/XPPopup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserGoal {
  id: string;
  type: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
}

export function GoalsCard() {
  const { toast } = useToast();
  const { showXP, popup } = useXPPopup();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);
  const [goalType, setGoalType] = useState<"weekly" | "lifetime" | "yearly">("weekly");
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("lbs");
  const [newProgress, setNewProgress] = useState("");

  const { data: weeklyGoals = [], isLoading: weeklyLoading } = useQuery({
    queryKey: ["/api/goals", { type: "weekly" }],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=weekly");
      if (!response.ok) throw new Error("Failed to fetch weekly goals");
      return response.json();
    },
  });

  const { data: lifetimeGoals = [], isLoading: lifetimeLoading } = useQuery({
    queryKey: ["/api/goals", { type: "lifetime" }],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=lifetime");
      if (!response.ok) throw new Error("Failed to fetch lifetime goals");
      return response.json();
    },
  });

  const { data: yearlyGoals = [], isLoading: yearlyLoading } = useQuery({
    queryKey: ["/api/goals", { type: "yearly" }],
    queryFn: async () => {
      const response = await fetch("/api/goals?type=yearly");
      if (!response.ok) throw new Error("Failed to fetch yearly goals");
      return response.json();
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goal: { type: string; title: string; targetValue: number; unit: string }) => {
      const res = await apiRequest("POST", "/api/goals", goal);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsAddDialogOpen(false);
      setTitle("");
      setTargetValue("");
      setUnit("lbs");
      toast({
        title: "Goal created!",
        description: "Your new goal has been added.",
      });
    },
  });

  const completeGoalMutation = useMutation({
    mutationFn: async ({ id, position }: { id: string; position?: { x: number; y: number } }) => {
      const res = await apiRequest("PATCH", `/api/goals/${id}/complete`);
      return { data: await res.json(), position };
    },
    onSuccess: (response: any) => {
      const { data, position } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded && position) {
        const fakeEvent = {
          currentTarget: {
            getBoundingClientRect: () => ({
              left: position.x - 50,
              top: position.y,
              width: 100,
              height: 40,
              right: position.x + 50,
              bottom: position.y + 40,
              x: position.x - 50,
              y: position.y,
            }),
          },
        };
        showXP(data.xpAwarded, fakeEvent as any);
      }
      toast({
        title: "Goal completed!",
        description: "Congratulations on reaching your goal!",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/goals/${id}`);
      return res.status === 204 ? null : await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, currentValue }: { id: string; currentValue: number }) => {
      const res = await apiRequest("PATCH", `/api/goals/${id}/progress`, { currentValue });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsUpdateDialogOpen(false);
      setSelectedGoal(null);
      setNewProgress("");
      toast({
        title: "Progress updated!",
        description: "Your goal progress has been saved.",
      });
    },
  });

  const handleCreateGoal = () => {
    if (!title || !targetValue) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    createGoalMutation.mutate({
      type: goalType,
      title,
      targetValue: parseFloat(targetValue),
      unit,
    });
  };

  const handleUpdateProgress = () => {
    if (!selectedGoal || !newProgress) {
      toast({
        title: "Missing information",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    updateProgressMutation.mutate({
      id: selectedGoal.id,
      currentValue: parseFloat(newProgress),
    });
  };

  const renderGoalSection = (goals: UserGoal[], type: "weekly" | "lifetime" | "yearly") => {
    const activeGoals = goals.filter((g) => !g.completed);
    const completedGoals = goals.filter((g) => g.completed);

    const getIcon = () => {
      if (type === "weekly") return <Target className="h-5 w-5 text-chart-2" />;
      if (type === "yearly") return <Trophy className="h-5 w-5 text-chart-1" />;
      return <Trophy className="h-5 w-5 text-primary" />;
    };

    const getTitle = () => {
      if (type === "weekly") return "WEEKLY GOALS";
      if (type === "yearly") return "YEARLY GOALS";
      return "LIFETIME GOALS";
    };

    const getXPReward = () => {
      if (type === "weekly") return "100 XP";
      if (type === "yearly") return "10,000 XP";
      return "5,000 XP";
    };

    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
              {getTitle()}
            </div>
            <Dialog open={isAddDialogOpen && goalType === type} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (open) setGoalType(type);
            }}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" data-testid={`button-add-${type}-goal`}>
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add {type === "weekly" ? "Weekly" : type === "yearly" ? "Yearly" : "Lifetime"} Goal</DialogTitle>
                  <DialogDescription>
                    Set a new goal to track your progress. Rewards: {getXPReward()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Goal Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Bench press 225 lbs"
                      data-testid="input-goal-title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                      placeholder="e.g., 225"
                      data-testid="input-goal-target"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger data-testid="select-goal-unit">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lbs">lbs</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="reps">reps</SelectItem>
                        <SelectItem value="miles">miles</SelectItem>
                        <SelectItem value="km">km</SelectItem>
                        <SelectItem value="days">days</SelectItem>
                        <SelectItem value="times">times</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateGoal} data-testid="button-create-goal">
                    Create Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeGoals.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              No active goals. Click + to add one!
            </p>
          )}
          {activeGoals.map((goal) => {
            const progress = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
            return (
              <div key={goal.id} className="space-y-2" data-testid={`goal-${goal.id}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{goal.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setNewProgress(goal.currentValue.toString());
                        setIsUpdateDialogOpen(true);
                      }}
                      data-testid={`button-update-goal-${goal.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const position = {
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        };
                        completeGoalMutation.mutate({ id: goal.id, position });
                      }}
                      data-testid={`button-complete-goal-${goal.id}`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteGoalMutation.mutate(goal.id)}
                      data-testid={`button-delete-goal-${goal.id}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            );
          })}
          {completedGoals.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Completed</p>
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex justify-between items-center py-2 opacity-60"
                  data-testid={`completed-goal-${goal.id}`}
                >
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
    );
  };

  if (weeklyLoading || lifetimeLoading || yearlyLoading) {
    return <div className="text-center py-8">Loading goals...</div>;
  }

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {renderGoalSection(weeklyGoals, "weekly")}
        {renderGoalSection(yearlyGoals, "yearly")}
        {renderGoalSection(lifetimeGoals, "lifetime")}
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Progress</DialogTitle>
            <DialogDescription>
              Update your current progress for: {selectedGoal?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newProgress">Current Value</Label>
              <Input
                id="newProgress"
                type="number"
                value={newProgress}
                onChange={(e) => setNewProgress(e.target.value)}
                placeholder={`Enter value in ${selectedGoal?.unit}`}
                data-testid="input-update-progress"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Target: {selectedGoal?.targetValue} {selectedGoal?.unit}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateProgress} data-testid="button-save-progress">
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {popup}
    </>
  );
}
