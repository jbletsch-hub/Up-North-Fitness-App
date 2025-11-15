import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";

interface BestDayStats {
  bestDay: string | null;
  prCount: number;
  dayBreakdown: Array<{ day: string; count: number }>;
  totalPRs: number;
}

interface BestPerformanceDayProps {
  userId: string;
}

export function BestPerformanceDay({ userId }: BestPerformanceDayProps) {
  const { data: stats, isLoading } = useQuery<BestDayStats>({
    queryKey: [`/api/stats/best-day/${userId}`],
  });

  if (isLoading) {
    return (
      <Card className="border-card-border" data-testid="card-best-day">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            BEST PERFORMANCE DAY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading stats...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !stats.bestDay || stats.totalPRs === 0) {
    return (
      <Card className="border-card-border" data-testid="card-best-day">
        <CardHeader>
          <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            BEST PERFORMANCE DAY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Hit some PRs to see your best day!
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find the max count for scaling the bars
  const maxCount = Math.max(...stats.dayBreakdown.map(d => d.count));

  return (
    <Card className="border-card-border" data-testid="card-best-day">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          BEST PERFORMANCE DAY
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Insight */}
        <div className="text-center space-y-2 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">
              You hit PRs most often on <span className="text-primary font-display" data-testid="text-best-day">{stats.bestDay}s</span>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold" data-testid="text-pr-count">{stats.prCount}</span> PRs on {stats.bestDay}s out of {stats.totalPRs} total
          </div>
        </div>

        {/* Day Breakdown Chart */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">PR Breakdown by Day</div>
          <div className="space-y-1.5">
            {stats.dayBreakdown.map((dayData) => {
              const percentage = maxCount > 0 ? (dayData.count / maxCount) * 100 : 0;
              const isBestDay = dayData.day === stats.bestDay;
              
              return (
                <div key={dayData.day} className="flex items-center gap-2" data-testid={`day-bar-${dayData.day.toLowerCase()}`}>
                  <div className="w-12 text-xs text-muted-foreground">{dayData.day.slice(0, 3)}</div>
                  <div className="flex-1 relative h-6 bg-muted rounded overflow-hidden">
                    <div 
                      className={`h-full transition-all ${isBestDay ? 'bg-primary' : 'bg-primary/50'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-xs font-semibold">
                    {dayData.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
