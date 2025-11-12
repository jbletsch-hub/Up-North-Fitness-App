import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { AvatarDisplay } from "@/components/AvatarDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Palette, User } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CHARACTER_TYPES = [
  { id: "classic", name: "Classic", description: "Balanced build" },
  { id: "athletic", name: "Athletic", description: "Lean and agile" },
  { id: "powerlifter", name: "Powerlifter", description: "Stocky and strong" },
  { id: "runner", name: "Runner", description: "Slim and fast" },
  { id: "boxer", name: "Boxer", description: "Compact fighter" },
];

const SHIRT_COLORS = [
  { name: "Orange-Red", value: "#FF5722" },
  { name: "Red", value: "#E74C3C" },
  { name: "Blue", value: "#3498DB" },
  { name: "Green", value: "#27AE60" },
  { name: "Purple", value: "#9B59B6" },
  { name: "Black", value: "#2C3E50" },
];

const SHORTS_COLORS = [
  { name: "Teal", value: "#20B2AA" },
  { name: "Navy", value: "#1E3A8A" },
  { name: "Black", value: "#1F2937" },
  { name: "Gray", value: "#6B7280" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#16A34A" },
];

const HAIR_STYLES = [
  { id: "bald", name: "Bald", description: "No hair" },
  { id: "buzzcut", name: "Buzzcut", description: "Very short" },
  { id: "short", name: "Short", description: "Classic short cut" },
  { id: "medium", name: "Medium", description: "Medium length" },
  { id: "long", name: "Long", description: "Long flowing hair" },
  { id: "curly", name: "Curly", description: "Curly afro style" },
  { id: "spiky", name: "Spiky", description: "Spiky anime style" },
];

const HAIR_COLORS = [
  { name: "Brown", value: "#4A3728" },
  { name: "Black", value: "#1A1A1A" },
  { name: "Blonde", value: "#F4E4C1" },
  { name: "Red", value: "#B85C4E" },
  { name: "Gray", value: "#9CA3AF" },
  { name: "White", value: "#E5E7EB" },
];

export default function AvatarPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [characterType, setCharacterType] = useState(user?.characterType || "classic");
  const [shirtColor, setShirtColor] = useState(user?.shirtColor || "#FF5722");
  const [shortsColor, setShortsColor] = useState(user?.shortsColor || "#20B2AA");
  const [headband, setHeadband] = useState(user?.headband || false);
  const [wristbands, setWristbands] = useState(user?.wristbands || false);
  const [hairStyle, setHairStyle] = useState(user?.hairStyle || "short");
  const [hairColor, setHairColor] = useState(user?.hairColor || "#8B4513");

  const saveAvatarMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", "/api/avatar", {
        characterType,
        shirtColor,
        shortsColor,
        headband,
        wristbands,
        hairStyle,
        hairColor,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Avatar saved!",
        description: "Your custom avatar has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save avatar",
        variant: "destructive",
      });
    },
  });

  const getMuscleStageInfo = (level: number) => {
    const stage = Math.min(Math.floor((level - 1) / 5), 9);
    const stageNames = [
      "Skinny Beginner",
      "Starting to Tone",
      "Getting Defined",
      "Noticeable Gains",
      "Solid Build",
      "Impressive Physique",
      "Beast Mode",
      "Hulk-Like",
      "Olympian",
      "Absolute Unit"
    ];
    return { stage: stage + 1, name: stageNames[stage] };
  };

  const muscleInfo = getMuscleStageInfo(user?.level || 1);

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

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 pb-20 md:pb-6 space-y-4 md:space-y-6">
        <div className="text-center space-y-1 md:space-y-2">
          <div className="flex items-center justify-center gap-2">
            <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-5xl font-bold">Your Avatar</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Customize your fitness warrior
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* Preview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Live Preview
              </CardTitle>
              <CardDescription>
                Level {user?.level || 1} - {muscleInfo.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <AvatarDisplay
                level={user?.level || 1}
                characterType={characterType}
                shirtColor={shirtColor}
                shortsColor={shortsColor}
                headband={headband}
                wristbands={wristbands}
                hairStyle={hairStyle}
                hairColor={hairColor}
                size="lg"
                enableRotation={true}
              />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold">Muscle Stage {muscleInfo.stage}/10</p>
                <p className="text-xs text-muted-foreground">
                  Keep leveling up to get more jacked!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Customization Section */}
          <div className="space-y-4">
            {/* Character Type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Character Type</CardTitle>
                <CardDescription>Choose your build style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {CHARACTER_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      variant={characterType === type.id ? "default" : "outline"}
                      className="h-auto flex-col gap-1 py-3"
                      onClick={() => setCharacterType(type.id)}
                      data-testid={`button-character-${type.id}`}
                    >
                      <span className="font-semibold text-sm">{type.name}</span>
                      <span className="text-xs opacity-80">{type.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Shirt Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {SHIRT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`h-10 w-10 rounded-md border-2 transition-all hover-elevate ${
                          shirtColor === color.value ? "border-primary ring-2 ring-primary" : "border-border"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setShirtColor(color.value)}
                        title={color.name}
                        data-testid={`button-shirt-${color.name.toLowerCase()}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shorts Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {SHORTS_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`h-10 w-10 rounded-md border-2 transition-all hover-elevate ${
                          shortsColor === color.value ? "border-primary ring-2 ring-primary" : "border-border"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setShortsColor(color.value)}
                        title={color.name}
                        data-testid={`button-shorts-${color.name.toLowerCase()}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hair Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hair Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {HAIR_STYLES.map((style) => (
                      <Button
                        key={style.id}
                        variant={hairStyle === style.id ? "default" : "outline"}
                        className="h-auto flex-col gap-1 py-2"
                        onClick={() => setHairStyle(style.id)}
                        data-testid={`button-hair-${style.id}`}
                      >
                        <span className="font-semibold text-xs">{style.name}</span>
                        <span className="text-xs opacity-70">{style.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Hair Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {HAIR_COLORS.map((color) => (
                      <button
                        key={color.value}
                        className={`h-10 w-10 rounded-md border-2 transition-all hover-elevate ${
                          hairColor === color.value ? "border-primary ring-2 ring-primary" : "border-border"
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setHairColor(color.value)}
                        title={color.name}
                        data-testid={`button-hair-color-${color.name.toLowerCase()}`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accessories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accessories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="headband" className="flex-1">Headband</Label>
                  <Switch
                    id="headband"
                    checked={headband}
                    onCheckedChange={setHeadband}
                    data-testid="switch-headband"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="wristbands" className="flex-1">Wristbands</Label>
                  <Switch
                    id="wristbands"
                    checked={wristbands}
                    onCheckedChange={setWristbands}
                    data-testid="switch-wristbands"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              className="w-full"
              size="lg"
              onClick={() => saveAvatarMutation.mutate()}
              disabled={saveAvatarMutation.isPending}
              data-testid="button-save-avatar"
            >
              {saveAvatarMutation.isPending ? "Saving..." : "Save Avatar"}
            </Button>
          </div>
        </div>

        {/* Visual Progression Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Progression Preview</CardTitle>
            <CardDescription>See how your avatar transforms from Level 1 to Level 50</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 6, 11, 16, 21, 26, 31, 36, 41, 46].map((level, idx) => {
                const stageInfo = getMuscleStageInfo(level);
                return (
                  <div key={level} className="flex flex-col items-center space-y-2">
                    <AvatarDisplay
                      level={level}
                      characterType={characterType}
                      shirtColor={shirtColor}
                      shortsColor={shortsColor}
                      headband={headband}
                      wristbands={wristbands}
                      hairStyle={hairStyle}
                      hairColor={hairColor}
                      size="sm"
                    />
                    <div className="text-center">
                      <div className="text-xs font-semibold">Stage {idx + 1}</div>
                      <div className="text-xs text-muted-foreground">Lv {level}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Muscle Progression Info */}
        <Card>
          <CardHeader>
            <CardTitle>Muscle Progression System</CardTitle>
            <CardDescription>How your avatar gets jacked as you level up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 text-xs md:text-sm">
              <div className="text-center p-2 rounded-md bg-secondary/30">
                <div className="font-semibold">Lv 1-5</div>
                <div className="text-muted-foreground">Skinny</div>
              </div>
              <div className="text-center p-2 rounded-md bg-secondary/40">
                <div className="font-semibold">Lv 6-10</div>
                <div className="text-muted-foreground">Toning</div>
              </div>
              <div className="text-center p-2 rounded-md bg-secondary/50">
                <div className="font-semibold">Lv 11-20</div>
                <div className="text-muted-foreground">Defined</div>
              </div>
              <div className="text-center p-2 rounded-md bg-secondary/60">
                <div className="font-semibold">Lv 21-35</div>
                <div className="text-muted-foreground">Muscular</div>
              </div>
              <div className="text-center p-2 rounded-md bg-primary/20 col-span-2 md:col-span-1">
                <div className="font-semibold">Lv 36-50</div>
                <div className="text-primary font-bold">JACKED</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
