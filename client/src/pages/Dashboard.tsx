import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { CrewGoalMeter } from "@/components/CrewGoalMeter";
import { DailyChallenges } from "@/components/DailyChallenges";
import { CheckInCard } from "@/components/CheckInCard";
import { PRTracker } from "@/components/PRTracker";
import { WeighInCard } from "@/components/WeighInCard";
import { PhotoUpload } from "@/components/PhotoUpload";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { GoalsCard } from "@/components/GoalsCard";
import { useXPPopup } from "@/components/XPPopup";
import { getXPToNextLevel, getLevelProgress } from "@/lib/xpUtils";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { showXP, popup } = useXPPopup();

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const { data: homeData } = useQuery<{ leaderboard: any[] }>({
    queryKey: ["/api/home"],
    enabled: !!user,
  });

  const [lastEvent, setLastEvent] = useState<React.MouseEvent | MouseEvent | null>(null);

  const completeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest("POST", `/api/challenges/${challengeId}/complete`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      if (data.xpAwarded && lastEvent) {
        showXP(data.xpAwarded, lastEvent);
      }
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/checkin");
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded && lastEvent) {
        showXP(data.xpAwarded, lastEvent);
      }
      toast({
        title: "Checked in!",
        description: `Your streak is now ${data.streak} days!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check in",
        variant: "destructive",
      });
    },
  });

  const prMutation = useMutation({
    mutationFn: async (prs: { squat: number; bench: number; deadlift: number }) => {
      return await apiRequest("POST", "/api/prs", prs);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      if (data.xpAwarded > 0 && lastEvent) {
        showXP(data.xpAwarded, lastEvent);
      }
      toast({
        title: "PRs updated!",
        description: "Your personal records have been saved.",
      });
    },
  });

  const weighinMutation = useMutation({
    mutationFn: async (weight: number) => {
      return await apiRequest("POST", "/api/weighin", { weight });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded > 0 && lastEvent) {
        showXP(data.xpAwarded, lastEvent);
      }
      toast({
        title: "Weight recorded!",
        description: "Your weight has been saved.",
      });
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded && lastEvent) {
        showXP(data.xpAwarded, lastEvent);
      }
      toast({
        title: "Photo uploaded!",
        description: "Your progress photo has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !dashboardData) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="font-display text-2xl">Loading...</div>
      </div>
    </div>;
  }

  const { user: dashboardUser, challenges, pr, goal, total } = dashboardData as any;
  const leaderboard = homeData?.leaderboard || [];
  
  const xpToNextLevel = getXPToNextLevel(dashboardUser.xp, dashboardUser.level);
  const levelProgress = getLevelProgress(dashboardUser.xp, dashboardUser.level);

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={true}
        username={user?.username}
        isAdmin={user?.isAdmin || false}
        userLevel={user?.level}
        userXP={user?.xp}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="space-y-3">
          <h1 className="font-display text-4xl tracking-wider">
            {dashboardUser.username?.toUpperCase()}
          </h1>
          <div>
            <p className="text-muted-foreground mb-2">
              Level {dashboardUser.level} · {dashboardUser.title} · {dashboardUser.xp.toLocaleString()} XP
            </p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to Level {dashboardUser.level + 1}</span>
                <span className="text-primary font-semibold">{xpToNextLevel.toLocaleString()} XP to go</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </div>
        </div>

        <CrewGoalMeter current={total} goal={goal} />

        <div className="grid md:grid-cols-2 gap-6">
          <DailyChallenges
            challenges={challenges}
            onComplete={(id, event) => {
              setLastEvent(event);
              completeMutation.mutate(id);
            }}
          />
          <CheckInCard
            streak={dashboardUser.streakCount}
            onCheckIn={(event) => {
              setLastEvent(event);
              checkinMutation.mutate();
            }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <PRTracker
            initialPRs={pr}
            onUpdate={(prs, event) => {
              setLastEvent(event);
              prMutation.mutate(prs);
            }}
          />
          <div className="space-y-6">
            <WeighInCard
              currentWeight={dashboardUser.weight}
              onWeighIn={(weight, event) => {
                setLastEvent(event);
                weighinMutation.mutate(weight);
              }}
            />
            <PhotoUpload onUpload={(file, event) => {
              setLastEvent(event);
              photoMutation.mutate(file);
            }} />
          </div>
        </div>

        <LeaderboardCard users={leaderboard} />

        <GoalsCard
          weeklyGoals={[
            { label: "Check-ins", current: dashboardUser.streakCount, target: 7, unit: "days" },
            { label: "Challenges Completed", current: challenges.filter((c: any) => c.completed).length, target: 28, unit: "" },
            { label: "Total Weight Lifted", current: (pr.squat + pr.bench + pr.deadlift), target: 1000, unit: "lbs" },
          ]}
          lifetimeStats={[
            { label: "Total XP Earned", value: dashboardUser.xp, unit: "XP" },
            { label: "Current Level", value: dashboardUser.level, unit: "" },
            { label: "Total PRs", value: (pr.squat + pr.bench + pr.deadlift), unit: "lbs" },
          ]}
        />
      </main>

      {popup}
    </div>
  );
}
