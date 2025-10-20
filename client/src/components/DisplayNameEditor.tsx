import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit } from "lucide-react";

export function DisplayNameEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<"name" | "username" | "custom">("username");
  const [customName, setCustomName] = useState("");

  const updateMutation = useMutation({
    mutationFn: async (displayName: string) => {
      const res = await apiRequest("POST", "/api/profile/display-name", {
        displayName,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/home"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Display name updated!",
        description: "Your leaderboard name has been updated.",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update display name",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    let displayName = "";
    
    if (option === "name") {
      const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
      displayName = fullName || user?.username || "";
    } else if (option === "username") {
      displayName = user?.username || "";
    } else {
      displayName = customName.trim();
    }

    if (!displayName) {
      toast({
        title: "Error",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate(displayName);
  };

  const getCurrentDisplayName = () => {
    if (user?.displayName) {
      return user.displayName;
    }
    return user?.username || "Not set";
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-edit-display-name">
          <Edit className="h-4 w-4 mr-2" />
          Edit Display Name
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Leaderboard Display Name</DialogTitle>
          <DialogDescription>
            Choose how your name appears on the leaderboard.
            <br />
            Currently showing: <strong>{getCurrentDisplayName()}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={option} onValueChange={(value: any) => setOption(value)}>
            {fullName && (
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name" id="name" data-testid="radio-use-name" />
                <Label htmlFor="name" className="font-normal cursor-pointer">
                  Use my name: <strong>{fullName}</strong>
                </Label>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="username" id="username" data-testid="radio-use-username" />
              <Label htmlFor="username" className="font-normal cursor-pointer">
                Use my username: <strong>{user?.username}</strong>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" data-testid="radio-use-custom" />
              <Label htmlFor="custom" className="font-normal cursor-pointer">
                Custom name
              </Label>
            </div>
          </RadioGroup>

          {option === "custom" && (
            <div className="ml-6 mt-2">
              <Input
                id="customName"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter custom display name"
                maxLength={50}
                data-testid="input-custom-display-name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customName.length}/50 characters
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            data-testid="button-save-display-name"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
