import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";

interface WeighInCardProps {
  currentWeight?: number;
  onWeighIn?: (weight: number, event: React.FormEvent) => void;
}

export function WeighInCard({ currentWeight, onWeighIn }: WeighInCardProps) {
  const [weight, setWeight] = useState(currentWeight || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onWeighIn?.(weight, e);
    console.log("Weight saved:", weight);
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          WEIGH-IN
        </CardTitle>
        <p className="text-sm text-muted-foreground">+15 XP per entry</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              placeholder="Enter your weight"
              data-testid="input-weight"
            />
          </div>
          <Button type="submit" className="w-full" data-testid="button-save-weight">
            Save Weight
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
