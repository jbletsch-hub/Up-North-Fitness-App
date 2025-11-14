import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";

interface WeighInCardProps {
  currentWeight?: number;
  hasWeighedInToday?: boolean;
  onWeighIn?: (weight: number, event: React.FormEvent) => void;
  onEditWeight?: (weight: number, event: React.FormEvent) => void;
}

export function WeighInCard({ currentWeight, hasWeighedInToday, onWeighIn, onEditWeight }: WeighInCardProps) {
  const [weight, setWeight] = useState<string>(currentWeight?.toString() || '');

  // Update input when currentWeight prop changes
  useEffect(() => {
    if (currentWeight) {
      setWeight(currentWeight.toString());
    }
  }, [currentWeight]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightValue = parseFloat(weight) || 0;
    
    if (hasWeighedInToday) {
      onEditWeight?.(weightValue, e);
    } else {
      onWeighIn?.(weightValue, e);
    }
  };

  const hasChanged = currentWeight && parseFloat(weight) !== currentWeight;
  const buttonText = hasWeighedInToday 
    ? (hasChanged ? "Edit Weight" : "Weight Saved") 
    : "Weigh In";

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          WEIGH-IN
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {hasWeighedInToday ? "Edit your weight (no XP)" : "+15 XP if weight changes"}
        </p>
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
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter your weight"
              data-testid="input-weight"
            />
            {currentWeight && (
              <p className="text-xs text-muted-foreground mt-1">
                Current: {currentWeight} lbs
              </p>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!hasChanged && hasWeighedInToday}
            data-testid="button-save-weight"
          >
            {buttonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
