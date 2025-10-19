import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Medal } from "lucide-react";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  title: string;
}

interface LeaderboardCardProps {
  users: LeaderboardUser[];
}

export function LeaderboardCard({ users }: LeaderboardCardProps) {
  const getRankColor = (index: number) => {
    if (index === 0) return "text-yellow-500";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="text-xl font-display tracking-wider">LEADERBOARD</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No members yet. Be the first to join!</p>
          ) : (
            users.map((user, index) => (
              <Link key={user.id} href={`/profile/${user.username}`}>
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover-elevate active-elevate-2"
                  data-testid={`leaderboard-item-${index}`}
                >
                  <div className={`flex-shrink-0 w-6 text-center font-display text-lg ${getRankColor(index)}`}>
                    {index < 3 ? <Medal className="h-5 w-5 inline" /> : index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{user.username}</span>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-chart-2 text-white border-0"
                      >
                        {user.title}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-display text-lg">Lv {user.level}</div>
                    <div className="text-xs text-muted-foreground">{user.xp.toLocaleString()} XP</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
