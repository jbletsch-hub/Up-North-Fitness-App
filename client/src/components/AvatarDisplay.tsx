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
    sm: { width: 140, height: 200, viewBox: "0 0 200 280" },
    md: { width: 180, height: 256, viewBox: "0 0 200 280" },
    lg: { width: 240, height: 336, viewBox: "0 0 200 280" },
  };
  
  const config = sizeConfig[size];
  
  // Progressive muscle development (matching the reference image)
  const getStageAttributes = () => {
    // Stages map to the 4 body types in the reference image
    // 0-2: Skinny, 3-5: Getting toned, 6-7: Muscular, 8-9: Jacked
    const progressionStages = [
      // Skinny stages (1-10)
      { shoulderWidth: 20, armWidth: 6, legWidth: 8, chestDepth: 0, shoulderY: 110, bodyWidth: 32, neckWidth: 8 },
      { shoulderWidth: 22, armWidth: 7, legWidth: 9, chestDepth: 1, shoulderY: 108, bodyWidth: 34, neckWidth: 9 },
      
      // Getting toned (11-20)
      { shoulderWidth: 26, armWidth: 9, legWidth: 11, chestDepth: 3, shoulderY: 106, bodyWidth: 36, neckWidth: 10 },
      { shoulderWidth: 30, armWidth: 11, legWidth: 13, chestDepth: 5, shoulderY: 104, bodyWidth: 38, neckWidth: 11 },
      
      // Building muscle (21-30)
      { shoulderWidth: 34, armWidth: 13, legWidth: 15, chestDepth: 8, shoulderY: 102, bodyWidth: 40, neckWidth: 12 },
      { shoulderWidth: 38, armWidth: 15, legWidth: 17, chestDepth: 11, shoulderY: 100, bodyWidth: 42, neckWidth: 13 },
      
      // Muscular (31-40)
      { shoulderWidth: 42, armWidth: 17, legWidth: 19, chestDepth: 14, shoulderY: 98, bodyWidth: 44, neckWidth: 14 },
      { shoulderWidth: 46, armWidth: 19, legWidth: 21, chestDepth: 17, shoulderY: 96, bodyWidth: 46, neckWidth: 15 },
      
      // Jacked (41-50)
      { shoulderWidth: 50, armWidth: 21, legWidth: 23, chestDepth: 20, shoulderY: 94, bodyWidth: 48, neckWidth: 16 },
      { shoulderWidth: 54, armWidth: 23, legWidth: 25, chestDepth: 24, shoulderY: 92, bodyWidth: 50, neckWidth: 17 },
    ];
    
    return progressionStages[stage];
  };
  
  const attrs = getStageAttributes();
  const skinTone = "#FFCC99";
  const outlineColor = "#000000";
  const outlineWidth = 2.5;
  
  // Render hair
  const renderHair = () => {
    switch (hairStyle) {
      case "bald":
        return null;
      
      case "buzzcut":
        return (
          <ellipse 
            cx="100" 
            cy="64" 
            rx="28" 
            ry="6" 
            fill={hairColor} 
            stroke={outlineColor} 
            strokeWidth={2}
            opacity="0.9"
          />
        );
      
      case "short":
        return (
          <path
            d="M 75 70 Q 100 60, 125 70"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2}
          />
        );
      
      case "medium":
        return (
          <g>
            <ellipse cx="100" cy="65" rx="30" ry="12" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 72 75 Q 70 85, 68 92" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 128 75 Q 130 85, 132 92" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "long":
        return (
          <g>
            <ellipse cx="100" cy="65" rx="30" ry="15" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 70 78 Q 65 95, 62 110" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
            <path d="M 130 78 Q 135 95, 138 110" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
          </g>
        );
      
      case "curly":
        return (
          <g>
            <circle cx="80" cy="68" r="9" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="100" cy="62" r="10" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="120" cy="68" r="9" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="72" cy="78" r="7" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <circle cx="128" cy="78" r="7" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "spiky":
        return (
          <g>
            <path d="M 78 72 L 75 56 L 82 72" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 90 72 L 88 52 L 95 72" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 100 72 L 100 48 L 105 72" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 110 72 L 112 52 L 115 72" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 122 72 L 125 56 L 120 72" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      default:
        return (
          <path
            d="M 75 70 Q 100 60, 125 70"
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
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* === LEGS === */}
        {/* Left Leg */}
        <g className="leg-left">
          <rect
            x={100 - attrs.legWidth / 2 - 14}
            y="190"
            width={attrs.legWidth}
            height="56"
            rx={attrs.legWidth / 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Shorts */}
          <rect
            x={100 - attrs.legWidth / 2 - 16}
            y="185"
            width={attrs.legWidth + 4}
            height="32"
            rx="4"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Shoe */}
          <ellipse
            cx={100 - 14}
            cy="252"
            rx="14"
            ry="9"
            fill="#808080"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Leg */}
        <g className="leg-right">
          <rect
            x={100 - attrs.legWidth / 2 + 14}
            y="190"
            width={attrs.legWidth}
            height="56"
            rx={attrs.legWidth / 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <rect
            x={100 - attrs.legWidth / 2 + 12}
            y="185"
            width={attrs.legWidth + 4}
            height="32"
            rx="4"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx={100 + 14}
            cy="252"
            rx="14"
            ry="9"
            fill="#808080"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === BODY === */}
        {/* Torso - gets wider and more defined with progression */}
        <ellipse
          cx="100"
          cy="155"
          rx={attrs.bodyWidth / 2}
          ry="38"
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="torso"
        />
        
        {/* Chest definition - appears and gets more pronounced */}
        {attrs.chestDepth > 0 && (
          <ellipse
            cx="100"
            cy={138 - attrs.chestDepth / 2}
            rx={attrs.shoulderWidth / 2 - 2}
            ry={18 + attrs.chestDepth}
            fill={shirtColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
            className="chest"
            style={{ filter: `brightness(0.95)` }}
          />
        )}
        
        {/* Shine on shirt */}
        <ellipse
          cx="88"
          cy="135"
          rx="10"
          ry="14"
          fill={`url(#shine-${size})`}
        />

        {/* === ARMS === */}
        {/* Left Arm */}
        <g className="arm-left">
          <rect
            x={100 - attrs.shoulderWidth / 2 - attrs.armWidth - 3}
            y={attrs.shoulderY}
            width={attrs.armWidth}
            height="52"
            rx={attrs.armWidth / 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <rect
              x={100 - attrs.shoulderWidth / 2 - attrs.armWidth - 4}
              y={attrs.shoulderY + 42}
              width={attrs.armWidth + 2}
              height="7"
              rx="2"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          {/* Hand */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - 3}
            cy={attrs.shoulderY + 58}
            rx={attrs.armWidth + 2}
            ry={attrs.armWidth + 1}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Arm */}
        <g className="arm-right">
          <rect
            x={100 + attrs.shoulderWidth / 2 + 3}
            y={attrs.shoulderY}
            width={attrs.armWidth}
            height="52"
            rx={attrs.armWidth / 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <rect
              x={100 + attrs.shoulderWidth / 2 + 2}
              y={attrs.shoulderY + 42}
              width={attrs.armWidth + 2}
              height="7"
              rx="2"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + 3}
            cy={attrs.shoulderY + 58}
            rx={attrs.armWidth + 2}
            ry={attrs.armWidth + 1}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === NECK === */}
        <rect
          x={100 - attrs.neckWidth / 2}
          y="88"
          width={attrs.neckWidth}
          height="18"
          rx={attrs.neckWidth / 2}
          fill={skinTone}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
        />

        {/* === HEAD === */}
        <g className="head-group">
          {/* Main head */}
          <circle
            cx="100"
            cy="70"
            r="32"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Shine on head */}
          <ellipse
            cx="85"
            cy="58"
            rx="12"
            ry="14"
            fill={`url(#shine-${size})`}
          />
          
          {/* Hair */}
          {renderHair()}
          
          {/* Headband */}
          {headband && (
            <g className="headband">
              <ellipse
                cx="100"
                cy="72"
                rx="34"
                ry="5"
                fill="#E74C3C"
                stroke={outlineColor}
                strokeWidth={2.5}
              />
              <circle cx="130" cy="72" r="4" fill="#C0392B" stroke={outlineColor} strokeWidth={2} />
            </g>
          )}
          
          {/* Eyes */}
          <g className="eyes">
            {/* Left eye */}
            <ellipse cx="87" cy="74" rx="6" ry="7" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2} />
            <circle cx="88" cy="75" r="3.5" fill={outlineColor} className="pupil-left" />
            <circle cx="89" cy="73" r="1.5" fill="#FFFFFF" className="eye-shine" />
            
            {/* Right eye */}
            <ellipse cx="113" cy="74" rx="6" ry="7" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2} />
            <circle cx="114" cy="75" r="3.5" fill={outlineColor} className="pupil-right" />
            <circle cx="115" cy="73" r="1.5" fill="#FFFFFF" className="eye-shine" />
          </g>
          
          {/* Nose */}
          <ellipse cx="100" cy="82" rx="3" ry="4" fill="#FFAA66" stroke={outlineColor} strokeWidth={1.5} />
          
          {/* Mouth - smile */}
          <path
            d="M 90 88 Q 100 94, 110 88"
            stroke={outlineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
      
      {/* Stage indicator */}
      <div className="text-center mt-2">
        <div className="text-xs font-semibold text-primary">
          {stage === 0 && "Skinny Beginner"}
          {stage === 1 && "Starting Out"}
          {stage === 2 && "Getting Toned"}
          {stage === 3 && "Building Muscle"}
          {stage === 4 && "Solid Build"}
          {stage === 5 && "Strong"}
          {stage === 6 && "Muscular"}
          {stage === 7 && "Very Muscular"}
          {stage === 8 && "Jacked"}
          {stage === 9 && "Absolute Unit"}
        </div>
        <div className="text-xs text-muted-foreground">Stage {stage + 1}/10</div>
      </div>
      
      <style>{`
        .avatar-svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        /* Gentle breathing animation */
        .torso, .chest {
          animation: breathe 3s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes breathe {
          0%, 100% {
            transform: scale(1, 1);
          }
          50% {
            transform: scale(1.02, 1.03);
          }
        }
        
        /* Eye blink */
        .eyes {
          animation: blink 5s infinite;
        }
        
        @keyframes blink {
          0%, 96%, 100% {
            transform: scaleY(1);
          }
          98% {
            transform: scaleY(0.1);
          }
        }
        
        /* Subtle pupil movement */
        .pupil-left, .pupil-right {
          animation: lookAround 7s ease-in-out infinite;
        }
        
        @keyframes lookAround {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(1.5px, -0.5px);
          }
          50% {
            transform: translate(0, 0);
          }
          75% {
            transform: translate(-1.5px, 0.5px);
          }
        }
      `}</style>
    </div>
  );
}
