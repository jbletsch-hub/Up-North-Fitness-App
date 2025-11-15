import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import HomePage from "@/pages/HomePage";
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/ProfilePage";
import AdminPage from "@/pages/AdminPage";
import LeaderboardsPage from "@/pages/LeaderboardsPage";
import ActivityFeedPage from "@/pages/ActivityFeedPage";
import GoalsPage from "@/pages/GoalsPage";
import StatsPage from "@/pages/StatsPage";
import AvatarPage from "@/pages/AvatarPage";
import CrewsPage from "@/pages/CrewsPage";
import AuthPage from "@/pages/AuthPage";
import ProfileSetup from "@/pages/ProfileSetup";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/leaderboards" component={LeaderboardsPage} />
      <ProtectedRoute path="/activity" component={ActivityFeedPage} />
      <ProtectedRoute path="/goals" component={GoalsPage} />
      <ProtectedRoute path="/crews" component={CrewsPage} />
      <ProtectedRoute path="/stats/:userId?" component={StatsPage} />
      <ProtectedRoute path="/avatar" component={AvatarPage} />
      <ProtectedRoute path="/profile/:username" component={ProfilePage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/profile-setup" component={ProfileSetup} skipProfileCheck={true} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
