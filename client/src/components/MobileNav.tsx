import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Dumbbell, Home, Trophy, User, Settings, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface MobileNavProps {
  username?: string;
  isAdmin?: boolean;
  userLevel?: number;
  userXP?: number;
  userTitle?: string;
}

export function MobileNav({ username, isAdmin, userLevel, userXP, userTitle }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch user's crew
  const { data: crewData } = useQuery({
    queryKey: ['/api/crews/my-crew'],
    enabled: open, // Only fetch when menu is open
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      setOpen(false);
      setLocation("/auth");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <span className="font-display text-xl tracking-wider">UP NORTH FITNESS</span>
            </div>
            {crewData?.crew && (
              <div className="flex items-center gap-2 ml-7">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{crewData.crew.name}</span>
              </div>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-8 flex flex-col gap-4">
          {/* User Info */}
          {userLevel !== undefined && (
            <div className="flex flex-col gap-1 p-4 rounded-md bg-secondary/50">
              <span className="font-display text-lg text-primary leading-none">{userTitle || 'Rookie 1'}</span>
              <span className="text-sm text-muted-foreground">Level {userLevel} · {userXP?.toLocaleString()} XP</span>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="justify-start gap-3"
              asChild
              onClick={handleNavClick}
              data-testid="mobile-link-dashboard"
            >
              <Link href="/dashboard">
                <Home className="h-5 w-5" />
                Dashboard
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start gap-3"
              asChild
              onClick={handleNavClick}
              data-testid="mobile-link-leaderboards"
            >
              <Link href="/leaderboards">
                <Trophy className="h-5 w-5" />
                Leaderboards
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start gap-3"
              asChild
              onClick={handleNavClick}
              data-testid="mobile-link-profile"
            >
              <Link href={`/profile/${username}`}>
                <User className="h-5 w-5" />
                Profile
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start gap-3"
              asChild
              onClick={handleNavClick}
              data-testid="mobile-link-crews"
            >
              <Link href="/crews">
                <Users className="h-5 w-5" />
                {crewData?.crew ? crewData.crew.name : 'Crews'}
              </Link>
            </Button>
            
            {isAdmin && (
              <Button
                variant="ghost"
                className="justify-start gap-3"
                asChild
                onClick={handleNavClick}
                data-testid="mobile-link-admin"
              >
                <Link href="/admin">
                  <Settings className="h-5 w-5" />
                  Admin
                </Link>
              </Button>
            )}

            <div className="border-t border-border my-2" />
            
            <Button
              variant="ghost"
              className="justify-start gap-3"
              onClick={handleLogout}
              data-testid="mobile-button-logout"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
