import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

interface ActivityItem {
  id: string;
  username: string;
  detail: string;
  createdAt: string;
  xpAwarded?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider">ACTIVITY</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border"
                data-testid={`activity-${activity.id}`}
              >
                <Activity className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.username}</span>{" "}
                    <span className="text-foreground">{activity.detail}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.createdAt}</p>
                </div>
                {activity.xpAwarded && (
                  <Badge className="flex-shrink-0 bg-chart-3 text-white border-0">
                    +{activity.xpAwarded} XP
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
