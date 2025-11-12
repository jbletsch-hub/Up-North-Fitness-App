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
  
  // Render hair molded around the head shape
  const renderHair = () => {
    switch (hairStyle) {
      case "bald":
        return null;
      
      case "buzzcut":
        return (
          <path
            d="M 74 42 Q 78 34, 85 32 Q 92 30, 100 30 Q 108 30, 115 32 Q 122 34, 126 42"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={1.5}
            opacity="0.9"
          />
        );
      
      case "short":
        return (
          <path
            d="M 74 44 Q 77 36, 84 33 Q 92 30, 100 29 Q 108 30, 116 33 Q 123 36, 126 44 Q 100 38, 74 44"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2}
          />
        );
      
      case "medium":
        return (
          <g>
            {/* Top covering */}
            <path
              d="M 72 46 Q 75 37, 82 33 Q 91 29, 100 28 Q 109 29, 118 33 Q 125 37, 128 46 Q 100 40, 72 46"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Left side flow */}
            <path d="M 72 46 Q 70 54, 68 62" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            {/* Right side flow */}
            <path d="M 128 46 Q 130 54, 132 62" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      case "long":
        return (
          <g>
            {/* Top covering */}
            <path
              d="M 70 48 Q 73 38, 80 33 Q 90 28, 100 27 Q 110 28, 120 33 Q 127 38, 130 48 Q 100 42, 70 48"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Left long flow */}
            <path d="M 70 48 Q 66 62, 62 80" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
            {/* Right long flow */}
            <path d="M 130 48 Q 134 62, 138 80" fill={hairColor} stroke={outlineColor} strokeWidth={2.5} />
          </g>
        );
      
      case "curly":
        return (
          <g>
            {/* Base layer molded to head */}
            <path
              d="M 72 46 Q 75 37, 82 33 Q 91 29, 100 28 Q 109 29, 118 33 Q 125 37, 128 46"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={1.5}
            />
            {/* Curly puffs on top */}
            <circle cx="80" cy="36" r="7" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="93" cy="31" r="8" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="107" cy="31" r="8" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="120" cy="36" r="7" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="72" cy="44" r="5" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
            <circle cx="128" cy="44" r="5" fill={hairColor} stroke={outlineColor} strokeWidth={1.8} />
          </g>
        );
      
      case "spiky":
        return (
          <g>
            {/* Base layer molded to head */}
            <path
              d="M 74 44 Q 77 36, 84 33 Q 92 30, 100 29 Q 108 30, 116 33 Q 123 36, 126 44"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={1.5}
            />
            {/* Spikes shooting up from the curved base */}
            <path d="M 77 38 L 74 20 L 81 38" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 90 34 L 88 16 L 95 34" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 100 32 L 100 12 L 105 32" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 110 34 L 112 16 L 115 34" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 123 38 L 126 20 L 119 38" fill={hairColor} stroke={outlineColor} strokeWidth={2} />
          </g>
        );
      
      default:
        return (
          <path
            d="M 74 44 Q 77 36, 84 33 Q 92 30, 100 29 Q 108 30, 116 33 Q 123 36, 126 44 Q 100 38, 74 44"
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
            cy={215}
            rx={attrs.legWidth}
            ry="57"
            fill={skinTone}
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
            cy={215}
            rx={attrs.legWidth}
            ry="57"
            fill={skinTone}
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

        {/* === SHORTS - Positioned first to go behind body === */}
        <ellipse
          cx="100"
          cy="165"
          rx={Math.max(attrs.torsoWidth / 2 + 4, 26)}
          ry="20"
          fill={shortsColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
        />

        {/* === BODY/SHIRT === */}
        {/* Single unified body shape that fits properly */}
        <ellipse
          cx="100"
          cy="130"
          rx={Math.max(attrs.chestWidth / 2, attrs.torsoWidth / 2) + 2}
          ry="50"
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="body-shirt"
        />
        
        {/* Chest definition on top */}
        {attrs.chestWidth > 30 && (
          <ellipse
            cx="100"
            cy={115 - attrs.posture / 2}
            rx={attrs.chestWidth / 2 - 2}
            ry={attrs.chestHeight / 2 - 2}
            fill={shirtColor}
            stroke="none"
            className="chest"
            style={{ opacity: 0.3, filter: 'brightness(0.9)' }}
          />
        )}
        
        {/* Chest highlight */}
        <ellipse
          cx="88"
          cy={115 - attrs.posture / 2}
          rx="12"
          ry="16"
          fill={`url(#shine-${size})`}
        />

        {/* === ARMS - Progressive thickness === */}
        {/* Left Arm - positioned to overlap with shoulder */}
        <g className="arm-left">
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - 2}
            cy={105}
            rx={attrs.armWidth + 2}
            ry="50"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <ellipse
              cx={100 - attrs.shoulderWidth / 2 - 2}
              cy={145}
              rx={attrs.armWidth + 3}
              ry="5"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          {/* Hand */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - 2}
            cy={161}
            rx={attrs.armWidth + 4}
            ry={attrs.armWidth + 3}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Arm */}
        <g className="arm-right">
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + 2}
            cy={105}
            rx={attrs.armWidth + 2}
            ry="50"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {wristbands && (
            <ellipse
              cx={100 + attrs.shoulderWidth / 2 + 2}
              cy={145}
              rx={attrs.armWidth + 3}
              ry="5"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + 2}
            cy={161}
            rx={attrs.armWidth + 4}
            ry={attrs.armWidth + 3}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === NECK - Extended down to blend with shirt === */}
        <ellipse
          cx="100"
          cy="88"
          rx={attrs.neckWidth + 2}
          ry="22"
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
