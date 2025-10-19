import { Navigation } from "@/components/Navigation";
import { CrewGoalMeter } from "@/components/CrewGoalMeter";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { ActivityFeed } from "@/components/ActivityFeed";
import { DailyChallenges } from "@/components/DailyChallenges";
import { CheckInCard } from "@/components/CheckInCard";
import { PRTracker } from "@/components/PRTracker";
import { WeighInCard } from "@/components/WeighInCard";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useXPPopup } from "@/components/XPPopup";

// todo: remove mock functionality - mock data for prototype
const mockLeaderboardUsers = [
  {
    id: "1",
    username: "ironmike",
    avatar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgcng9IjMyIiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1NCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIwIiBmb250LWZhbWlseT0iU2Vnb2UgVUkgRW1vamkiPvCfjY/vuI88L3RleHQ+PC9zdmc+",
    level: 24,
    xp: 8945,
    title: "Beast",
  },
  {
    id: "2",
    username: "liftqueen",
    avatar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgcng9IjMyIiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1NCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIwIiBmb250LWZhbWlseT0iU2Vnb2UgVUkgRW1vamkiPvCfkqo8L3RleHQ+PC9zdmc+",
    level: 19,
    xp: 5234,
    title: "Veteran",
  },
  {
    id: "3",
    username: "gainzmaster",
    avatar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgcng9IjMyIiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1NCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIwIiBmb250LWZhbWlseT0iU2Vnb2UgVUkgRW1vamkiPvCfjY88L3RleHQ+PC9zdmc+",
    level: 15,
    xp: 3890,
    title: "Amateur",
  },
  {
    id: "4",
    username: "strongman42",
    avatar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgcng9IjMyIiBmaWxsPSIjN2MzYWVkIi8+PHRleHQgeD0iNTAlIiB5PSI1NCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTIwIiBmb250LWZhbWlseT0iU2Vnb2UgVUkgRW1vamkiPvCfkqo8L3RleHQ+PC9zdmc+",
    level: 12,
    xp: 2450,
    title: "Rookie 3",
  },
];

const mockActivities = [
  {
    id: "1",
    username: "ironmike",
    detail: "completed a daily challenge",
    createdAt: "2 minutes ago",
    xpAwarded: 15,
  },
  {
    id: "2",
    username: "liftqueen",
    detail: "updated their PRs",
    createdAt: "15 minutes ago",
    xpAwarded: 10,
  },
  {
    id: "3",
    username: "gainzmaster",
    detail: "checked in",
    createdAt: "1 hour ago",
    xpAwarded: 15,
  },
  {
    id: "4",
    username: "strongman42",
    detail: "uploaded a progress photo",
    createdAt: "3 hours ago",
    xpAwarded: 15,
  },
  {
    id: "5",
    username: "ironmike",
    detail: "reached level 24",
    createdAt: "5 hours ago",
  },
];

const mockChallenges = [
  { id: "1", text: "Complete 50 push-ups", completed: false },
  { id: "2", text: "Run 2 miles", completed: true },
  { id: "3", text: "Hold plank for 2 minutes", completed: false },
  { id: "4", text: "Drink 8 glasses of water", completed: false },
];

export default function Home() {
  const { showXP, popup } = useXPPopup();

  // todo: remove mock functionality
  const handleChallengeComplete = (id: string) => {
    showXP(15);
  };

  // todo: remove mock functionality
  const handleCheckIn = () => {
    showXP(15);
  };

  // todo: remove mock functionality
  const handlePRUpdate = () => {
    showXP(10);
  };

  // todo: remove mock functionality
  const handleWeighIn = () => {
    showXP(15);
  };

  // todo: remove mock functionality
  const handlePhotoUpload = () => {
    showXP(15);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isLoggedIn={true}
        username="strongman42"
        isAdmin={false}
        userLevel={12}
        userXP={2450}
      />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <CrewGoalMeter current={3245} goal={5000} />

        <div className="grid md:grid-cols-2 gap-6">
          <LeaderboardCard users={mockLeaderboardUsers} />
          <ActivityFeed activities={mockActivities} />
        </div>

        <div className="space-y-6">
          <h2 className="font-display text-3xl tracking-wider">MY DASHBOARD</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <DailyChallenges challenges={mockChallenges} onComplete={handleChallengeComplete} />
            <CheckInCard streak={7} onCheckIn={handleCheckIn} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PRTracker
              initialPRs={{ squat: 315, bench: 225, deadlift: 405 }}
              onUpdate={handlePRUpdate}
            />
            <div className="space-y-6">
              <WeighInCard currentWeight={185.5} onWeighIn={handleWeighIn} />
              <PhotoUpload onUpload={handlePhotoUpload} />
            </div>
          </div>
        </div>
      </main>

      {popup}
    </div>
  );
}
