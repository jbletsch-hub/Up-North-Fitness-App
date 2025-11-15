import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Compass } from "lucide-react";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password, email: email || undefined });
    }
  };

  return (
    <div className="min-h-screen bg-background grid md:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-card-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-8 w-8 text-primary" />
              <span className="font-display text-3xl tracking-wider">UP NORTH FITNESS</span>
            </div>
            <CardTitle className="text-2xl">
              {isLogin ? "Welcome back" : "Join the crew"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to continue your fitness journey"
                : "Create an account to start tracking your gains"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  data-testid="input-username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional)</Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  data-testid="input-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                data-testid={isLogin ? "button-login" : "button-register"}
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {isLogin ? "Log in" : "Create account"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                  }}
                  data-testid="button-toggle-mode"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Log in"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Hero */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-primary/10 to-chart-2/10 p-12">
        <div className="max-w-md space-y-6 text-center">
          <h1 className="font-display text-5xl tracking-wider">
            LEVEL UP YOUR FITNESS
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your PRs, complete daily challenges, and compete with your crew. Earn XP and unlock titles as you become unstoppable.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div>
              <div className="font-display text-3xl text-primary">+15 XP</div>
              <p className="text-sm text-muted-foreground">Per check-in</p>
            </div>
            <div>
              <div className="font-display text-3xl text-chart-2">10 Levels</div>
              <p className="text-sm text-muted-foreground">To unlock</p>
            </div>
            <div>
              <div className="font-display text-3xl text-chart-3">Crew Goals</div>
              <p className="text-sm text-muted-foreground">Together</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
