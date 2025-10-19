import { DailyChallenges } from "../DailyChallenges";

const mockChallenges = [
  { id: "1", text: "Complete 50 push-ups", completed: false },
  { id: "2", text: "Run 2 miles", completed: true },
  { id: "3", text: "Hold plank for 2 minutes", completed: false },
  { id: "4", text: "Drink 8 glasses of water", completed: false },
];

export default function DailyChallengesExample() {
  return <DailyChallenges challenges={mockChallenges} />;
}
