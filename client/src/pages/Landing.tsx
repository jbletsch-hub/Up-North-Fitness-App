import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Trophy, Target, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-display text-2xl tracking-wider">IRON CREW</span>
          </div>
          <Button asChild data-testid="button-login">
            <a href="/api/login">Join the Crew</a>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 space-y-16">
        <section className="text-center space-y-6 py-12">
          <h1 className="font-display text-6xl md:text-7xl tracking-wider">
            LEVEL UP YOUR FITNESS
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your gains, complete challenges, and compete with your crew. Earn XP, unlock titles, and become unstoppable.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild data-testid="link-signup">
              <a href="/api/login">Get Started</a>
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="border-card-border">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="font-display text-xl">EARN XP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete challenges, hit PRs, and stay consistent. Every action earns you experience points.
              </p>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader>
              <Trophy className="h-10 w-10 text-chart-2 mb-2" />
              <CardTitle className="font-display text-xl">LEVEL UP</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Rise through the ranks from Rookie to Titan. Unlock epic titles and show off your dedication.
              </p>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardHeader>
              <Users className="h-10 w-10 text-chart-3 mb-2" />
              <CardTitle className="font-display text-xl">CREW GOALS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Work together to hit massive crew-wide lifting goals. Your PRs contribute to the team total.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="font-display text-4xl tracking-wider">TRACK EVERYTHING</h2>
            <p className="text-lg text-muted-foreground">
              Monitor your squat, bench, and deadlift PRs. Track your weight. Upload progress photos. See your improvement over time.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Personal Record tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Daily challenges</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Check-in streaks</span>
              </li>
            </ul>
          </div>
          <Card className="border-card-border bg-gradient-to-br from-primary/10 to-chart-2/10 p-8">
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="font-display text-6xl text-primary">945 lbs</div>
                <p className="text-muted-foreground">Total lifted</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-display text-2xl">315</div>
                  <p className="text-xs text-muted-foreground">Squat</p>
                </div>
                <div>
                  <div className="font-display text-2xl">225</div>
                  <p className="text-xs text-muted-foreground">Bench</p>
                </div>
                <div>
                  <div className="font-display text-2xl">405</div>
                  <p className="text-xs text-muted-foreground">Deadlift</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center space-y-6 py-12 border-t border-border">
          <h2 className="font-display text-4xl tracking-wider">READY TO START?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the crew and transform your fitness journey into an epic adventure.
          </p>
          <Button size="lg" asChild>
            <a href="/api/login">Sign Up Now</a>
          </Button>
        </section>
      </main>
    </div>
  );
}
