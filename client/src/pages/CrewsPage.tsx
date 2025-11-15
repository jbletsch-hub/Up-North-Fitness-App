import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Crown, Plus, UserPlus, LogOut, Shield, UserMinus } from "lucide-react";
import { useState } from "react";
import type { Crew, CrewMembership } from "@shared/schema";

const createCrewSchema = z.object({
  name: z.string().min(3, "Crew name must be at least 3 characters").max(30, "Crew name must be less than 30 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

type CreateCrewForm = z.infer<typeof createCrewSchema>;

type MemberWithDetails = CrewMembership & {
  username: string;
  displayName: string | null;
  level: number;
  characterType: string;
};

type UserCrewResponse = (CrewMembership & { crew: Crew }) | null;

export default function CrewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: userCrew, isLoading: isLoadingUserCrew } = useQuery<UserCrewResponse>({
    queryKey: ["/api/crews/my-crew"],
  });

  const { data: allCrews, isLoading: isLoadingAllCrews } = useQuery<Crew[]>({
    queryKey: ["/api/crews"],
  });

  const { data: crewMembers, isLoading: isLoadingMembers } = useQuery<MemberWithDetails[]>({
    queryKey: ["/api/crews", userCrew?.crewId, "members"],
    enabled: !!userCrew?.crewId,
  });

  const createCrewMutation = useMutation({
    mutationFn: async (data: CreateCrewForm) => {
      return await apiRequest("/api/crews", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crews/my-crew"] });
      setCreateDialogOpen(false);
      toast({ title: "Crew created!", description: "You are now the leader of your crew." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create crew", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const leaveCrewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/crews/leave", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crews/my-crew"] });
      toast({ title: "Left crew", description: "You've left your crew." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to leave crew", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const form = useForm<CreateCrewForm>({
    resolver: zodResolver(createCrewSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
    },
  });

  const onSubmit = (data: CreateCrewForm) => {
    createCrewMutation.mutate(data);
  };

  const isLeader = userCrew?.role === "leader";

  if (isLoadingUserCrew || isLoadingAllCrews) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="text-muted-foreground">Loading crews...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Crews</h1>
          <p className="text-muted-foreground">Join or create a crew to compete together</p>
        </div>
        {!userCrew && (
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-crew">
                <Plus className="w-4 h-4 mr-2" />
                Create Crew
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Crew</DialogTitle>
                <DialogDescription>
                  Start your own crew and invite members to join.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crew Name</FormLabel>
                        <FormControl>
                          <Input placeholder="The Iron Warriors" {...field} data-testid="input-crew-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your crew's goals and vibe..." 
                            {...field} 
                            data-testid="textarea-crew-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Crew Color</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Input type="color" {...field} className="w-20 h-10" data-testid="input-crew-color" />
                            <Input type="text" {...field} placeholder="#3B82F6" data-testid="input-crew-color-hex" />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Choose a color to represent your crew
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-create">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCrewMutation.isPending} data-testid="button-submit-create">
                      {createCrewMutation.isPending ? "Creating..." : "Create Crew"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {userCrew && (
        <Card data-testid="card-my-crew">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: userCrew.crew.color }} />
                  {userCrew.crew.name}
                  {isLeader && (
                    <Badge variant="default" className="ml-2">
                      <Crown className="w-3 h-3 mr-1" />
                      Leader
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{userCrew.crew.description || "No description"}</CardDescription>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => leaveCrewMutation.mutate()}
                disabled={leaveCrewMutation.isPending}
                data-testid="button-leave-crew"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Members ({crewMembers?.length || 0})
                </h3>
                {isLoadingMembers ? (
                  <div className="text-sm text-muted-foreground">Loading members...</div>
                ) : (
                  <div className="space-y-2">
                    {crewMembers?.map((member) => (
                      <div 
                        key={member.id} 
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        data-testid={`member-${member.userId}`}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">
                              {member.displayName || member.username}
                              {member.userId === user?.id && (
                                <Badge variant="outline" className="ml-2">You</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Level {member.level} • {member.characterType}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.role === "leader" && (
                            <Badge variant="default">
                              <Crown className="w-3 h-3 mr-1" />
                              Leader
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isLeader && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" data-testid="button-invite-members">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Members
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-manage-crew">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Crew
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!userCrew && (
        <div>
          <h2 className="text-2xl font-bold mb-4">All Crews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCrews?.map((crew) => (
              <Card key={crew.id} className="hover-elevate cursor-pointer" data-testid={`crew-card-${crew.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: crew.color }} />
                    {crew.name}
                  </CardTitle>
                  <CardDescription>{crew.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Click to view details
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
