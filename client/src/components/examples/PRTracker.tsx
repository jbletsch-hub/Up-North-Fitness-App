import { PRTracker } from "../PRTracker";

export default function PRTrackerExample() {
  return (
    <PRTracker
      initialPRs={{
        squat: 315,
        bench: 225,
        deadlift: 405,
      }}
    />
  );
}
