import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Dumbbell, Target, Trophy, Camera, CheckCircle, Scale, Utensils, Star, Filter } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { AvatarDisplay } from "@/components/AvatarDisplay";

type ActivityFilter = "all" | "pr" | "photo" | "challenge" | "checkin" | "weighin" | "calories" | "goal";

export default function ActivityFeedPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ActivityFilter>("all");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["/api/activity-feed"],
  });

  const formatActivityDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const getActivityIcon = (type: string) => {
    const className = "h-5 w-5";
    switch (type) {
      case "pr":
        return <Dumbbell className={className} />;
      case "challenge":
        return <Target className={className} />;
      case "goal":
        return <Trophy className={className} />;
      case "photo":
        return <Camera className={className} />;
      case "achievement":
        return <Star className={className} />;
      case "checkin":
        return <CheckCircle className={className} />;
      case "weighin":
        return <Scale className={className} />;
      case "calories":
        return <Utensils className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  const filterOptions = [
    { value: "all" as const, label: "All", icon: Filter },
    { value: "pr" as const, label: "PRs", icon: Dumbbell },
    { value: "photo" as const, label: "Photos", icon: Camera },
    { value: "challenge" as const, label: "Challenges", icon: Target },
    { value: "checkin" as const, label: "Check-ins", icon: CheckCircle },
    { value: "weighin" as const, label: "Weigh-ins", icon: Scale },
    { value: "calories" as const, label: "Calories", icon: Utensils },
    { value: "goal" as const, label: "Goals", icon: Trophy },
  ];

  const filteredActivities = activities
    ? (activities as any[]).filter(activity => 
        activeFilter === "all" || activity.type === activeFilter
      )
    : [];

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

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl font-bold">Crew Feed</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            See what everyone's been up to
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                size="sm"
                variant={activeFilter === option.value ? "default" : "outline"}
                onClick={() => setActiveFilter(option.value)}
                className="flex-shrink-0"
                data-testid={`filter-${option.value}`}
              >
                <Icon className="h-4 w-4 mr-1" />
                {option.label}
              </Button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {activeFilter === "all" 
                  ? "No activity yet. Be the first!" 
                  : `No ${filterOptions.find(f => f.value === activeFilter)?.label.toLowerCase()} activities yet`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity: any) => (
              <Card 
                key={activity.id} 
                className="hover-elevate transition-all"
                data-testid={`activity-${activity.id}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      <Link href={`/profile/${activity.username}`}>
                        <div className="cursor-pointer hover-elevate rounded-lg">
                          <AvatarDisplay 
                            level={activity.level || 1}
                            characterType={activity.characterType || "classic"}
                            shirtColor={activity.shirtColor || "#FF5722"}
                            shortsColor={activity.shortsColor || "#20B2AA"}
                            headband={activity.headband || false}
                            wristbands={activity.wristbands || false}
                            hairStyle={activity.hairStyle || "short"}
                            hairColor={activity.hairColor || "#8B4513"}
                            facialHair={activity.facialHair || "none"}
                            size="sm"
                          />
                        </div>
                      </Link>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-1">
                        <Link href={`/profile/${activity.username}`}>
                          <span className="font-semibold hover:text-primary cursor-pointer text-sm md:text-base">
                            {activity.username}
                          </span>
                        </Link>
                        <Badge variant="outline" className="w-fit">
                          <div className="flex items-center gap-1">
                            {getActivityIcon(activity.type)}
                            <span className="text-xs">Lv {activity.level}</span>
                          </div>
                        </Badge>
                        {activity.xpAwarded > 0 && (
                          <Badge className="bg-primary/10 text-primary border-0 w-fit">
                            <Star className="h-3 w-3 mr-1" fill="currentColor" />
                            +{activity.xpAwarded} XP
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm md:text-base text-foreground mb-2">
                        {activity.detail}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatActivityDate(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
