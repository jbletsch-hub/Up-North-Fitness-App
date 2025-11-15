import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { CrewGoalMeter } from "@/components/CrewGoalMeter";
import { GymTotalCard } from "@/components/GymTotalCard";
import { DailyChallenges } from "@/components/DailyChallenges";
import { CheckInCard } from "@/components/CheckInCard";
import { PRTracker } from "@/components/PRTracker";
import { WeighInCard } from "@/components/WeighInCard";
import { CalorieTrackerCard } from "@/components/CalorieTrackerCard";
import { PhotoUpload } from "@/components/PhotoUpload";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { DailyMVLCard } from "@/components/DailyMVLCard";
import { DisplayNameEditor } from "@/components/DisplayNameEditor";
import { useXPPopup } from "@/components/XPPopup";
import { getXPToNextLevel, getLevelProgress } from "@/lib/xpUtils";
import { Progress } from "@/components/ui/progress";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { AvatarWithProgress } from "@/components/AvatarWithProgress";
import { Card, CardContent } from "@/components/ui/card";
import { CrewChallengeCard } from "@/components/CrewChallengeCard";
import { CrewCompetitionsCard } from "@/components/CrewCompetitionsCard";
import { WeeklyMVMCard } from "@/components/WeeklyMVMCard";
import { QuickStatsWidget } from "@/components/QuickStatsWidget";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { ViewContextSwitcher } from "@/components/ViewContextSwitcher";
import { useViewContext } from "@/hooks/use-view-context";

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const { showXP, popup } = useXPPopup();
  const { viewContext, isCrewView } = useViewContext();

  const { data: userCrew } = useQuery({
    queryKey: ["/api/crews/my-crew"],
    enabled: !!user,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: !!user,
  });

  const { data: homeData } = useQuery<{ leaderboard: any[] }>({
    queryKey: ["/api/home"],
    enabled: !!user,
  });

  const { data: crewChallengeData = null } = useQuery<any>({
    queryKey: ["/api/crew-challenge/current"],
    enabled: !!user,
  });

  const { data: crewLeaderboard = [] } = useQuery<any[]>({
    queryKey: ["/api/crew-challenge/leaderboard"],
    enabled: !!user,
  });

  const completeMutation = useMutation({
    mutationFn: async ({ challengeId, position }: { challengeId: string; position?: { x: number; y: number } }) => {
      const res = await apiRequest("POST", `/api/challenges/${challengeId}/complete`);
      return { data: await res.json(), position };
    },
    onSuccess: (response: any) => {
      const { data, position } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      if (data.xpAwarded && position) {
        // Create a fake event with the position
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
      // Show bonus XP if all challenges completed
      if (data.bonusXP > 0 && position) {
        setTimeout(() => {
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
          showXP(data.bonusXP, fakeEvent as any);
        }, 500);
        toast({
          title: "All challenges complete! 🎉",
          description: `Bonus ${data.bonusXP} XP awarded!`,
        });
      }
    },
  });

  const rerollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/challenges/reroll");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Challenges rerolled!",
        description: "You've been assigned 3 new challenges for today.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reroll challenges",
        variant: "destructive",
      });
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async (position?: { x: number; y: number }) => {
      const res = await apiRequest("POST", "/api/checkin");
      return { data: await res.json(), position };
    },
    onSuccess: (response: any) => {
      const { data, position } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
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
    mutationFn: async ({ prs, position }: { prs: { squat: number; bench: number; deadlift: number }; position?: { x: number; y: number } }) => {
      const res = await apiRequest("POST", "/api/prs", prs);
      return { data: await res.json(), position };
    },
    onSuccess: (response: any) => {
      const { data, position } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      if (data.xpAwarded > 0 && position) {
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
      
      // Show special notification if crew goal was advanced
      if (data.goalAdvanced) {
        toast({
          title: "🎉 Crew Goal Achieved!",
          description: `Goal automatically advanced from ${data.oldGoal.toLocaleString()} to ${data.newGoal.toLocaleString()} lbs!`,
        });
      } else {
        toast({
          title: "PRs updated!",
          description: "Your personal records have been saved.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update PRs",
        variant: "destructive",
      });
    },
  });

  const weighinMutation = useMutation({
    mutationFn: async ({ weight, position }: { weight: number; position?: { x: number; y: number } }) => {
      const res = await apiRequest("POST", "/api/weighin", { weight });
      return { data: await res.json(), position };
    },
    onSuccess: (response: any) => {
      const { data, position } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded > 0 && position) {
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
        toast({
          title: "Weight recorded!",
          description: "Your weight has been saved and you earned 15 XP!",
        });
      } else {
        toast({
          title: "Weight recorded!",
          description: "Your weight has been saved (same as yesterday, no XP awarded).",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record weight",
        variant: "destructive",
      });
    },
  });

  const editWeighinMutation = useMutation({
    mutationFn: async ({ weight }: { weight: number }) => {
      const res = await apiRequest("PATCH", "/api/weighin", { weight });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Weight updated!",
        description: "Your weight has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update weight",
        variant: "destructive",
      });
    },
  });

  const calorieMutation = useMutation({
    mutationFn: async ({ calories, position }: { calories: number; position?: { x: number; y: number } }) => {
      const res = await apiRequest("POST", "/api/calories", { calories });
      return { data: await res.json(), position };
    },
    onSuccess: (response: any) => {
      const { data, position } = response;
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded > 0 && position) {
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
        title: "Calories logged!",
        description: "Your daily calorie intake has been recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log calories",
        variant: "destructive",
      });
    },
  });

  const [uploadPosition, setUploadPosition] = useState<{ x: number; y: number } | null>(null);

  const photoMutation = useMutation({
    mutationFn: async (photoURL: string) => {
      console.log("[PHOTO] Saving to database...", photoURL);
      const response = await apiRequest("POST", "/api/photos", {
        photoURL,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload photo");
      }
      
      const data = await response.json();
      console.log("[PHOTO] Success! XP awarded:", data.xpAwarded);
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (data.xpAwarded && uploadPosition) {
        const fakeEvent = {
          currentTarget: {
            getBoundingClientRect: () => ({
              left: uploadPosition.x - 50,
              top: uploadPosition.y,
              width: 100,
              height: 40,
              right: uploadPosition.x + 50,
              bottom: uploadPosition.y + 40,
              x: uploadPosition.x - 50,
              y: uploadPosition.y,
            }),
          },
        };
        showXP(data.xpAwarded, fakeEvent as any);
      }
      toast({
        title: "Photo uploaded!",
        description: "Your progress photo has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const advanceCrewGoalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/goal/advance");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      toast({
        title: "Goal advanced!",
        description: `Crew goal increased to ${data.goal.toLocaleString()} lbs.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to advance crew goal",
        variant: "destructive",
      });
    },
  });

  const crewContributionMutation = useMutation({
    mutationFn: async (contribution: number) => {
      const res = await apiRequest("POST", "/api/crew-challenge/progress", { contribution });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crew-challenge/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crew-challenge/leaderboard"] });
      toast({
        title: "Contribution recorded!",
        description: `You added ${data.userContribution.toLocaleString()} to the crew challenge!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record contribution",
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

  const { user: dashboardUser, challenges, pr, goal, total, hasUploadedToday } = dashboardData as any;
  const leaderboard = homeData?.leaderboard || [];
  
  const xpToNextLevel = getXPToNextLevel(dashboardUser.xp, dashboardUser.level);
  const levelProgress = getLevelProgress(dashboardUser.xp, dashboardUser.level);

  // Determine if user can reroll challenges
  const today = new Date().toISOString().split("T")[0];
  const hasCompletedChallengeToday = challenges.some((c: any) => c.completed);
  const hasRerolledToday = dashboardUser.lastRerollDate === today;
  const canReroll = !hasRerolledToday && !hasCompletedChallengeToday;
  
  // Helper function to get today's date in YYYY-MM-DD format (Central Time)
  const getTodayDate = () => {
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const hasLoggedCaloriesToday = dashboardUser?.lastCalorieLogDate === getTodayDate();
  const hasWeighedInToday = dashboardUser?.lastWeighinDate === getTodayDate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={true}
        username={user?.username}
        isAdmin={user?.isAdmin || false}
        userLevel={user?.level}
        userXP={user?.xp}
        userTitle={user?.title}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        {/* User Info and Avatar */}
        <div className="grid md:grid-cols-[auto_1fr] gap-4 md:gap-6 items-start">
          {/* Avatar Card */}
          <Card className="md:w-auto">
            <CardContent className="pt-4 px-4 pb-6 flex justify-center items-center min-h-[340px]">
              <AvatarWithProgress
                level={dashboardUser.level}
                xp={dashboardUser.xp}
                gender={dashboardUser.gender || "male"}
                skinColor={dashboardUser.skinColor || "light"}
                characterType={dashboardUser.characterType || "classic"}
                shirtColor={dashboardUser.shirtColor || "#FF5722"}
                shortsColor={dashboardUser.shortsColor || "#20B2AA"}
                headband={dashboardUser.headband || false}
                wristbands={dashboardUser.wristbands || false}
                hairStyle={dashboardUser.hairStyle || "short"}
                hairColor={dashboardUser.hairColor || "#8B4513"}
                facialHair={dashboardUser.facialHair || "none"}
                size="md"
                showProgress={true}
              />
            </CardContent>
          </Card>

          {/* User Stats */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 md:gap-3">
              <h1 className="font-display text-2xl md:text-4xl tracking-wider">
                {dashboardUser.username?.toUpperCase()}
              </h1>
              <DisplayNameEditor />
            </div>
            <div>
              <div className="mb-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-0">
                <span className="font-display text-xl md:text-2xl text-primary">{dashboardUser.title}</span>
                <span className="text-sm md:text-base text-muted-foreground sm:ml-3">Level {dashboardUser.level} · {dashboardUser.xp.toLocaleString()} XP</span>
              </div>
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs md:text-sm">
                  <span className="text-muted-foreground">Progress to Level {dashboardUser.level + 1}</span>
                  <span className="text-primary font-semibold">{xpToNextLevel.toLocaleString()} XP to go</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* View Context Switcher */}
        {userCrew?.crew && (
          <div className="flex justify-center">
            <ViewContextSwitcher 
              crewName={userCrew.crew.name}
              gymName="Up North Fitness"
            />
          </div>
        )}

        {/* Gym Combined Total - Only show in gym-wide view */}
        {!isCrewView && <GymTotalCard total={total} />}

        {/* Quick Stats Overview - Only show in crew view */}
        {isCrewView && <QuickStatsWidget />}

        {/* Crew Goal - Only show in crew view */}
        {isCrewView && (
          <CollapsibleSection id="crew-goal" title="Crew Goal">
            <CrewGoalMeter 
              current={total} 
              goal={goal} 
              isAdmin={user?.isAdmin || false}
              onAdvance={() => advanceCrewGoalMutation.mutate()}
            />
          </CollapsibleSection>
        )}

        {/* Daily Actions - Only show in crew view */}
        {isCrewView && (
          <CollapsibleSection id="daily-actions" title="Daily Actions">
          <div className="grid md:grid-cols-2 gap-6">
            <DailyChallenges
              challenges={challenges}
              onComplete={(id, event) => {
                const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                const position = {
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                };
                completeMutation.mutate({ challengeId: id, position });
              }}
              canReroll={canReroll}
              onReroll={() => rerollMutation.mutate()}
              isRerolling={rerollMutation.isPending}
            />
            <CheckInCard
              streak={dashboardUser.streakCount}
              onCheckIn={(event) => {
                const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                const position = {
                  x: rect.left + rect.width / 2,
                  y: rect.top,
                };
                checkinMutation.mutate(position);
              }}
            />
          </div>
          </CollapsibleSection>
        )}

        {/* Tracking - Only show in crew view */}
        {isCrewView && (
          <CollapsibleSection id="tracking" title="Tracking">
            <div className="grid md:grid-cols-2 gap-6">
              <PRTracker
                initialPRs={pr}
                onUpdate={(prs, event) => {
                  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                  const position = {
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  };
                  prMutation.mutate({ prs, position });
                }}
              />
              <div className="space-y-6">
                <WeighInCard
                  currentWeight={dashboardUser.weight}
                  hasWeighedInToday={hasWeighedInToday}
                  onWeighIn={(weight, event) => {
                    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    const position = {
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    };
                    weighinMutation.mutate({ weight, position });
                  }}
                  onEditWeight={(weight) => {
                    editWeighinMutation.mutate({ weight });
                  }}
                />
                <CalorieTrackerCard
                  hasLoggedToday={hasLoggedCaloriesToday}
                  isPending={calorieMutation.isPending}
                  onLogCalories={(calories) => {
                    calorieMutation.mutate({ calories });
                  }}
                />
                {!hasUploadedToday ? (
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={10485760}
                      onGetUploadParameters={async () => {
                        console.log("[PHOTO] Getting upload URL...");
                        const response = await apiRequest("POST", "/api/photos/upload-url");
                        const { uploadURL } = await response.json();
                        console.log("[PHOTO] Got upload URL:", uploadURL);
                        return {
                          method: "PUT" as const,
                          url: uploadURL,
                        };
                      }}
                      onComplete={(result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                        console.log("[PHOTO] Upload complete:", result);
                        if (result.successful && result.successful.length > 0) {
                          const uploadedFile = result.successful[0];
                          const uploadURL = uploadedFile.uploadURL;
                          console.log("[PHOTO] Calling mutation with uploadURL:", uploadURL);
                          if (uploadURL) {
                            photoMutation.mutate(uploadURL);
                          }
                        }
                      }}
                    >
                      <span>📸 Upload Photo</span>
                    </ObjectUploader>
                  ) : (
                    <Card>
                      <CardContent className="flex items-center justify-center p-6">
                        <div className="text-center space-y-2">
                          <div className="text-4xl">✅</div>
                          <div className="font-medium">Photo Uploaded Today!</div>
                          <div className="text-sm text-muted-foreground">Come back tomorrow to upload another</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </div>
          </CollapsibleSection>
        )}

        {/* MVL Race - Always visible */}
        <CollapsibleSection id="mvl-race" title="MVL Race">
          <DailyMVLCard 
            crewId={userCrew?.crewId}
            crewName={userCrew?.crew?.name}
            isCrewView={isCrewView && !!userCrew}
          />
        </CollapsibleSection>

        {/* Weekly MVM - Always visible */}
        <CollapsibleSection id="weekly-mvm" title="Weekly MVM">
          <WeeklyMVMCard />
        </CollapsibleSection>

        {/* Crew Challenge - Only show in crew view */}
        {isCrewView && (
          <CollapsibleSection id="crew-challenge" title="Crew Challenge">
            <CrewChallengeCard
              challengeData={crewChallengeData}
              leaderboard={crewLeaderboard}
              onContribute={(contribution) => crewContributionMutation.mutate(contribution)}
              isSubmitting={crewContributionMutation.isPending}
            />
          </CollapsibleSection>
        )}

        {/* Crew Competitions - Always visible */}
        <CollapsibleSection id="crew-competitions" title="Crew Competitions">
          <CrewCompetitionsCard />
        </CollapsibleSection>

        {/* Leaderboards - Always visible */}
        <CollapsibleSection id="leaderboards" title="Leaderboards">
          <LeaderboardCard users={leaderboard} />
        </CollapsibleSection>
      </main>

      {popup}
    </div>
  );
}
