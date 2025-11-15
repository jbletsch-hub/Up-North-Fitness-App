import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { AvatarDisplay } from "./AvatarDisplay";

interface CrewChallengeData {
  active: boolean;
  challenge?: {
    id: string;
    text: string;
    description: string;
    targetValue: number;
    unit: string;
  };
  weekStart: string;
  totalProgress: number;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  displayName: string | null;
  contribution: number;
  characterType: string;
  level: number;
  gender?: string;
  skinColor?: string;
  shirtColor?: string;
  shortsColor?: string;
  hairStyle?: string;
  hairColor?: string;
  headband?: boolean;
  wristbands?: boolean;
  facialHair?: string;
}

interface CrewChallengeCardProps {
  challengeData: CrewChallengeData | null;
  leaderboard: LeaderboardEntry[];
  onContribute?: (contribution: number) => void;
  isSubmitting?: boolean;
}

export function CrewChallengeCard({ 
  challengeData, 
  leaderboard,
  onContribute,
  isSubmitting = false
}: CrewChallengeCardProps) {
  const [contributionInput, setContributionInput] = useState("");

  if (!challengeData || !challengeData.active || !challengeData.challenge) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            CREW CHALLENGE
          </CardTitle>
          <CardDescription>No active crew challenge this week</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { challenge, totalProgress } = challengeData;
  const progressPercent = Math.min((totalProgress / challenge.targetValue) * 100, 100);
  const isCompleted = totalProgress >= challenge.targetValue;

  const handleSubmit = () => {
    const value = parseInt(contributionInput);
    if (value > 0 && onContribute) {
      onContribute(value);
      setContributionInput("");
    }
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          CREW CHALLENGE
        </CardTitle>
        <CardDescription className="text-base">{challenge.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Challenge Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg tracking-wide">{challenge.text}</h3>
            {isCompleted && (
              <Badge className="bg-chart-3 text-white border-0">
                <Trophy className="h-3 w-3 mr-1" />
                COMPLETE
              </Badge>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Crew Progress</span>
              <span className="font-semibold">
                {totalProgress.toLocaleString()} / {challenge.targetValue.toLocaleString()} {challenge.unit}
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {progressPercent.toFixed(1)}% Complete
            </p>
          </div>
        </div>

        {/* Contribution Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Add Your Contribution</label>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={contributionInput}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setContributionInput(value);
              }}
              placeholder={`Enter ${challenge.unit}...`}
              className="flex-1"
              data-testid="input-crew-contribution"
            />
            <Button
              onClick={handleSubmit}
              disabled={!contributionInput || parseInt(contributionInput) <= 0 || isSubmitting}
              data-testid="button-submit-crew-contribution"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
        </div>

        {/* Top Contributors */}
        {leaderboard.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-display text-sm tracking-wide text-muted-foreground">TOP CONTRIBUTORS</h3>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.userId}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg border border-border"
                  data-testid={`crew-leaderboard-${entry.userId}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-muted-foreground w-4">
                      #{index + 1}
                    </span>
                    <AvatarDisplay
                      characterType={entry.characterType}
                      level={entry.level}
                      gender={entry.gender || "male"}
                      skinColor={entry.skinColor || "#FFCC99"}
                      shirtColor={entry.shirtColor}
                      shortsColor={entry.shortsColor}
                      hairStyle={entry.hairStyle}
                      hairColor={entry.hairColor}
                      headband={entry.headband}
                      wristbands={entry.wristbands}
                      facialHair={entry.facialHair}
                      size="sm"
                    />
                    <span className="font-medium">
                      {entry.displayName || entry.username}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {entry.contribution.toLocaleString()} {challenge.unit}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
