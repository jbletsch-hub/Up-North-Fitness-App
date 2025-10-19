import { useState } from "react";
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
  const [prs, setPRs] = useState(initialPRs);

  const total = prs.squat + prs.bench + prs.deadlift;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <p className="text-sm text-muted-foreground">+10 XP per day</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <Label htmlFor="squat">Squat (lbs)</Label>
              <Input
                id="squat"
                type="number"
                value={prs.squat}
                onChange={(e) => setPRs({ ...prs, squat: parseInt(e.target.value) || 0 })}
                data-testid="input-squat"
              />
            </div>
            <div>
              <Label htmlFor="bench">Bench (lbs)</Label>
              <Input
                id="bench"
                type="number"
                value={prs.bench}
                onChange={(e) => setPRs({ ...prs, bench: parseInt(e.target.value) || 0 })}
                data-testid="input-bench"
              />
            </div>
            <div>
              <Label htmlFor="deadlift">Deadlift (lbs)</Label>
              <Input
                id="deadlift"
                type="number"
                value={prs.deadlift}
                onChange={(e) => setPRs({ ...prs, deadlift: parseInt(e.target.value) || 0 })}
                data-testid="input-deadlift"
              />
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-display text-2xl text-primary">{total} lbs</span>
            </div>
            <Button type="submit" className="w-full" data-testid="button-update-prs">
              Update PRs
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
