import { Link, useLocation } from "wouter";
import { Home, Activity, Target, TrendingUp, Shield } from "lucide-react";

interface BottomNavProps {
  isAdmin?: boolean;
  username?: string;
}

export function BottomNav({ isAdmin, username }: BottomNavProps) {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/activity", icon: Activity, label: "Feed" },
    { path: "/goals", icon: Target, label: "Goals" },
    { path: "/stats", icon: TrendingUp, label: "Stats" },
  ];

  if (isAdmin) {
    navItems.push({ path: "/admin", icon: Shield, label: "Admin" });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full hover-elevate"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon 
                className={`h-5 w-5 mb-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span 
                className={`text-xs ${
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
