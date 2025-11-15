import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Users } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/user'],
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: async (isProfilePrivate: boolean) => {
      const res = await apiRequest("POST", "/api/user/privacy-settings", { isProfilePrivate });
      return await res.json();
    },
    onSuccess: (data: any) => {
      if (data.user) {
        queryClient.setQueryData(['/api/user'], data.user);
      }
      toast({
        title: "Privacy Updated",
        description: data.user?.isProfilePrivate 
          ? "Your profile is now private" 
          : "Your profile is now public",
      });
    },
    onError: (error: any) => {
      console.error("Privacy settings error:", error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (value: boolean) => {
    updatePrivacyMutation.mutate(value);
  };

  const isPrivate = (userData as any)?.isProfilePrivate ?? false;

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

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-6 pb-20 md:pb-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Lock className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl tracking-wider">PRIVACY SETTINGS</h1>
          </div>
          <p className="text-muted-foreground">
            Control who can see your profile information
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="font-display text-xl">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="border-card-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Profile Privacy
                </CardTitle>
                <CardDescription>
                  Choose whether your profile is public or private
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-card-border bg-card/50">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {isPrivate ? (
                        <EyeOff className="h-6 w-6 text-primary" />
                      ) : (
                        <Eye className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="privacy-toggle" className="text-base font-semibold cursor-pointer">
                        {isPrivate ? "Private Profile" : "Public Profile"}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isPrivate 
                          ? "Only your crew members can see your full profile"
                          : "Everyone in the gym can see your full profile"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right min-w-[60px]">
                      <span className={`text-sm font-medium ${!isPrivate ? 'text-muted-foreground' : 'text-primary'}`}>
                        Private
                      </span>
                    </div>
                    <Switch
                      id="privacy-toggle"
                      checked={!isPrivate}
                      onCheckedChange={(checked) => handleToggle(!checked)}
                      disabled={updatePrivacyMutation.isPending}
                      data-testid="switch-profile-privacy"
                    />
                    <div className="min-w-[60px]">
                      <span className={`text-sm font-medium ${!isPrivate ? 'text-primary' : 'text-muted-foreground'}`}>
                        Public
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  What Others See
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      <h3 className="font-semibold text-sm">Public Profile</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Everyone sees: Name, crew, level, PRs, photos, activities, stats, goals, and body metrics
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <EyeOff className="h-4 w-4 text-orange-600" />
                      <h3 className="font-semibold text-sm">Private Profile</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Non-crew members see: Name, crew, and level only
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-sm">Crew Members</h3>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      Your crew always sees your full profile regardless of privacy setting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
