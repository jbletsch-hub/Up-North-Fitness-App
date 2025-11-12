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
  shirtColor = "#FF5722",
  shortsColor = "#20B2AA",
  headband = false,
  wristbands = false,
  hairStyle = "short",
  hairColor = "#8B4513",
  size = "md",
}: AvatarDisplayProps) {
  // Map level (1-50) to evolution stage (0-9)
  const stage = Math.min(Math.floor((level - 1) / 5), 9);
  
  // Size configurations
  const sizeConfig = {
    sm: { width: 160, height: 220, viewBox: "0 0 200 280" },
    md: { width: 200, height: 280, viewBox: "0 0 200 280" },
    lg: { width: 260, height: 364, viewBox: "0 0 200 280" },
  };
  
  const config = sizeConfig[size];
  
  // DRAMATIC muscle progression matching the reference image
  // Stage 0-1: Stick thin, Stage 2-4: Getting bigger, Stage 5-7: Muscular, Stage 8-9: JACKED
  const getStageAttributes = () => {
    const progressionStages = [
      // SKINNY - stick thin (Levels 1-5)
      { 
        shoulderWidth: 16, armWidth: 4, legWidth: 6, 
        chestWidth: 20, chestHeight: 20, torsoWidth: 22, torsoHeight: 32,
        neckWidth: 6, shoulderY: 94, armY: 94, posture: 0
      },
      // Still skinny (Levels 6-10)
      { 
        shoulderWidth: 18, armWidth: 5, legWidth: 7, 
        chestWidth: 22, chestHeight: 22, torsoWidth: 24, torsoHeight: 32,
        neckWidth: 7, shoulderY: 92, armY: 92, posture: 2
      },
      // Starting to fill out (Levels 11-15)
      { 
        shoulderWidth: 22, armWidth: 7, legWidth: 9, 
        chestWidth: 26, chestHeight: 26, torsoWidth: 28, torsoHeight: 34,
        neckWidth: 8, shoulderY: 90, armY: 90, posture: 4
      },
      // Getting toned (Levels 16-20)
      { 
        shoulderWidth: 28, armWidth: 10, legWidth: 12, 
        chestWidth: 32, chestHeight: 30, torsoWidth: 32, torsoHeight: 34,
        neckWidth: 10, shoulderY: 88, armY: 88, posture: 6
      },
      // Athletic build (Levels 21-25)
      { 
        shoulderWidth: 34, armWidth: 13, legWidth: 15, 
        chestWidth: 38, chestHeight: 34, torsoWidth: 36, torsoHeight: 36,
        neckWidth: 12, shoulderY: 86, armY: 86, posture: 8
      },
      // Strong (Levels 26-30)
      { 
        shoulderWidth: 40, armWidth: 16, legWidth: 18, 
        chestWidth: 44, chestHeight: 38, torsoWidth: 40, torsoHeight: 36,
        neckWidth: 14, shoulderY: 84, armY: 84, posture: 10
      },
      // Very muscular (Levels 31-35)
      { 
        shoulderWidth: 46, armWidth: 19, legWidth: 21, 
        chestWidth: 50, chestHeight: 42, torsoWidth: 44, torsoHeight: 38,
        neckWidth: 16, shoulderY: 82, armY: 82, posture: 12
      },
      // Beast mode (Levels 36-40)
      { 
        shoulderWidth: 52, armWidth: 22, legWidth: 24, 
        chestWidth: 56, chestHeight: 46, torsoWidth: 48, torsoHeight: 38,
        neckWidth: 18, shoulderY: 80, armY: 80, posture: 14
      },
      // JACKED (Levels 41-45)
      { 
        shoulderWidth: 58, armWidth: 25, legWidth: 27, 
        chestWidth: 62, chestHeight: 50, torsoWidth: 52, torsoHeight: 40,
        neckWidth: 20, shoulderY: 78, armY: 78, posture: 16
      },
      // ABSOLUTE UNIT (Levels 46-50)
      { 
        shoulderWidth: 64, armWidth: 28, legWidth: 30, 
        chestWidth: 68, chestHeight: 54, torsoWidth: 56, torsoHeight: 40,
        neckWidth: 22, shoulderY: 76, armY: 76, posture: 18
      },
    ];
    
    return progressionStages[stage];
  };
  
  const attrs = getStageAttributes();
  const skinTone = "#FFCC99";
  const outlineColor = "#1A1A1A";
  const outlineWidth = 2.5;
  
  // Render hair with cleaner style - positioned on TOP of head
  const renderHair = () => {
    switch (hairStyle) {
      case "bald":
        return null;
      
      case "buzzcut":
        return (
          <ellipse 
            cx="100" 
            cy="35" 
            rx="30" 
            ry="4" 
            fill={hairColor} 
            stroke={outlineColor} 
            strokeWidth={1.5}
            opacity="0.9"
          />
        );
      
      case "short":
        return (
          <path
            d="M 72 38 Q 100 28, 128 38"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2}
          />
        );
      
      case "medium":
        return (
          <g>
            <ellipse cx="100" cy="35" rx="32" ry="10" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 70 42 Q 68 52, 66 60" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 130 42 Q 132 52, 134 60" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "long":
        return (
          <g>
            <ellipse cx="100" cy="35" rx="32" ry="12" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 68 44 Q 63 60, 60 78" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
            <path d="M 132 44 Q 137 60, 140 78" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
          </g>
        );
      
      case "curly":
        return (
          <g>
            <circle cx="78" cy="36" r="8" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="92" cy="30" r="9" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="108" cy="30" r="9" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="122" cy="36" r="8" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="70" cy="44" r="6" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="130" cy="44" r="6" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
          </g>
        );
      
      case "spiky":
        return (
          <g>
            <path d="M 75 40 L 72 22 L 80 40" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 88 40 L 86 18 L 93 40" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 100 40 L 100 14 L 105 40" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 112 40 L 114 18 L 117 40" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 125 40 L 128 22 L 122 40" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      default:
        return (
          <path
            d="M 72 38 Q 100 28, 128 38"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2}
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
          <radialGradient id={`shine-${size}`}>
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.15"/>
          </filter>
        </defs>

        {/* === LEGS === */}
        {/* Left Leg */}
        <g className="leg-left">
          <ellipse
            cx={85}
            cy={220}
            rx={attrs.legWidth}
            ry="52"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Shorts */}
          <rect
            x={85 - attrs.legWidth - 2}
            y="168"
            width={attrs.legWidth * 2 + 4}
            height="28"
            rx="3"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Shoe */}
          <ellipse
            cx="85"
            cy="252"
            rx="13"
            ry="8"
            fill="#6B7280"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Leg */}
        <g className="leg-right">
          <ellipse
            cx={115}
            cy={220}
            rx={attrs.legWidth}
            ry="52"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <rect
            x={115 - attrs.legWidth - 2}
            y="168"
            width={attrs.legWidth * 2 + 4}
            height="28"
            rx="3"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx="115"
            cy="252"
            rx="13"
            ry="8"
            fill="#6B7280"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === BODY === */}
        {/* Lower torso/belly */}
        <ellipse
          cx="100"
          cy="150"
          rx={attrs.torsoWidth / 2}
          ry={attrs.torsoHeight / 2}
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="torso"
        />
        
        {/* Upper chest - gets bigger and more defined */}
        <ellipse
          cx="100"
          cy={120 - attrs.posture / 2}
          rx={attrs.chestWidth / 2}
          ry={attrs.chestHeight / 2}
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="chest"
        />
        
        {/* Chest highlight */}
        <ellipse
          cx="88"
          cy={115 - attrs.posture / 2}
          rx="12"
          ry="16"
          fill={`url(#shine-${size})`}
        />

        {/* === ARMS - Progressive thickness === */}
        {/* Left Arm */}
        <g className="arm-left">
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
            cy={attrs.armY + 35}
            rx={attrs.armWidth}
            ry="46"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <ellipse
              cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
              cy={attrs.armY + 72}
              rx={attrs.armWidth + 1}
              ry="5"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          {/* Hand */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
            cy={attrs.armY + 87}
            rx={attrs.armWidth + 3}
            ry={attrs.armWidth + 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Arm */}
        <g className="arm-right">
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
            cy={attrs.armY + 35}
            rx={attrs.armWidth}
            ry="46"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <ellipse
              cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
              cy={attrs.armY + 72}
              rx={attrs.armWidth + 1}
              ry="5"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
            cy={attrs.armY + 87}
            rx={attrs.armWidth + 3}
            ry={attrs.armWidth + 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === NECK - Gets thicker with muscle === */}
        <ellipse
          cx="100"
          cy="76"
          rx={attrs.neckWidth}
          ry="12"
          fill={skinTone}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
        />

        {/* === HEAD === */}
        <g className="head-group">
          {/* Main head - stays same size */}
          <circle
            cx="100"
            cy="60"
            r="28"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Head highlight */}
          <ellipse
            cx="86"
            cy="50"
            rx="11"
            ry="13"
            fill={`url(#shine-${size})`}
          />
          
          {/* Hair */}
          {renderHair()}
          
          {/* Headband */}
          {headband && (
            <g className="headband">
              <ellipse
                cx="100"
                cy="58"
                rx="30"
                ry="4"
                fill="#E74C3C"
                stroke={outlineColor}
                strokeWidth={2}
              />
              <circle cx="127" cy="58" r="3" fill="#C0392B" stroke={outlineColor} strokeWidth={1.5} />
            </g>
          )}
          
          {/* Eyes - simple and clean */}
          <g className="eyes">
            {/* Left eye */}
            <ellipse cx="89" cy="62" rx="5" ry="6" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2} />
            <circle cx="90" cy="63" r="3" fill={outlineColor} className="pupil-left" />
            <circle cx="91" cy="61" r="1.2" fill="#FFFFFF" className="eye-shine" />
            
            {/* Right eye */}
            <ellipse cx="111" cy="62" rx="5" ry="6" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2} />
            <circle cx="112" cy="63" r="3" fill={outlineColor} className="pupil-right" />
            <circle cx="113" cy="61" r="1.2" fill="#FFFFFF" className="eye-shine" />
          </g>
          
          {/* Nose */}
          <ellipse cx="100" cy="69" rx="2.5" ry="3" fill="#FFAA66" />
          
          {/* Smile - simple curve */}
          <path
            d="M 92 75 Q 100 80, 108 75"
            stroke={outlineColor}
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
      
      {/* Stage indicator */}
      <div className="text-center mt-2">
        <div className="text-xs font-semibold text-primary">
          {stage === 0 && "Stick Thin"}
          {stage === 1 && "Skinny"}
          {stage === 2 && "Filling Out"}
          {stage === 3 && "Getting Toned"}
          {stage === 4 && "Athletic"}
          {stage === 5 && "Strong"}
          {stage === 6 && "Very Muscular"}
          {stage === 7 && "Beast Mode"}
          {stage === 8 && "Jacked"}
          {stage === 9 && "Absolute Unit"}
        </div>
        <div className="text-xs text-muted-foreground">Stage {stage + 1}/10</div>
      </div>
      
      <style>{`
        .avatar-svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        /* Gentle breathing */
        .torso, .chest {
          animation: breathe 3s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1, 1);
          }
          50% {
            transform: scale(1.015, 1.02);
          }
        }
        
        /* Eye blink */
        .eyes {
          animation: blink 6s infinite;
        }
        
        @keyframes blink {
          0%, 97%, 100% {
            transform: scaleY(1);
          }
          98.5% {
            transform: scaleY(0.1);
          }
        }
      `}</style>
    </div>
  );
}
