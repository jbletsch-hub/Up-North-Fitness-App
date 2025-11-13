import { AvatarDisplay } from "./AvatarDisplay";
import { getXPToNextLevel, getLevelProgress } from "@/lib/xpUtils";

interface AvatarWithProgressProps {
  level: number;
  xp: number;
  characterType?: string;
  shirtColor?: string;
  shortsColor?: string;
  headband?: boolean;
  wristbands?: boolean;
  hairStyle?: string;
  hairColor?: string;
  facialHair?: string;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
}

export function AvatarWithProgress({
  level,
  xp,
  characterType = "classic",
  shirtColor = "#FF5722",
  shortsColor = "#20B2AA",
  headband = false,
  wristbands = false,
  hairStyle = "short",
  hairColor = "#8B4513",
  facialHair = "none",
  size = "md",
  showProgress = true,
}: AvatarWithProgressProps) {
  const progress = getLevelProgress(xp, level);
  const xpToNext = getXPToNextLevel(xp, level);

  // Size configurations for the ring
  const sizeConfig = {
    sm: { 
      containerSize: 190, 
      ringRadius: 88, 
      strokeWidth: 6,
      textOffset: 95,
      fontSize: "10px",
    },
    md: { 
      containerSize: 240, 
      ringRadius: 110, 
      strokeWidth: 8,
      textOffset: 120,
      fontSize: "12px",
    },
    lg: { 
      containerSize: 310, 
      ringRadius: 142, 
      strokeWidth: 10,
      textOffset: 155,
      fontSize: "14px",
    },
  };

  const config = sizeConfig[size];
  const circumference = 2 * Math.PI * config.ringRadius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" data-testid="avatar-with-progress">
      {/* Progress Ring */}
      {showProgress && (
        <svg
          className="absolute inset-0"
          width={config.containerSize}
          height={config.containerSize}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background circle */}
          <circle
            cx={config.containerSize / 2}
            cy={config.containerSize / 2}
            r={config.ringRadius}
            stroke="hsl(var(--border))"
            strokeWidth={config.strokeWidth}
            fill="none"
            opacity="0.3"
          />
          {/* Progress circle */}
          <circle
            cx={config.containerSize / 2}
            cy={config.containerSize / 2}
            r={config.ringRadius}
            stroke="hsl(var(--primary))"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))",
            }}
          />
        </svg>
      )}

      {/* Avatar */}
      <div className="relative z-10">
        <AvatarDisplay
          level={level}
          characterType={characterType}
          shirtColor={shirtColor}
          shortsColor={shortsColor}
          headband={headband}
          wristbands={wristbands}
          hairStyle={hairStyle}
          hairColor={hairColor}
          facialHair={facialHair}
          size={size}
        />
      </div>

      {/* XP Info Badge */}
      {showProgress && (
        <div
          className="absolute bg-card border-2 border-primary rounded-full px-3 py-1 shadow-lg"
          style={{
            bottom: "8px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex flex-col items-center">
            <span className="font-display text-primary font-bold" style={{ fontSize: config.fontSize }}>
              {progress.toFixed(0)}%
            </span>
            <span className="text-muted-foreground whitespace-nowrap" style={{ fontSize: config.fontSize }}>
              {xpToNext.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
