import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface PRs {
  squat: number;
  bench: number;
  deadlift: number;
}

interface PRTrackerProps {
  initialPRs: PRs;
  onUpdate?: (prs: PRs, event: React.FormEvent) => void;
}

export function PRTracker({ initialPRs, onUpdate }: PRTrackerProps) {
  const [squat, setSquat] = useState<string>(initialPRs.squat.toString());
  const [bench, setBench] = useState<string>(initialPRs.bench.toString());
  const [deadlift, setDeadlift] = useState<string>(initialPRs.deadlift.toString());

  // Update inputs when initialPRs prop changes
  useEffect(() => {
    setSquat(initialPRs.squat.toString());
    setBench(initialPRs.bench.toString());
    setDeadlift(initialPRs.deadlift.toString());
  }, [initialPRs]);

  const squatNum = parseInt(squat) || 0;
  const benchNum = parseInt(bench) || 0;
  const deadliftNum = parseInt(deadlift) || 0;
  const total = squatNum + benchNum + deadliftNum;

  const hasChanged = 
    squatNum !== initialPRs.squat || 
    benchNum !== initialPRs.bench || 
    deadliftNum !== initialPRs.deadlift;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prs = {
      squat: squatNum,
      bench: benchNum,
      deadlift: deadliftNum,
    };
    onUpdate?.(prs, e);
    console.log("PRs updated:", prs);
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          PR TRACKER
        </CardTitle>
        <p className="text-sm text-muted-foreground">+10 XP once per day</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="squat">Squat (lbs)</Label>
              <Input
                id="squat"
                type="number"
                value={squat}
                onChange={(e) => setSquat(e.target.value)}
                data-testid="input-squat"
              />
            </div>
            <div>
              <Label htmlFor="bench">Bench (lbs)</Label>
              <Input
                id="bench"
                type="number"
                value={bench}
                onChange={(e) => setBench(e.target.value)}
                data-testid="input-bench"
              />
            </div>
            <div>
              <Label htmlFor="deadlift">Deadlift (lbs)</Label>
              <Input
                id="deadlift"
                type="number"
                value={deadlift}
                onChange={(e) => setDeadlift(e.target.value)}
                data-testid="input-deadlift"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-display text-2xl text-primary">{total} lbs</span>
            </div>
            {hasChanged && (
              <p className="text-xs text-muted-foreground mb-2 text-center">
                Previous total: {initialPRs.squat + initialPRs.bench + initialPRs.deadlift} lbs
              </p>
            )}
            <Button type="submit" className="w-full" data-testid="button-update-prs">
              {hasChanged ? "Update PRs" : "Save PRs"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
