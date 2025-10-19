import { ActivityFeed } from "../ActivityFeed";

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
];

export default function ActivityFeedExample() {
  return <ActivityFeed activities={mockActivities} />;
}
