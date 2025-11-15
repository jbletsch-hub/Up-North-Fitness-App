import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
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
import { Users, Crown, Plus, UserPlus, LogOut, Shield, UserMinus, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import type { Crew, CrewMembership } from "@shared/schema";

const createCrewSchema = z.object({
  name: z.string().min(3, "Crew name must be at least 3 characters").max(30, "Crew name must be less than 30 characters"),
  description: z.string().max(200, "Description must be less than 200 characters").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
});

const inviteUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

type CreateCrewForm = z.infer<typeof createCrewSchema>;
type InviteUserForm = z.infer<typeof inviteUserSchema>;

type MemberWithDetails = CrewMembership & {
  username: string;
  displayName: string | null;
  level: number;
  characterType: string;
};

type UserCrewResponse = (CrewMembership & { crew: Crew }) | null;

type CrewInvite = {
  id: string;
  crewId: string;
  userId: string;
  invitedBy: string;
  status: string;
  createdAt: string;
  crew: Crew;
  inviterUsername: string;
};

export default function CrewsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

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

  const { data: myInvites, isLoading: isLoadingInvites } = useQuery<CrewInvite[]>({
    queryKey: ["/api/crews/invites/my-invites"],
  });

  const createCrewMutation = useMutation({
    mutationFn: async (data: CreateCrewForm) => {
      return await apiRequest("POST", "/api/crews", data);
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

  const updateCrewMutation = useMutation({
    mutationFn: async (data: CreateCrewForm) => {
      return await apiRequest("PUT", `/api/crews/${userCrew?.crewId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crews/my-crew"] });
      setEditDialogOpen(false);
      toast({ title: "Crew updated!", description: "Your crew details have been updated." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update crew", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const leaveCrewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/crews/leave");
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

  const inviteUserMutation = useMutation({
    mutationFn: async (data: InviteUserForm) => {
      return await apiRequest("POST", `/api/crews/${userCrew?.crewId}/invite`, data);
    },
    onSuccess: () => {
      setInviteDialogOpen(false);
      inviteForm.reset();
      toast({ title: "Invite sent!", description: "The user has been invited to your crew." });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to send invite", 
        description: error.message || "Something went wrong",
        variant: "destructive" 
      });
    },
  });

  const respondToInviteMutation = useMutation({
    mutationFn: async ({ inviteId, action }: { inviteId: string; action: 'accept' | 'decline' }) => {
      return await apiRequest("POST", `/api/crews/invites/${inviteId}/${action}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/crews/invites/my-invites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/crews/my-crew"] });
      if (variables.action === 'accept') {
        toast({ title: "Joined crew!", description: "You've joined the crew." });
      } else {
        toast({ title: "Invite declined", description: "You've declined the invite." });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to respond to invite", 
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

  const editForm = useForm<CreateCrewForm>({
    resolver: zodResolver(createCrewSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
    },
  });

  const inviteForm = useForm<InviteUserForm>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      username: "",
    },
  });

  // Update edit form when crew data changes or dialog opens
  useEffect(() => {
    if (editDialogOpen && userCrew?.crew) {
      editForm.reset({
        name: userCrew.crew.name,
        description: userCrew.crew.description || "",
        color: userCrew.crew.color,
      });
    }
  }, [editDialogOpen, userCrew, editForm]);

  const onSubmit = (data: CreateCrewForm) => {
    createCrewMutation.mutate(data);
  };

  const onEditSubmit = (data: CreateCrewForm) => {
    updateCrewMutation.mutate(data);
  };

  const onInviteSubmit = (data: InviteUserForm) => {
    inviteUserMutation.mutate(data);
  };

  const isLeader = userCrew?.role === "leader";

  if (isLoadingUserCrew || isLoadingAllCrews) {
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
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6">
          <div className="text-muted-foreground">Loading crews...</div>
        </main>
      </div>
    );
  }

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
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-6">
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

      {/* Edit Crew Dialog */}
      {isLeader && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Crew Details</DialogTitle>
              <DialogDescription>
                Update your crew's name, description, and color.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crew Name</FormLabel>
                      <FormControl>
                        <Input placeholder="The Iron Warriors" {...field} data-testid="input-edit-crew-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your crew's goals and vibe..." 
                          {...field} 
                          data-testid="textarea-edit-crew-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crew Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input type="color" {...field} className="w-20 h-10" data-testid="input-edit-crew-color" />
                          <Input type="text" {...field} placeholder="#3B82F6" data-testid="input-edit-crew-color-hex" />
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
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} data-testid="button-cancel-edit">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateCrewMutation.isPending} data-testid="button-submit-edit">
                    {updateCrewMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      {/* Pending Invites */}
      {!userCrew && myInvites && myInvites.length > 0 && (
        <Card data-testid="card-pending-invites">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Crew Invitations
            </CardTitle>
            <CardDescription>You have pending crew invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myInvites.map((invite) => (
                <div 
                  key={invite.id} 
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border"
                  data-testid={`invite-${invite.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: invite.crew.color }} />
                    <div>
                      <div className="font-medium">{invite.crew.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Invited by {invite.inviterUsername}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondToInviteMutation.mutate({ inviteId: invite.id, action: 'accept' })}
                      disabled={respondToInviteMutation.isPending}
                      data-testid={`button-accept-${invite.id}`}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToInviteMutation.mutate({ inviteId: invite.id, action: 'decline' })}
                      disabled={respondToInviteMutation.isPending}
                      data-testid={`button-decline-${invite.id}`}
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
              <div className="flex gap-2">
                {isLeader && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                    data-testid="button-edit-crew"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
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
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-invite-members">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Members
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Member to {userCrew?.crew.name}</DialogTitle>
                        <DialogDescription>
                          Enter the username of the person you want to invite to your crew.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...inviteForm}>
                        <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-4">
                          <FormField
                            control={inviteForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter username" {...field} data-testid="input-invite-username" />
                                </FormControl>
                                <FormDescription>
                                  The user will receive an invitation to join your crew
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)} data-testid="button-cancel-invite">
                              Cancel
                            </Button>
                            <Button type="submit" disabled={inviteUserMutation.isPending} data-testid="button-submit-invite">
                              {inviteUserMutation.isPending ? "Sending..." : "Send Invite"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
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
      </main>
    </div>
  );
}
