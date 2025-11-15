import { Link, useLocation } from "wouter";
import { Moon, Sun, Dumbbell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { apiRequest } from "@/lib/queryClient";
import { MobileNav } from "./MobileNav";
import { BottomNav } from "./BottomNav";

interface NavigationProps {
  isLoggedIn: boolean;
  username?: string;
  isAdmin?: boolean;
  userLevel?: number;
  userXP?: number;
  userTitle?: string;
}

export function Navigation({ isLoggedIn, username, isAdmin, userLevel, userXP, userTitle }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setLocation("/auth");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-display text-2xl tracking-wider">UP NORTH FITNESS</span>
          </Link>

          <nav className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                {/* Mobile Hamburger Menu */}
                <MobileNav 
                  username={username}
                  isAdmin={isAdmin}
                  userLevel={userLevel}
                  userXP={userXP}
                  userTitle={userTitle}
                />
                
                {/* Mobile Logout Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="md:hidden"
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="h-5 w-5" />
                </Button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild data-testid="link-dashboard">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild data-testid="link-activity">
                    <Link href="/activity">Feed</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild data-testid="link-goals">
                    <Link href="/goals">Goals</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild data-testid="link-crews">
                    <Link href="/crews">Crews</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild data-testid="link-stats">
                    <Link href="/stats">Stats</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild data-testid="link-leaderboards">
                    <Link href="/leaderboards">Leaderboards</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild data-testid="link-profile">
                    <Link href={`/profile/${username}`}>Profile</Link>
                  </Button>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" asChild data-testid="link-admin">
                      <Link href="/admin">Admin</Link>
                    </Button>
                  )}
                  {userLevel !== undefined && (
                    <div className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md bg-secondary/50 text-sm">
                      <span className="font-display text-base leading-none">{userTitle || 'Rookie 1'}</span>
                      <span className="text-xs text-muted-foreground">Lv {userLevel} · {userXP} XP</span>
                    </div>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild data-testid="link-login">
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="default" size="sm" asChild data-testid="link-register">
                  <Link href="/register">Join Crew</Link>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </nav>
        </div>
      </header>

      {/* Bottom Navigation for Mobile */}
      {isLoggedIn && <BottomNav isAdmin={isAdmin} username={username} />}
    </>
  );
}
