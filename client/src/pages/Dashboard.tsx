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

  const completeMutation = useMutation({
    mutationFn: async ({ challengeId, event }: { challengeId: string; event?: any }) => {
      const res = await apiRequest("POST", `/api/challenges/${challengeId}/complete`);
      return { data: await res.json(), event };
    },
    onSuccess: (response: any) => {
      const { data, event } = response;
      console.log("Challenge complete - Data:", data);
      console.log("Challenge complete - Event:", event);
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      if (data.xpAwarded && event) {
        console.log("Showing XP popup for challenge");
        showXP(data.xpAwarded, event);
      } else {
        console.log("NOT showing XP popup. xpAwarded:", data.xpAwarded, "event:", event);
      }
      // Show bonus XP if all challenges completed
      if (data.bonusXP > 0 && event) {
        setTimeout(() => {
          showXP(data.bonusXP, event);
        }, 500);
        toast({
          title: "All challenges complete! 🎉",
          description: `Bonus ${data.bonusXP} XP awarded!`,
        });
      }
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async (event?: any) => {
      const res = await apiRequest("POST", "/api/checkin");
      return { data: await res.json(), event };
    },
    onSuccess: (response: any) => {
      const { data, event } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded && event) {
        showXP(data.xpAwarded, event);
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
    mutationFn: async ({ prs, event }: { prs: { squat: number; bench: number; deadlift: number }; event?: any }) => {
      const res = await apiRequest("POST", "/api/prs", prs);
      return { data: await res.json(), event };
    },
    onSuccess: (response: any) => {
      const { data, event } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      if (data.xpAwarded > 0 && event) {
        showXP(data.xpAwarded, event);
      }
      toast({
        title: "PRs updated!",
        description: "Your personal records have been saved.",
      });
    },
  });

  const weighinMutation = useMutation({
    mutationFn: async ({ weight, event }: { weight: number; event?: any }) => {
      const res = await apiRequest("POST", "/api/weighin", { weight });
      return { data: await res.json(), event };
    },
    onSuccess: (response: any) => {
      const { data, event } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded > 0 && event) {
        showXP(data.xpAwarded, event);
      }
      toast({
        title: "Weight recorded!",
        description: "Your weight has been saved.",
      });
    },
  });

  const photoMutation = useMutation({
    mutationFn: async ({ file, event }: { file: File; event?: any }) => {
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
      return { data: await response.json(), event };
    },
    onSuccess: (response: any) => {
      const { data, event } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded && event) {
        showXP(data.xpAwarded, event);
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

  const resetCrewGoalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/goal/reset");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      toast({
        title: "Crew goal reset!",
        description: "The crew goal has been reset to 5000 lbs.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset crew goal",
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

        <CrewGoalMeter 
          current={total} 
          goal={goal} 
          isAdmin={user?.isAdmin || false}
          onReset={() => resetCrewGoalMutation.mutate()}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <DailyChallenges
            challenges={challenges}
            onComplete={(id, event) => {
              completeMutation.mutate({ challengeId: id, event });
            }}
          />
          <CheckInCard
            streak={dashboardUser.streakCount}
            onCheckIn={(event) => {
              checkinMutation.mutate(event);
            }}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <PRTracker
            initialPRs={pr}
            onUpdate={(prs, event) => {
              prMutation.mutate({ prs, event });
            }}
          />
          <div className="space-y-6">
            <WeighInCard
              currentWeight={dashboardUser.weight}
              onWeighIn={(weight, event) => {
                weighinMutation.mutate({ weight, event });
              }}
            />
            <PhotoUpload onUpload={(file, event) => {
              photoMutation.mutate({ file, event });
            }} />
          </div>
        </div>

        <LeaderboardCard users={leaderboard} />

        <GoalsCard />
      </main>

      {popup}
    </div>
  );
}
