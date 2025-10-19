import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { CrewGoalMeter } from "@/components/CrewGoalMeter";
import { DailyChallenges } from "@/components/DailyChallenges";
import { CheckInCard } from "@/components/CheckInCard";
import { PRTracker } from "@/components/PRTracker";
import { WeighInCard } from "@/components/WeighInCard";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useXPPopup } from "@/components/XPPopup";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showXP, popup } = useXPPopup();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: isAuthenticated,
  });

  const completeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest("POST", `/api/challenges/${challengeId}/complete`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      if (data.xp) {
        showXP(15);
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
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
      if (data.xp) {
        showXP(15);
      }
      toast({
        title: "Checked in!",
        description: `Your streak is now ${data.streak} days!`,
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
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
      if (data.xpAwarded > 0) {
        showXP(data.xpAwarded);
      }
      toast({
        title: "PRs updated!",
        description: "Your personal records have been saved.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const weighinMutation = useMutation({
    mutationFn: async (weight: number) => {
      return await apiRequest("POST", "/api/weighin", { weight });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded > 0) {
        showXP(data.xpAwarded);
      }
      toast({
        title: "Weight recorded!",
        description: "Your weight has been saved.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      const response = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to upload photo");
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xp) {
        showXP(15);
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={true}
        username={(user as any)?.username}
        isAdmin={(user as any)?.isAdmin}
        userLevel={(user as any)?.level}
        userXP={(user as any)?.xp}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-4xl tracking-wider">
            {dashboardUser.username?.toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            Level {dashboardUser.level} · {dashboardUser.title} · {dashboardUser.xp.toLocaleString()} XP
          </p>
        </div>

        <CrewGoalMeter current={total} goal={goal} />

        <div className="grid md:grid-cols-2 gap-6">
          <DailyChallenges
            challenges={challenges}
            onComplete={(id) => completeMutation.mutate(id)}
          />
          <CheckInCard
            streak={dashboardUser.streakCount}
            onCheckIn={() => checkinMutation.mutate()}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <PRTracker
            initialPRs={pr}
            onUpdate={(prs) => prMutation.mutate(prs)}
          />
          <div className="space-y-6">
            <WeighInCard
              currentWeight={dashboardUser.weight}
              onWeighIn={(weight) => weighinMutation.mutate(weight)}
            />
            <PhotoUpload onUpload={(file) => photoMutation.mutate(file)} />
          </div>
        </div>
      </main>

      {popup}
    </div>
  );
}
