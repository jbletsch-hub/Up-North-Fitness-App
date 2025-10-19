import { LeaderboardCard } from "../LeaderboardCard";

const mockUsers = [
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
];

export default function LeaderboardCardExample() {
  return <LeaderboardCard users={mockUsers} />;
}
