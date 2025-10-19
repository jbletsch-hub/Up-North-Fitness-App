import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Loader2 } from "lucide-react";

import pic1 from "@assets/stock_images/gym_fitness_workout__e376222d.jpg";
import pic2 from "@assets/stock_images/gym_fitness_workout__942884db.jpg";
import pic3 from "@assets/stock_images/gym_fitness_workout__c2e09a0d.jpg";
import pic4 from "@assets/stock_images/gym_fitness_workout__7d36f53d.jpg";
import pic5 from "@assets/stock_images/gym_fitness_workout__1b255dff.jpg";
import pic6 from "@assets/stock_images/gym_fitness_workout__2d9f0878.jpg";
import pic7 from "@assets/stock_images/gym_fitness_workout__9935598e.jpg";
import pic8 from "@assets/stock_images/gym_fitness_workout__f5bf1886.jpg";
import pic9 from "@assets/stock_images/gym_fitness_workout__0b81e2d1.jpg";
import pic10 from "@assets/stock_images/gym_fitness_workout__a3299a65.jpg";

const PROFILE_PICTURES = [
  { id: "pic1", src: pic1 },
  { id: "pic2", src: pic2 },
  { id: "pic3", src: pic3 },
  { id: "pic4", src: pic4 },
  { id: "pic5", src: pic5 },
  { id: "pic6", src: pic6 },
  { id: "pic7", src: pic7 },
  { id: "pic8", src: pic8 },
  { id: "pic9", src: pic9 },
  { id: "pic10", src: pic10 },
];

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedPicture, setSelectedPicture] = useState(PROFILE_PICTURES[0].id);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/user"],
  });

  const setupMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; profilePicture: string }) => {
      const res = await apiRequest("POST", "/api/profile/setup", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile complete!",
        description: "Welcome to Iron Crew!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your first name",
        variant: "destructive",
      });
      return;
    }

    setupMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profilePicture: selectedPicture,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If profile already complete, redirect
  if ((user as any)?.firstName && (user as any)?.profileImageUrl) {
    setLocation("/");
    return <></>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-display tracking-wider text-center">
            COMPLETE YOUR PROFILE
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Welcome to Iron Crew! Let's set up your profile.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  data-testid="input-first-name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name (optional)"
                  data-testid="input-last-name"
                />
              </div>
            </div>

            {/* Profile picture selector */}
            <div className="space-y-4">
              <Label>Choose Your Profile Picture *</Label>
              <div className="grid grid-cols-5 gap-3">
                {PROFILE_PICTURES.map((pic) => (
                  <button
                    key={pic.id}
                    type="button"
                    onClick={() => setSelectedPicture(pic.id)}
                    className={`relative rounded-lg overflow-hidden hover-elevate active-elevate-2 transition-all ${
                      selectedPicture === pic.id
                        ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-105"
                        : "opacity-70"
                    }`}
                    data-testid={`button-select-${pic.id}`}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={pic.src} alt={`Profile ${pic.id}`} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={setupMutation.isPending}
              data-testid="button-complete-setup"
            >
              {setupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
