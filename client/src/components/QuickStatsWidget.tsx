import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Activity, Trophy, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function QuickStatsWidget() {
  const { data: quickStats } = useQuery({
    queryKey: ["/api/dashboard/quick-stats"],
  });

  const stats = [
    {
      label: "Current Streak",
      value: (quickStats as any)?.currentStreak || 0,
      icon: Flame,
      color: "text-orange-500",
      suffix: "days"
    },
    {
      label: "Monthly Workouts",
      value: (quickStats as any)?.monthlyCheckIns || 0,
      icon: Activity,
      color: "text-blue-500",
      suffix: ""
    },
    {
      label: "Weekly PRs",
      value: (quickStats as any)?.weeklyPRs || 0,
      icon: Trophy,
      color: "text-yellow-500",
      suffix: ""
    },
    {
      label: "MVL Wins",
      value: (quickStats as any)?.mvlWins || 0,
      icon: Award,
      color: "text-purple-500",
      suffix: ""
    }
  ];

  return (
    <Card data-testid="card-quick-stats">
      <CardHeader>
        <CardTitle className="text-lg">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div 
                key={stat.label} 
                className="flex items-center gap-3"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`p-2 rounded-lg bg-muted/30`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-display font-bold">
                    {stat.value}{stat.suffix && <span className="text-sm text-muted-foreground ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
