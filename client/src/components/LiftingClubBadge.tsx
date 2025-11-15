import { Trophy, Award, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getClubName, getClubColor, type ClubInfo } from "@/lib/liftingClubUtils";

interface LiftingClubBadgeProps {
  club: number;
  tier: ClubInfo['tier'];
  size?: 'sm' | 'md' | 'lg';
}

export function LiftingClubBadge({ club, tier, size = 'md' }: LiftingClubBadgeProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const badgeSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const colorClass = getClubColor(tier);
  
  // Choose icon based on tier
  const Icon = tier === 'legendary' ? Crown : tier === 'elite' ? Award : Trophy;
  
  // Custom gradient backgrounds for higher tiers
  const getBadgeStyle = () => {
    if (tier === 'legendary') {
      return 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold border-0';
    }
    if (tier === 'elite') {
      return 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold border-0';
    }
    if (tier === 'advanced') {
      return 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold border-0';
    }
    if (tier === 'intermediate') {
      return 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold border-0';
    }
    return 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white font-bold border-0';
  };
  
  return (
    <Badge
      variant="default"
      className={`${badgeSize} gap-1 ${getBadgeStyle()}`}
      data-testid="badge-lifting-club"
    >
      <Icon className={iconSize} />
      {getClubName(club)}
    </Badge>
  );
}
