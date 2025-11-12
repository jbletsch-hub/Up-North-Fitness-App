interface AvatarDisplayProps {
  level: number;
  characterType?: string;
  shirtColor?: string;
  shortsColor?: string;
  headband?: boolean;
  wristbands?: boolean;
  hairStyle?: string;
  hairColor?: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarDisplay({
  level,
  characterType = "classic",
  shirtColor = "#FF6B35",
  shortsColor = "#1E3A8A",
  headband = false,
  wristbands = false,
  hairStyle = "short",
  hairColor = "#4A3728",
  size = "md",
}: AvatarDisplayProps) {
  // Map level (1-50) to evolution stage (0-9)
  const stage = Math.min(Math.floor((level - 1) / 5), 9);
  
  // Size configurations
  const sizeConfig = {
    sm: { width: 140, height: 180, viewBox: "0 0 200 260" },
    md: { width: 200, height: 260, viewBox: "0 0 200 260" },
    lg: { width: 280, height: 364, viewBox: "0 0 200 260" },
  };
  
  const config = sizeConfig[size];
  
  // Stage-specific cartoon attributes
  const getStageAttributes = () => {
    const stages = [
      { fitness: 0.6, confidence: 0.3, chestPuff: 0, armThickness: 0.7, shoulderWidth: 0.8 },
      { fitness: 0.7, confidence: 0.4, chestPuff: 0.1, armThickness: 0.8, shoulderWidth: 0.85 },
      { fitness: 0.8, confidence: 0.5, chestPuff: 0.2, armThickness: 0.9, shoulderWidth: 0.9 },
      { fitness: 0.9, confidence: 0.6, chestPuff: 0.3, armThickness: 1.0, shoulderWidth: 0.95 },
      { fitness: 1.0, confidence: 0.7, chestPuff: 0.4, armThickness: 1.1, shoulderWidth: 1.0 },
      { fitness: 1.1, confidence: 0.8, chestPuff: 0.5, armThickness: 1.2, shoulderWidth: 1.05 },
      { fitness: 1.2, confidence: 0.9, chestPuff: 0.6, armThickness: 1.3, shoulderWidth: 1.1 },
      { fitness: 1.3, confidence: 1.0, chestPuff: 0.7, armThickness: 1.4, shoulderWidth: 1.15 },
      { fitness: 1.4, confidence: 1.0, chestPuff: 0.8, armThickness: 1.5, shoulderWidth: 1.2 },
      { fitness: 1.5, confidence: 1.0, chestPuff: 1.0, armThickness: 1.6, shoulderWidth: 1.25 },
    ];
    return stages[stage];
  };
  
  const attrs = getStageAttributes();
  const skinTone = "#FFCC99";
  const outlineColor = "#000000";
  const outlineWidth = 3;
  
  // Render cartoon hair
  const renderCartoonHair = () => {
    switch (hairStyle) {
      case "bald":
        return null;
      
      case "short":
        return (
          <path
            d="M 70 85 Q 100 75, 130 85"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2.5}
          />
        );
      
      case "medium":
        return (
          <g>
            <ellipse cx="100" cy="80" rx="35" ry="15" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
            <path d="M 68 90 Q 65 100, 62 108" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 132 90 Q 135 100, 138 108" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "long":
        return (
          <g>
            <ellipse cx="100" cy="80" rx="35" ry="18" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
            <path d="M 65 95 Q 60 115, 58 130" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
            <path d="M 135 95 Q 140 115, 142 130" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
          </g>
        );
      
      case "curly":
        return (
          <g>
            <circle cx="85" cy="82" r="10" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="100" cy="75" r="12" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="115" cy="82" r="10" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="75" cy="92" r="8" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="125" cy="92" r="8" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "spiky":
        return (
          <g>
            <path d="M 75 85 L 72 70 L 80 85" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 90 85 L 90 65 L 95 85" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 100 85 L 100 60 L 105 85" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 110 85 L 110 65 L 115 85" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 125 85 L 128 70 L 120 85" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "buzzcut":
        return (
          <ellipse cx="100" cy="85" rx="32" ry="8" fill={hairColor} stroke={outlineColor} strokeWidth={2} opacity="0.8" />
        );
      
      default:
        return (
          <path
            d="M 70 85 Q 100 75, 130 85"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2.5}
          />
        );
    }
  };

  return (
    <div className="avatar-container relative inline-block">
      <svg
        width={config.width}
        height={config.height}
        viewBox={config.viewBox}
        className="avatar-svg"
      >
        <defs>
          <radialGradient id="shine">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* === LEGS (Rubber Hose Style) === */}
        {/* Left Leg */}
        <g className="leg-left">
          <rect
            x="82"
            y="175"
            width={8 * attrs.fitness}
            height="40"
            rx="4"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Shorts over leg */}
          <rect
            x="80"
            y="175"
            width={12 * attrs.fitness}
            height="25"
            rx="3"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Big cartoon shoe */}
          <ellipse
            cx="86"
            cy="220"
            rx="16"
            ry="10"
            fill="#FFD700"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Leg */}
        <g className="leg-right">
          <rect
            x="110"
            y="175"
            width={8 * attrs.fitness}
            height="40"
            rx="4"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <rect
            x="108"
            y="175"
            width={12 * attrs.fitness}
            height="25"
            rx="3"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx="114"
            cy="220"
            rx="16"
            ry="10"
            fill="#FFD700"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === BODY (Pear-Shaped) === */}
        {/* Lower body/belly */}
        <ellipse
          cx="100"
          cy="165"
          rx={30 * attrs.fitness}
          ry={22 - (attrs.fitness * 5)}
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="belly"
        />
        
        {/* Upper torso/chest */}
        <ellipse
          cx="100"
          cy={140 - (attrs.chestPuff * 5)}
          rx={25 * attrs.shoulderWidth}
          ry={25 + (attrs.chestPuff * 8)}
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="chest"
        />
        
        {/* Shine on shirt */}
        <ellipse
          cx="90"
          cy="135"
          rx="12"
          ry="15"
          fill="url(#shine)"
        />

        {/* === ARMS (Rubber Hose Style) === */}
        {/* Left Arm */}
        <g className="arm-left">
          <rect
            x="68"
            y="140"
            width={6 * attrs.armThickness}
            height="35"
            rx="3"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Wristband */}
          {wristbands && (
            <rect
              x="66"
              y="168"
              width={10 * attrs.armThickness}
              height="6"
              rx="2"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          {/* Big cartoon glove/hand */}
          <ellipse
            cx={70 + (3 * attrs.armThickness)}
            cy="182"
            rx={10 * attrs.armThickness}
            ry={8 * attrs.armThickness}
            fill="#FFFFFF"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Arm */}
        <g className="arm-right">
          <rect
            x="126"
            y="140"
            width={6 * attrs.armThickness}
            height="35"
            rx="3"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <rect
              x="124"
              y="168"
              width={10 * attrs.armThickness}
              height="6"
              rx="2"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          <ellipse
            cx={130 - (3 * attrs.armThickness)}
            cy="182"
            rx={10 * attrs.armThickness}
            ry={8 * attrs.armThickness}
            fill="#FFFFFF"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === HEAD (Large and Round) === */}
        <g className="head-group">
          {/* Main head circle */}
          <circle
            cx="100"
            cy="100"
            r="40"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Shine on head */}
          <ellipse
            cx="85"
            cy="85"
            rx="15"
            ry="18"
            fill="url(#shine)"
          />
          
          {/* Hair */}
          {renderCartoonHair()}
          
          {/* Headband */}
          {headband && (
            <g className="headband">
              <ellipse
                cx="100"
                cy="90"
                rx="42"
                ry="6"
                fill="#E74C3C"
                stroke={outlineColor}
                strokeWidth={2.5}
              />
              <circle cx="138" cy="90" r="5" fill="#C0392B" stroke={outlineColor} strokeWidth={2} />
            </g>
          )}
          
          {/* Eyes */}
          <g className="eyes">
            {/* Left eye */}
            <ellipse cx="85" cy="100" rx="10" ry="12" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2.5} />
            <circle cx="87" cy="102" r="6" fill={outlineColor} className="pupil-left" />
            <circle cx="89" cy="99" r="2.5" fill="#FFFFFF" className="eye-shine-left" />
            
            {/* Right eye */}
            <ellipse cx="115" cy="100" rx="10" ry="12" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2.5} />
            <circle cx="117" cy="102" r="6" fill={outlineColor} className="pupil-right" />
            <circle cx="119" cy="99" r="2.5" fill="#FFFFFF" className="eye-shine-right" />
          </g>
          
          {/* Nose */}
          <ellipse cx="100" cy="110" rx="4" ry="5" fill="#FFAA66" stroke={outlineColor} strokeWidth={2} />
          
          {/* Mouth - smile gets bigger with confidence */}
          <path
            d={`M ${82} ${118} Q 100 ${120 + (attrs.confidence * 8)}, ${118} ${118}`}
            stroke={outlineColor}
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
      
      {/* Stage indicator */}
      <div className="text-center mt-2">
        <div className="text-xs font-semibold text-primary">
          {stage === 0 && "Beginner"}
          {stage === 1 && "Novice"}
          {stage === 2 && "Trainee"}
          {stage === 3 && "Intermediate"}
          {stage === 4 && "Advanced"}
          {stage === 5 && "Expert"}
          {stage === 6 && "Elite"}
          {stage === 7 && "Master"}
          {stage === 8 && "Champion"}
          {stage === 9 && "Legend"}
        </div>
        <div className="text-xs text-muted-foreground">Stage {stage + 1}/10</div>
      </div>
      
      <style>{`
        .avatar-svg {
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
        }
        
        /* Bouncy floating animation */
        .avatar-container {
          animation: cartoonBounce 2s ease-in-out infinite;
        }
        
        @keyframes cartoonBounce {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        /* Breathing animation on body */
        .chest, .belly {
          animation: breathe 3s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1, 1);
          }
          50% {
            transform: scale(1.03, 1.05);
          }
        }
        
        /* Eye blink animation */
        .eyes {
          animation: blink 4s infinite;
        }
        
        @keyframes blink {
          0%, 96%, 100% {
            transform: scaleY(1);
          }
          98% {
            transform: scaleY(0.1);
          }
        }
        
        /* Pupil movement */
        .pupil-left, .pupil-right {
          animation: lookAround 6s ease-in-out infinite;
        }
        
        @keyframes lookAround {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(2px, -1px);
          }
          50% {
            transform: translate(0, 0);
          }
          75% {
            transform: translate(-2px, 1px);
          }
        }
        
        /* Gentle arm sway */
        .arm-left {
          animation: armSwayLeft 3s ease-in-out infinite;
          transform-origin: 71px 140px;
        }
        
        .arm-right {
          animation: armSwayRight 3s ease-in-out infinite 0.5s;
          transform-origin: 129px 140px;
        }
        
        @keyframes armSwayLeft {
          0%, 100% {
            transform: rotate(-3deg);
          }
          50% {
            transform: rotate(3deg);
          }
        }
        
        @keyframes armSwayRight {
          0%, 100% {
            transform: rotate(3deg);
          }
          50% {
            transform: rotate(-3deg);
          }
        }
        
        /* Head slight bob */
        .head-group {
          animation: headBob 4s ease-in-out infinite;
          transform-origin: 100px 100px;
        }
        
        @keyframes headBob {
          0%, 100% {
            transform: translateY(0px) rotate(-1deg);
          }
          50% {
            transform: translateY(-2px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
}
