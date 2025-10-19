import { Link } from "wouter";
import { Moon, Sun, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";

interface NavigationProps {
  isLoggedIn: boolean;
  username?: string;
  isAdmin?: boolean;
  userLevel?: number;
  userXP?: number;
}

export function Navigation({ isLoggedIn, username, isAdmin, userLevel, userXP }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-display text-2xl tracking-wider">IRON CREW</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="sm" asChild data-testid="link-dashboard">
                <Link href="/dashboard">Dashboard</Link>
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
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50 text-sm">
                  <span className="font-semibold">Lv {userLevel}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{userXP} XP</span>
                </div>
              )}
              <Button variant="ghost" size="sm" data-testid="button-logout">
                Logout
              </Button>
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
  );
}
