import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

interface PRComparisonProps {
  userId: string;
  squat: number;
  bench: number;
  deadlift: number;
}

export function PRComparison({ userId, squat, bench, deadlift }: PRComparisonProps) {
  const { data: comparisonData } = useQuery({
    queryKey: ["/api/pr-comparison", userId],
  });

  if (!comparisonData) {
    return null;
  }

  const { gymAverages, percentiles, topLifters } = comparisonData as any;
  const total = squat + bench + deadlift;
  const avgTotal = (gymAverages?.squat || 0) + (gymAverages?.bench || 0) + (gymAverages?.deadlift || 0);

  const lifts = [
    {
      name: "Squat",
      value: squat,
      average: gymAverages?.squat || 0,
      percentile: percentiles?.squat || 0,
      color: "bg-blue-500"
    },
    {
      name: "Bench",
      value: bench,
      average: gymAverages?.bench || 0,
      percentile: percentiles?.bench || 0,
      color: "bg-yellow-500"
    },
    {
      name: "Deadlift",
      value: deadlift,
      average: gymAverages?.deadlift || 0,
      percentile: percentiles?.deadlift || 0,
      color: "bg-red-500"
    },
    {
      name: "Total",
      value: total,
      average: avgTotal,
      percentile: percentiles?.total || 0,
      color: "bg-primary"
    }
  ];

  return (
    <Card data-testid="card-pr-comparison">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          PR Comparison
        </CardTitle>
        <CardDescription>See how your lifts compare to the gym</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lift Comparisons */}
        <div className="space-y-4">
          {lifts.map((lift) => (
            <div key={lift.name} className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold text-sm">{lift.name}</span>
                <div className="flex items-baseline gap-3 text-xs">
                  <span className="text-muted-foreground">
                    You: <span className="font-semibold text-foreground">{lift.value} lbs</span>
                  </span>
                  <span className="text-muted-foreground">
                    Avg: <span className="font-semibold text-foreground">{Math.round(lift.average)} lbs</span>
                  </span>
                </div>
              </div>
              
              {/* Percentile Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Percentile</span>
                  <span className="font-semibold text-foreground">{Math.round(lift.percentile)}%</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${lift.color} transition-all duration-500`}
                    style={{ width: `${lift.percentile}%` }}
                  />
                </div>
              </div>

              {/* Comparison to Average */}
              <div className="flex items-center gap-2 text-xs">
                {lift.value >= lift.average ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span className="text-green-500 font-semibold">
                      {Math.round(((lift.value - lift.average) / lift.average) * 100)}% above average
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-muted-foreground rotate-180" />
                    <span className="text-muted-foreground">
                      {Math.round(((lift.average - lift.value) / lift.average) * 100)}% below average
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Top Lifters */}
        {topLifters && topLifters.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Top Lifters</span>
            </div>
            <div className="space-y-2">
              {topLifters.slice(0, 3).map((lifter: any, index: number) => (
                <div 
                  key={lifter.userId}
                  className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/30"
                  data-testid={`top-lifter-${index + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary w-6">#{index + 1}</span>
                    <span className="font-semibold">{lifter.username}</span>
                  </div>
                  <span className="text-muted-foreground font-mono">
                    {lifter.total.toLocaleString()} lbs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
