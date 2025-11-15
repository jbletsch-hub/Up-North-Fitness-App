import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Trophy, Camera, Activity, TrendingUp, Target, Scale } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (settings: Record<string, boolean>) => {
      return await apiRequest("POST", "/api/user/privacy-settings", settings);
    },
    onSuccess: () => {
      // Force immediate refetch to update UI
      queryClient.refetchQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Privacy Updated",
        description: "Your privacy settings have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (field: string, value: boolean) => {
    updatePrivacyMutation.mutate({ [field]: value });
  };

  const privacyOptions = [
    {
      field: "showPRs",
      icon: Trophy,
      title: "Personal Records",
      description: "Squat, bench, and deadlift numbers",
    },
    {
      field: "showPhotos",
      icon: Camera,
      title: "Progress Photos",
      description: "Your uploaded transformation photos",
    },
    {
      field: "showActivities",
      icon: Activity,
      title: "Activity Feed",
      description: "Recent workouts and achievements",
    },
    {
      field: "showStats",
      icon: TrendingUp,
      title: "Stats & Analytics",
      description: "XP trends, check-in calendar, PR progression",
    },
    {
      field: "showGoals",
      icon: Target,
      title: "Goals",
      description: "Weekly and lifetime fitness goals",
    },
    {
      field: "showMetrics",
      icon: Scale,
      title: "Body Metrics",
      description: "Weight and calorie tracking",
    },
  ];

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

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl tracking-wider">PRIVACY SETTINGS</h1>
          </div>
          <p className="text-muted-foreground">
            Control what parts of your profile others can see. Crew members always see everything.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {privacyOptions.map((option) => {
              const Icon = option.icon;
              const isEnabled = userData?.[option.field as keyof typeof userData] !== false;
              
              return (
                <Card key={option.field} className="border-card-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={option.field} className="text-base font-semibold cursor-pointer">
                            {option.title}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {option.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right min-w-[60px]">
                          <span className={`text-sm font-medium ${isEnabled ? 'text-muted-foreground' : 'text-primary'}`}>
                            Private
                          </span>
                        </div>
                        <Switch
                          id={option.field}
                          checked={isEnabled}
                          onCheckedChange={(checked) => handleToggle(option.field, checked)}
                          disabled={updatePrivacyMutation.isPending}
                          data-testid={`switch-${option.field.toLowerCase().replace(/([A-Z])/g, '-$1')}`}
                        />
                        <div className="min-w-[60px]">
                          <span className={`text-sm font-medium ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`}>
                            Public
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              These privacy settings control what non-crew members can see on your profile. 
              Your crew members will always be able to see your full profile regardless of these settings.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
