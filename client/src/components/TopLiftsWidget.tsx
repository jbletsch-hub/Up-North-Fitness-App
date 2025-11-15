import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Dumbbell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function TopLiftsWidget() {
  const { data: topLifts, isLoading } = useQuery<any>({
    queryKey: ["/api/top-lifts"],
  });

  if (isLoading) {
    return (
      <Card data-testid="card-top-lifts">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Lifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  const liftTypes = [
    { key: "squat", label: "Squat", color: "text-blue-500" },
    { key: "bench", label: "Bench Press", color: "text-purple-500" },
    { key: "deadlift", label: "Deadlift", color: "text-red-500" }
  ];

  return (
    <Card data-testid="card-top-lifts">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Lifts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {liftTypes.map(({ key, label, color }) => {
          const topUsers = topLifts?.[key] || [];
          
          return (
            <div key={key} data-testid={`section-top-${key}`}>
              <div className="flex items-center gap-2 mb-3">
                <Dumbbell className={`h-4 w-4 ${color}`} />
                <h3 className="font-semibold text-sm">{label}</h3>
              </div>
              
              <div className="space-y-2">
                {topUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No data yet
                  </p>
                ) : (
                  topUsers.map((user: any, index: number) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-2 rounded-lg hover-elevate"
                      data-testid={`lift-entry-${key}-${index + 1}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className="text-xs w-6 text-center shrink-0">
                          {index + 1}
                        </Badge>
                        <Link href={`/stats/${user.userId}`}>
                          <p className="text-sm font-medium truncate hover:text-primary cursor-pointer">
                            {user.displayName || user.username}
                          </p>
                        </Link>
                      </div>
                      <Badge className={`${color} shrink-0`}>
                        {user.value} lbs
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
