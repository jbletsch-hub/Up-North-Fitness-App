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
        neckWidth: 6, shoulderY: 88, armY: 88, posture: 0, armAngle: 18
      },
      // Still skinny (Levels 6-10)
      { 
        shoulderWidth: 18, armWidth: 5, legWidth: 7, 
        chestWidth: 22, chestHeight: 22, torsoWidth: 23, torsoHeight: 32,
        neckWidth: 7, shoulderY: 88, armY: 88, posture: 2, armAngle: 19
      },
      // Starting to fill out (Levels 11-15)
      { 
        shoulderWidth: 22, armWidth: 7, legWidth: 8, 
        chestWidth: 26, chestHeight: 26, torsoWidth: 24, torsoHeight: 34,
        neckWidth: 8, shoulderY: 88, armY: 88, posture: 4, armAngle: 20
      },
      // Getting toned (Levels 16-20)
      { 
        shoulderWidth: 28, armWidth: 9, legWidth: 10, 
        chestWidth: 32, chestHeight: 30, torsoWidth: 26, torsoHeight: 34,
        neckWidth: 10, shoulderY: 88, armY: 88, posture: 6, armAngle: 21
      },
      // Athletic build (Levels 21-25)
      { 
        shoulderWidth: 34, armWidth: 11, legWidth: 12, 
        chestWidth: 38, chestHeight: 34, torsoWidth: 28, torsoHeight: 36,
        neckWidth: 12, shoulderY: 88, armY: 88, posture: 8, armAngle: 22
      },
      // Strong (Levels 26-30)
      { 
        shoulderWidth: 40, armWidth: 13, legWidth: 14, 
        chestWidth: 44, chestHeight: 38, torsoWidth: 30, torsoHeight: 36,
        neckWidth: 14, shoulderY: 88, armY: 88, posture: 10, armAngle: 23
      },
      // Very muscular (Levels 31-35)
      { 
        shoulderWidth: 46, armWidth: 15, legWidth: 16, 
        chestWidth: 50, chestHeight: 42, torsoWidth: 31, torsoHeight: 38,
        neckWidth: 15, shoulderY: 88, armY: 88, posture: 12, armAngle: 24
      },
      // Beast mode (Levels 36-40) - BIGGER JUMPS START HERE
      { 
        shoulderWidth: 56, armWidth: 18, legWidth: 18, 
        chestWidth: 60, chestHeight: 48, torsoWidth: 32, torsoHeight: 38,
        neckWidth: 16, shoulderY: 88, armY: 88, posture: 14, armAngle: 26
      },
      // JACKED (Levels 41-45) - MUCH BIGGER CHEST, SLIM WAIST
      { 
        shoulderWidth: 68, armWidth: 22, legWidth: 19, 
        chestWidth: 74, chestHeight: 56, torsoWidth: 33, torsoHeight: 40,
        neckWidth: 16, shoulderY: 88, armY: 88, posture: 16, armAngle: 28
      },
      // ABSOLUTE UNIT (Levels 46-50) - MASSIVE CHEST, V-TAPER
      { 
        shoulderWidth: 72, armWidth: 26, legWidth: 20, 
        chestWidth: 90, chestHeight: 64, torsoWidth: 34, torsoHeight: 40,
        neckWidth: 17, shoulderY: 88, armY: 88, posture: 18, armAngle: 30
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
          <clipPath id="head-clip">
            <circle cx="100" cy="60" r="28.5" />
          </clipPath>
        </defs>

        {/* === LEGS === */}
        {/* Left Leg - with muscle definition */}
        <g className="leg-left">
          {/* Thigh (quad area) */}
          <ellipse
            cx={85}
            cy={198}
            rx={Math.max(attrs.legWidth * 0.85, 8)}
            ry="28"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Knee transition - blends thigh to calf */}
          <ellipse
            cx={85}
            cy={224}
            rx={Math.max(attrs.legWidth * 0.75, 7.5)}
            ry="12"
            fill={skinTone}
            stroke="none"
          />
          {/* Calf muscle - defined bulge */}
          <ellipse
            cx={85}
            cy={242}
            rx={Math.max(attrs.legWidth * 0.75, 7.5)}
            ry="18"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Ankle - slimmer */}
          <ellipse
            cx={85}
            cy={263}
            rx={Math.max(attrs.legWidth * 0.6, 6)}
            ry="6"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Quad muscle definition - visible at stage 3+ */}
          {stage >= 2 && attrs.legWidth > 8 && (
            <line
              x1="85"
              y1="185"
              x2="85"
              y2="210"
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity={Math.min(0.15 + stage * 0.03, 0.35)}
            />
          )}
          
          {/* Calf definition line - visible at stage 4+ */}
          {stage >= 3 && attrs.legWidth > 8 && (
            <line
              x1="85"
              y1="238"
              x2="85"
              y2="252"
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity={Math.min(0.12 + stage * 0.03, 0.3)}
            />
          )}
          
          {/* Kneecap - circular definition at the joint */}
          <ellipse
            cx={85}
            cy={226}
            rx={Math.max(attrs.legWidth * 0.55, 5.5)}
            ry={Math.max(attrs.legWidth * 0.55, 5.5)}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth * 1.2}
          />
          
          {/* Shoe at bottom of foot */}
          <ellipse
            cx="85"
            cy="268"
            rx="13"
            ry="8"
            fill="#6B7280"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Leg - with muscle definition */}
        <g className="leg-right">
          {/* Thigh (quad area) */}
          <ellipse
            cx={115}
            cy={198}
            rx={Math.max(attrs.legWidth * 0.85, 8)}
            ry="28"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Knee transition - blends thigh to calf */}
          <ellipse
            cx={115}
            cy={224}
            rx={Math.max(attrs.legWidth * 0.75, 7.5)}
            ry="12"
            fill={skinTone}
            stroke="none"
          />
          {/* Calf muscle - defined bulge */}
          <ellipse
            cx={115}
            cy={242}
            rx={Math.max(attrs.legWidth * 0.75, 7.5)}
            ry="18"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Ankle - slimmer */}
          <ellipse
            cx={115}
            cy={263}
            rx={Math.max(attrs.legWidth * 0.6, 6)}
            ry="6"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Quad muscle definition - visible at stage 3+ */}
          {stage >= 2 && attrs.legWidth > 8 && (
            <line
              x1="115"
              y1="185"
              x2="115"
              y2="210"
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity={Math.min(0.15 + stage * 0.03, 0.35)}
            />
          )}
          
          {/* Calf definition line - visible at stage 4+ */}
          {stage >= 3 && attrs.legWidth > 8 && (
            <line
              x1="115"
              y1="238"
              x2="115"
              y2="252"
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity={Math.min(0.12 + stage * 0.03, 0.3)}
            />
          )}
          
          {/* Kneecap - circular definition at the joint */}
          <ellipse
            cx={115}
            cy={226}
            rx={Math.max(attrs.legWidth * 0.55, 5.5)}
            ry={Math.max(attrs.legWidth * 0.55, 5.5)}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth * 1.2}
          />
          
          {/* Shoe at bottom of foot */}
          <ellipse
            cx="115"
            cy="268"
            rx="13"
            ry="8"
            fill="#6B7280"
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === ARMS - Render BEHIND tank top, angled into shoulder === */}
        {/* Left Arm - angled toward center */}
        <g 
          className="arm-left"
          transform={`rotate(${attrs.armAngle}, ${100 - attrs.shoulderWidth / 2}, ${attrs.shoulderY})`}
        >
          {/* Upper arm */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
            cy={118}
            rx={attrs.armWidth + 2}
            ry="22"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Elbow area - narrower transition */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
            cy={135}
            rx={Math.max(attrs.armWidth * 0.75, 4)}
            ry="10"
            fill={skinTone}
            stroke="none"
          />
          
          {/* Forearm - slimmer than upper arm */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
            cy={156}
            rx={Math.max(attrs.armWidth * 0.7, 4)}
            ry="24"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Bicep definition line - visible at stage 2+ */}
          {stage >= 2 && attrs.armWidth > 5 && (
            <line
              x1={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
              y1={112}
              x2={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
              y2={132}
              stroke={outlineColor}
              strokeWidth="0.9"
              opacity={Math.min(0.18 + stage * 0.03, 0.4)}
            />
          )}
          
          {/* Tricep/outer arm definition - visible at stage 3+ */}
          {stage >= 3 && attrs.armWidth > 6 && (
            <line
              x1={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - (attrs.armWidth * 0.6)}
              y1={115}
              x2={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - (attrs.armWidth * 0.6)}
              y2={135}
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity={Math.min(0.15 + stage * 0.025, 0.35)}
            />
          )}
          
          {/* Forearm vein - visible at stage 4+ */}
          {stage >= 4 && attrs.armWidth > 7 && (
            <>
              <path
                d={`M ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - 2} 145 Q ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2} 153, ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - 1} 161`}
                stroke={outlineColor}
                strokeWidth="0.7"
                fill="none"
                opacity={Math.min(0.12 + stage * 0.03, 0.35)}
              />
              <path
                d={`M ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 + 1.5} 147 Q ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 + 2} 154, ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 + 2} 160`}
                stroke={outlineColor}
                strokeWidth="0.6"
                fill="none"
                opacity={Math.min(0.1 + stage * 0.025, 0.3)}
              />
            </>
          )}
          
          {/* Bicep vein - visible at stage 5+ */}
          {stage >= 5 && attrs.armWidth > 8 && (
            <path
              d={`M ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - 3} 115 Q ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - 2} 123, ${100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2 - 2} 131`}
              stroke={outlineColor}
              strokeWidth="0.7"
              fill="none"
              opacity={Math.min(0.12 + stage * 0.03, 0.35)}
            />
          )}
          
          {wristbands && (
            <ellipse
              cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
              cy={168}
              rx={attrs.armWidth + 1}
              ry="5"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          {/* Hand - proportional */}
          <ellipse
            cx={100 - attrs.shoulderWidth / 2 - attrs.armWidth / 2}
            cy={180}
            rx={Math.max(attrs.armWidth * 0.7, 4)}
            ry={Math.max(attrs.armWidth * 0.6, 3.5)}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>
        
        {/* Right Arm - angled toward center */}
        <g 
          className="arm-right"
          transform={`rotate(-${attrs.armAngle}, ${100 + attrs.shoulderWidth / 2}, ${attrs.shoulderY})`}
        >
          {/* Upper arm */}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
            cy={118}
            rx={attrs.armWidth + 2}
            ry="22"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Elbow area - narrower transition */}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
            cy={135}
            rx={Math.max(attrs.armWidth * 0.75, 4)}
            ry="10"
            fill={skinTone}
            stroke="none"
          />
          
          {/* Forearm - slimmer than upper arm */}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
            cy={156}
            rx={Math.max(attrs.armWidth * 0.7, 4)}
            ry="24"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Bicep definition line - visible at stage 2+ */}
          {stage >= 2 && attrs.armWidth > 5 && (
            <line
              x1={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
              y1={112}
              x2={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
              y2={132}
              stroke={outlineColor}
              strokeWidth="0.9"
              opacity={Math.min(0.18 + stage * 0.03, 0.4)}
            />
          )}
          
          {/* Tricep/outer arm definition - visible at stage 3+ */}
          {stage >= 3 && attrs.armWidth > 6 && (
            <line
              x1={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + (attrs.armWidth * 0.6)}
              y1={115}
              x2={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + (attrs.armWidth * 0.6)}
              y2={135}
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity={Math.min(0.15 + stage * 0.025, 0.35)}
            />
          )}
          
          {/* Forearm vein - visible at stage 4+ */}
          {stage >= 4 && attrs.armWidth > 7 && (
            <>
              <path
                d={`M ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + 2} 145 Q ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2} 153, ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + 1} 161`}
                stroke={outlineColor}
                strokeWidth="0.7"
                fill="none"
                opacity={Math.min(0.12 + stage * 0.03, 0.35)}
              />
              <path
                d={`M ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 - 1.5} 147 Q ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 - 2} 154, ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 - 2} 160`}
                stroke={outlineColor}
                strokeWidth="0.6"
                fill="none"
                opacity={Math.min(0.1 + stage * 0.025, 0.3)}
              />
            </>
          )}
          
          {/* Bicep vein - visible at stage 5+ */}
          {stage >= 5 && attrs.armWidth > 8 && (
            <path
              d={`M ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + 3} 115 Q ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + 2} 123, ${100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2 + 2} 131`}
              stroke={outlineColor}
              strokeWidth="0.7"
              fill="none"
              opacity={Math.min(0.12 + stage * 0.03, 0.35)}
            />
          )}
          
          {wristbands && (
            <ellipse
              cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
              cy={168}
              rx={attrs.armWidth + 1}
              ry="5"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
            />
          )}
          {/* Hand - proportional */}
          <ellipse
            cx={100 + attrs.shoulderWidth / 2 + attrs.armWidth / 2}
            cy={180}
            rx={Math.max(attrs.armWidth * 0.7, 4)}
            ry={Math.max(attrs.armWidth * 0.6, 3.5)}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
        </g>

        {/* === BODY/SHIRT === */}
        {/* Tank top with V-taper shape (wide chest, narrow waist) */}
        <path
          d={`
            M ${100 - (attrs.chestWidth / 2 + 6)} 88
            L ${100 - (attrs.chestWidth / 2 + 6)} 115
            Q ${100 - (attrs.chestWidth / 2 + 6)} 135, ${100 - attrs.torsoWidth / 2} 155
            L ${100 - attrs.torsoWidth / 2} 165
            Q ${100 - attrs.torsoWidth / 2} 170, ${100} 170
            Q ${100 + attrs.torsoWidth / 2} 170, ${100 + attrs.torsoWidth / 2} 165
            L ${100 + attrs.torsoWidth / 2} 155
            Q ${100 + (attrs.chestWidth / 2 + 6)} 135, ${100 + (attrs.chestWidth / 2 + 6)} 115
            L ${100 + (attrs.chestWidth / 2 + 6)} 88
            Q ${100} 85, ${100 - (attrs.chestWidth / 2 + 6)} 88
            Z
          `}
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="body-shirt"
        />

        {/* === SHORTS - Smaller === */}
        <ellipse
          cx="100"
          cy="170"
          rx={Math.max(attrs.torsoWidth / 2 + 2, 24)}
          ry="15"
          fill={shortsColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
        />

        {/* Chest definition on top */}
        {attrs.chestWidth > 30 && (
          <ellipse
            cx="100"
            cy={112 - attrs.posture / 2}
            rx={attrs.chestWidth / 2 - 2}
            ry={attrs.chestHeight / 2 - 2}
            fill={shirtColor}
            stroke="none"
            className="chest"
            style={{ opacity: 0.3, filter: 'brightness(0.9)' }}
          />
        )}
        
        {/* === NEW CHEST DEFINITION SYSTEM === */}
        {/* Stage 2+: Center vertical line that grows progressively longer */}
        {stage >= 2 && (
          <line
            x1="100"
            y1={110 - attrs.posture / 2}
            x2="100"
            y2={118 - attrs.posture / 2 + stage * 1.2}
            stroke={outlineColor}
            strokeWidth={1.2 + stage * 0.05}
            opacity={Math.min(0.25 + stage * 0.02, 0.45)}
          />
        )}
        
        {/* Stage 3+: Curved pec lines that grow progressively longer - follow muscle contour */}
        {stage >= 3 && (
          <>
            {/* Left pec bottom line - curved to show definition */}
            <path
              d={`M ${100 - (12 + stage * 1.2)} ${125 - attrs.posture / 2} Q ${100 - (8 + stage * 0.8)} ${126 - attrs.posture / 2 + stage * 0.15}, ${100 - 3} ${125 - attrs.posture / 2}`}
              stroke={outlineColor}
              strokeWidth={1.1 + stage * 0.05}
              opacity={Math.min(0.25 + stage * 0.03, 0.6)}
              fill="none"
            />
            {/* Right pec bottom line - curved to show definition */}
            <path
              d={`M ${100 + 3} ${125 - attrs.posture / 2} Q ${100 + (8 + stage * 0.8)} ${126 - attrs.posture / 2 + stage * 0.15}, ${100 + (12 + stage * 1.2)} ${125 - attrs.posture / 2}`}
              stroke={outlineColor}
              strokeWidth={1.1 + stage * 0.05}
              opacity={Math.min(0.25 + stage * 0.03, 0.6)}
              fill="none"
            />
          </>
        )}
        
        {/* Ab definition lines through shirt - visible at stage 3+ */}
        {stage >= 3 && (
          <>
            {/* Vertical center ab line separates left and right abs */}
            <line
              x1="100"
              y1="125"
              x2="100"
              y2="155"
              stroke={outlineColor}
              strokeWidth="1.4"
              opacity={Math.min(0.2 + stage * 0.04, 0.5)}
            />
            
            {/* Top abs (horizontal line) */}
            <line
              x1="93"
              y1="130"
              x2="107"
              y2="130"
              stroke={outlineColor}
              strokeWidth="1.4"
              opacity={Math.min(0.2 + stage * 0.045, 0.5)}
            />
            
            {/* Middle abs (horizontal line) - visible at stage 4+ */}
            {stage >= 4 && (
              <line
                x1="92"
                y1="140"
                x2="108"
                y2="140"
                stroke={outlineColor}
                strokeWidth="1.4"
                opacity={Math.min(0.2 + stage * 0.045, 0.5)}
              />
            )}
            
            {/* Lower abs (horizontal line) - visible at stage 5+ */}
            {stage >= 5 && (
              <line
                x1="93"
                y1="150"
                x2="107"
                y2="150"
                stroke={outlineColor}
                strokeWidth="1.4"
                opacity={Math.min(0.2 + stage * 0.045, 0.5)}
              />
            )}
          </>
        )}
        
        {/* Chest highlight */}
        <ellipse
          cx="88"
          cy={112 - attrs.posture / 2}
          rx="12"
          ry="16"
          fill={`url(#shine-${size})`}
        />

        {/* === NECK - Connects to shirt === */}
        <ellipse
          cx="100"
          cy="86"
          rx={attrs.neckWidth}
          ry="20"
          fill={skinTone}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
        />
        
        {/* Shoulder caps - cover gap between neck and tank top */}
        <ellipse
          cx={100 - (attrs.chestWidth / 2 + 3)}
          cy="90"
          rx="8"
          ry="6"
          fill={skinTone}
          stroke="none"
        />
        <ellipse
          cx={100 + (attrs.chestWidth / 2 + 3)}
          cy="90"
          rx="8"
          ry="6"
          fill={skinTone}
          stroke="none"
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
          <g className="eyes" clipPath="url(#head-clip)">
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
