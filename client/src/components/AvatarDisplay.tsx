interface AvatarDisplayProps {
  level: number;
  gender?: string;
  skinColor?: string;
  characterType?: string;
  shirtColor?: string;
  shortsColor?: string;
  headband?: boolean;
  wristbands?: boolean;
  hairStyle?: string;
  hairColor?: string;
  facialHair?: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarDisplay({
  level,
  gender = "male",
  skinColor = "#FFCC99",
  characterType = "classic",
  shirtColor = "#FF5722",
  shortsColor = "#20B2AA",
  headband = false,
  wristbands = false,
  hairStyle = "short",
  hairColor = "#8B4513",
  facialHair = "none",
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

  // Character type multipliers - different body aesthetics
  const getCharacterMultipliers = () => {
    switch (characterType) {
      case "bulky":
        return {
          shoulder: 1.15,
          chest: 1.2,
          arm: 1.15,
          torso: 1.1,
          leg: 1.1,
          neck: 1.2,
        };
      case "athletic":
        return {
          shoulder: 0.95,
          chest: 0.9,
          arm: 0.9,
          torso: 0.85,
          leg: 0.95,
          neck: 0.9,
        };
      case "powerlifter":
        return {
          shoulder: 1.1,
          chest: 1.15,
          arm: 1.2,
          torso: 1.25,
          leg: 1.15,
          neck: 1.3,
        };
      case "classic":
      default:
        return {
          shoulder: 1.0,
          chest: 1.0,
          arm: 1.0,
          torso: 1.0,
          leg: 1.0,
          neck: 1.0,
        };
    }
  };

  const multipliers = getCharacterMultipliers();
  
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
    
    const baseAttrs = progressionStages[stage];
    
    // Apply character type multipliers
    let attrs = {
      shoulderWidth: Math.round(baseAttrs.shoulderWidth * multipliers.shoulder),
      armWidth: Math.round(baseAttrs.armWidth * multipliers.arm),
      legWidth: Math.round(baseAttrs.legWidth * multipliers.leg),
      chestWidth: Math.round(baseAttrs.chestWidth * multipliers.chest),
      chestHeight: Math.round(baseAttrs.chestHeight * multipliers.chest),
      torsoWidth: Math.round(baseAttrs.torsoWidth * multipliers.torso),
      torsoHeight: baseAttrs.torsoHeight, // Keep height consistent
      neckWidth: Math.round(baseAttrs.neckWidth * multipliers.neck),
      shoulderY: baseAttrs.shoulderY,
      armY: baseAttrs.armY,
      posture: baseAttrs.posture,
      armAngle: baseAttrs.armAngle,
    };
    
    // Apply gender-based adjustments for female body type
    if (gender === "female") {
      // Calculate hip width based on stage - females have wider hips
      const hipMultiplier = 1.3 + (stage * 0.05); // Hips grow from 1.3x to 1.75x torso width
      const hipWidth = Math.round(attrs.torsoWidth * hipMultiplier);
      
      attrs = {
        ...attrs,
        shoulderWidth: Math.round(attrs.shoulderWidth * 0.75), // Significantly narrower shoulders
        armWidth: Math.round(attrs.armWidth * 0.85), // Slimmer arms
        chestWidth: Math.round(attrs.chestWidth * 0.72), // Much more feminine chest
        chestHeight: Math.round(attrs.chestHeight * 0.75),
        torsoWidth: Math.round(attrs.torsoWidth * 0.75), // Narrower waist
        neckWidth: Math.round(attrs.neckWidth * 0.8), // More slender neck
        hipWidth: hipWidth, // Add hip width for females
      };
    } else {
      attrs = {
        ...attrs,
        hipWidth: Math.round(attrs.torsoWidth * 1.1), // Males have minimal hip flare
      };
    }
    
    return attrs;
  };
  
  const attrs = getStageAttributes();
  const skinTone = skinColor;
  const outlineColor = "#1A1A1A";
  const outlineWidth = 2.5;
  
  // Render hair with realistic detail
  const renderHair = () => {
    // Slightly darker color for shadows/depth
    const darkerHair = `${hairColor}DD`;
    
    switch (hairStyle) {
      case "bald":
        return null;
      
      case "buzzcut":
        return (
          <g>
            {/* Main hair shape - close to scalp */}
            <path
              d="M 74 42 Q 76 34, 83 31 Q 91 29, 100 29 Q 109 29, 117 31 Q 124 34, 126 42"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={1.5}
            />
            {/* Subtle texture lines */}
            <path d="M 80 38 Q 82 34, 84 32" stroke={darkerHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 90 35 Q 92 32, 94 30" stroke={darkerHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 100 34 Q 100 31, 100 29" stroke={darkerHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 110 35 Q 108 32, 106 30" stroke={darkerHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 120 38 Q 118 34, 116 32" stroke={darkerHair} strokeWidth="0.8" fill="none" opacity="0.5" />
          </g>
        );
      
      case "short":
        return (
          <g>
            {/* Main hair volume */}
            <path
              d="M 72 46 Q 75 35, 82 31 Q 90 28, 100 27 Q 110 28, 118 31 Q 125 35, 128 46 L 126 48 Q 100 40, 74 48 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Front hair detail with natural flow */}
            <path d="M 88 30 Q 90 32, 92 36" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M 98 28 Q 100 30, 100 34" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M 108 30 Q 106 32, 104 36" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.6" />
            {/* Side texture */}
            <path d="M 76 42 Q 78 40, 80 38" stroke={darkerHair} strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 124 42 Q 122 40, 120 38" stroke={darkerHair} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        );
      
      case "medium":
        return (
          <g>
            {/* Full head coverage - solid base */}
            <path
              d="M 68 50 Q 70 35, 78 29 Q 88 25, 100 24 Q 112 25, 122 29 Q 130 35, 132 50 
                 L 132 65 Q 130 60, 126 56 Q 120 50, 115 48 
                 L 115 48 Q 107 46, 100 46 Q 93 46, 85 48 
                 Q 80 50, 74 56 Q 70 60, 68 65 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Left side volume and flow */}
            <path 
              d="M 68 50 Q 65 58, 63 68 Q 62 74, 64 78 L 70 76 Q 69 70, 70 64 Q 71 56, 72 50 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2} 
            />
            {/* Right side volume and flow */}
            <path 
              d="M 132 50 Q 135 58, 137 68 Q 138 74, 136 78 L 130 76 Q 131 70, 130 64 Q 129 56, 128 50 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2} 
            />
            {/* Layered texture for depth */}
            <path d="M 78 32 Q 82 38, 84 46" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 88 28 Q 92 36, 94 44" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 100 26 Q 100 34, 100 42" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 112 28 Q 108 36, 106 44" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 122 32 Q 118 38, 116 46" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Side flow texture */}
            <path d="M 66 58 Q 67 65, 68 72" stroke={darkerHair} strokeWidth="1.3" fill="none" opacity="0.5" />
            <path d="M 134 58 Q 133 65, 132 72" stroke={darkerHair} strokeWidth="1.3" fill="none" opacity="0.5" />
          </g>
        );
      
      case "long":
        return (
          <g>
            {/* Full top volume - solid coverage */}
            <path
              d="M 66 52 Q 68 36, 76 29 Q 86 24, 100 23 Q 114 24, 124 29 Q 132 36, 134 52
                 L 134 68 Q 132 62, 128 57 Q 122 52, 116 50
                 Q 108 48, 100 48 Q 92 48, 84 50
                 Q 78 52, 72 57 Q 68 62, 66 68 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Left side - full flowing volume */}
            <path 
              d="M 66 52 Q 62 64, 58 78 Q 56 86, 57 94 Q 58 98, 61 100
                 L 68 97 Q 67 92, 68 86 Q 69 78, 70 70 Q 71 60, 72 52 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2} 
            />
            {/* Right side - full flowing volume */}
            <path 
              d="M 134 52 Q 138 64, 142 78 Q 144 86, 143 94 Q 142 98, 139 100
                 L 132 97 Q 133 92, 132 86 Q 131 78, 130 70 Q 129 60, 128 52 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2} 
            />
            {/* Additional middle layers for fuller look */}
            <path 
              d="M 75 50 Q 72 62, 70 76 Q 69 84, 70 90 L 74 88 Q 74 82, 75 75 Q 76 64, 77 52 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={1.8} 
              opacity="0.9"
            />
            <path 
              d="M 125 50 Q 128 62, 130 76 Q 131 84, 130 90 L 126 88 Q 126 82, 125 75 Q 124 64, 123 52 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={1.8} 
              opacity="0.9"
            />
            {/* Flowing texture lines */}
            <path d="M 64 60 Q 62 72, 61 86" stroke={darkerHair} strokeWidth="1.6" fill="none" opacity="0.5" />
            <path d="M 70 54 Q 68 68, 67 82" stroke={darkerHair} strokeWidth="1.4" fill="none" opacity="0.5" />
            <path d="M 136 60 Q 138 72, 139 86" stroke={darkerHair} strokeWidth="1.6" fill="none" opacity="0.5" />
            <path d="M 130 54 Q 132 68, 133 82" stroke={darkerHair} strokeWidth="1.4" fill="none" opacity="0.5" />
            <path d="M 90 26 Q 92 42, 94 58" stroke={darkerHair} strokeWidth="1.3" fill="none" opacity="0.4" />
            <path d="M 110 26 Q 108 42, 106 58" stroke={darkerHair} strokeWidth="1.3" fill="none" opacity="0.4" />
          </g>
        );
      
      case "curly":
        return (
          <g>
            {/* Solid afro/curly base - raised higher and fuller */}
            <ellipse 
              cx="100" 
              cy="24" 
              rx="38" 
              ry="28" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2}
            />
            {/* Additional volume layers for shape */}
            <ellipse 
              cx="100" 
              cy="20" 
              rx="34" 
              ry="24" 
              fill={hairColor} 
              stroke="none"
              opacity="0.9"
            />
            <ellipse 
              cx="100" 
              cy="16" 
              rx="30" 
              ry="20" 
              fill={hairColor} 
              stroke="none"
              opacity="0.8"
            />
            {/* Textured curly strands using curved paths instead of circles */}
            <path d="M 68 26 Q 70 22, 72 26 Q 74 30, 72 34" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 78 18 Q 80 14, 82 18 Q 84 22, 82 26" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 88 12 Q 90 8, 92 12 Q 94 16, 92 20" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 100 8 Q 102 4, 104 8 Q 106 12, 104 16" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 112 12 Q 114 8, 116 12 Q 118 16, 116 20" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 122 18 Q 124 14, 126 18 Q 128 22, 126 26" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 132 26 Q 134 22, 136 26 Q 138 30, 136 34" stroke={darkerHair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Mid-level curl texture */}
            <path d="M 74 22 Q 76 19, 78 22 Q 80 25, 78 28" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            <path d="M 94 16 Q 96 13, 98 16 Q 100 19, 98 22" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            <path d="M 106 16 Q 108 13, 110 16 Q 112 19, 110 22" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            <path d="M 126 22 Q 128 19, 130 22 Q 132 25, 130 28" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            {/* Bottom layer texture */}
            <path d="M 70 32 Q 72 29, 74 32 Q 76 35, 74 38" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 84 28 Q 86 25, 88 28 Q 90 31, 88 34" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 116 28 Q 118 25, 120 28 Q 122 31, 120 34" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
            <path d="M 130 32 Q 132 29, 134 32 Q 136 35, 134 38" stroke={darkerHair} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
          </g>
        );
      
      case "spiky":
        return (
          <g>
            {/* Solid base foundation - full head coverage */}
            <path
              d="M 70 48 Q 72 36, 80 31 Q 89 27, 100 26 Q 111 27, 120 31 Q 128 36, 130 48
                 L 128 50 Q 120 46, 110 44 Q 100 43, 90 44 Q 80 46, 72 50 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Multiple wide spikes for full coverage - left side */}
            <path d="M 70 45 Q 68 34, 66 22 Q 66 16, 68 12 Q 72 16, 75 24 Q 77 34, 78 45 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 80 40 Q 79 28, 78 18 Q 78 12, 80 8 Q 84 12, 86 20 Q 88 30, 89 40 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 90 36 Q 89 24, 88 14 Q 88 8, 90 4 Q 94 8, 96 16 Q 98 26, 99 36 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            {/* Center spike - tallest */}
            <path d="M 98 34 Q 98 20, 98 8 Q 98 2, 100 0 Q 102 2, 102 8 Q 102 20, 102 34 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            {/* Multiple wide spikes - right side */}
            <path d="M 110 36 Q 111 24, 112 14 Q 112 8, 110 4 Q 106 8, 104 16 Q 102 26, 101 36 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 120 40 Q 121 28, 122 18 Q 122 12, 120 8 Q 116 12, 114 20 Q 112 30, 111 40 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            <path d="M 130 45 Q 132 34, 134 22 Q 134 16, 132 12 Q 128 16, 125 24 Q 123 34, 122 45 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={2} />
            {/* Additional smaller spikes between main ones for fuller coverage */}
            <path d="M 75 42 Q 74 32, 73 22 Q 73 18, 75 15 Q 78 18, 80 26 Q 82 34, 83 42 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={1.6} opacity="0.9" />
            <path d="M 95 38 Q 94 26, 93 16 Q 93 12, 95 9 Q 98 12, 100 20 Q 102 28, 103 38 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={1.6} opacity="0.9" />
            <path d="M 115 40 Q 116 30, 117 20 Q 117 16, 115 13 Q 112 16, 110 24 Q 108 32, 107 40 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={1.6} opacity="0.9" />
            <path d="M 125 42 Q 126 32, 127 22 Q 127 18, 125 15 Q 122 18, 120 26 Q 118 34, 117 42 Z" 
              fill={hairColor} stroke={outlineColor} strokeWidth={1.6} opacity="0.9" />
          </g>
        );
      
      case "faded":
        return (
          <g>
            {/* Modern fade - tight on sides, volume on top */}
            <path
              d="M 76 48 Q 78 38, 82 32 Q 88 28, 100 27 Q 112 28, 118 32 Q 122 38, 124 48"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Top volume - textured and styled */}
            <path
              d="M 85 32 Q 88 26, 92 22 Q 96 19, 100 18 Q 104 19, 108 22 Q 112 26, 115 32 
                 L 112 34 Q 108 30, 100 28 Q 92 30, 88 34 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Fade gradient effect on sides */}
            <path d="M 78 46 Q 79 44, 80 42" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.3" />
            <path d="M 82 44 Q 83 42, 84 40" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M 122 46 Q 121 44, 120 42" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.3" />
            <path d="M 118 44 Q 117 42, 116 40" stroke={darkerHair} strokeWidth="1.5" fill="none" opacity="0.4" />
            {/* Top texture lines */}
            <path d="M 92 24 Q 94 26, 96 30" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 100 20 Q 100 24, 100 28" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 108 24 Q 106 26, 104 30" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.5" />
          </g>
        );
      
      case "ponytail":
        return (
          <g>
            {/* Front hair - parted with volume */}
            <path
              d="M 72 48 Q 74 36, 80 30 Q 88 26, 100 25 Q 112 26, 120 30 Q 126 36, 128 48
                 L 126 50 Q 120 46, 100 44 Q 80 46, 74 50 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Side parts */}
            <path 
              d="M 72 48 Q 70 54, 69 62 L 73 62 Q 74 56, 75 50 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2} 
            />
            <path 
              d="M 128 48 Q 130 54, 131 62 L 127 62 Q 126 56, 125 50 Z" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2} 
            />
            {/* Ponytail base - gathered at back */}
            <ellipse 
              cx="100" 
              cy="78" 
              rx="12" 
              ry="8" 
              fill={hairColor} 
              stroke={outlineColor} 
              strokeWidth={2}
            />
            {/* Ponytail length - flowing down */}
            <path
              d="M 92 82 Q 94 90, 95 100 Q 96 108, 97 116 
                 L 103 116 Q 104 108, 105 100 Q 106 90, 108 82 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Ponytail tip - tapered end */}
            <path
              d="M 97 116 Q 98 122, 100 126 Q 102 122, 103 116 Z"
              fill={hairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Texture strands in ponytail */}
            <path d="M 96 90 Q 97 100, 98 110" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 100 88 Q 100 98, 100 108" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 104 90 Q 103 100, 102 110" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.5" />
            {/* Front texture */}
            <path d="M 86 30 Q 88 34, 90 40" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M 100 27 Q 100 32, 100 38" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.4" />
            <path d="M 114 30 Q 112 34, 110 40" stroke={darkerHair} strokeWidth="1.2" fill="none" opacity="0.4" />
          </g>
        );
      
      default:
        return (
          <path
            d="M 72 46 Q 75 35, 82 31 Q 90 28, 100 27 Q 110 28, 118 31 Q 125 35, 128 46 L 126 48 Q 100 40, 74 48 Z"
            fill={hairColor}
            stroke={outlineColor}
            strokeWidth={2}
          />
        );
    }
  };

  // Render facial hair with realistic detail (matching hair style)
  const renderFacialHair = () => {
    // Use a darker shade for facial hair (typically darker than head hair)
    const facialHairColor = `${hairColor}CC`;
    const darkerFacialHair = `${hairColor}99`;
    
    switch (facialHair) {
      case "none":
        return null;
      
      case "stubble":
        return (
          <g className="stubble">
            {/* Light stubble pattern - small dots creating shadow effect */}
            {/* Mustache area */}
            <circle cx="92" cy="68" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="96" cy="68" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="100" cy="68" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="104" cy="68" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="108" cy="68" r="0.6" fill={facialHairColor} opacity="0.4" />
            {/* Lower face - jawline and chin */}
            <circle cx="82" cy="74" r="0.6" fill={facialHairColor} opacity="0.35" />
            <circle cx="86" cy="76" r="0.6" fill={facialHairColor} opacity="0.35" />
            <circle cx="90" cy="78" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="94" cy="80" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="100" cy="82" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="106" cy="80" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="110" cy="78" r="0.6" fill={facialHairColor} opacity="0.4" />
            <circle cx="114" cy="76" r="0.6" fill={facialHairColor} opacity="0.35" />
            <circle cx="118" cy="74" r="0.6" fill={facialHairColor} opacity="0.35" />
            {/* Additional scattered stubble for texture */}
            <circle cx="88" cy="72" r="0.5" fill={facialHairColor} opacity="0.3" />
            <circle cx="96" cy="76" r="0.5" fill={facialHairColor} opacity="0.3" />
            <circle cx="104" cy="76" r="0.5" fill={facialHairColor} opacity="0.3" />
            <circle cx="112" cy="72" r="0.5" fill={facialHairColor} opacity="0.3" />
          </g>
        );
      
      case "smallbeard":
        return (
          <g className="small-beard">
            {/* Buzzcut-style beard - close to face covering bottom */}
            <path
              d="M 76 70 Q 78 78, 83 83 Q 91 87, 100 87 Q 109 87, 117 83 Q 122 78, 124 70"
              fill={facialHairColor}
              stroke={outlineColor}
              strokeWidth={1.5}
            />
            {/* Subtle texture lines (like buzzcut) */}
            <path d="M 80 76 Q 82 80, 84 82" stroke={darkerFacialHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 90 80 Q 92 83, 94 85" stroke={darkerFacialHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 100 82 Q 100 85, 100 87" stroke={darkerFacialHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 110 80 Q 108 83, 106 85" stroke={darkerFacialHair} strokeWidth="0.8" fill="none" opacity="0.5" />
            <path d="M 120 76 Q 118 80, 116 82" stroke={darkerFacialHair} strokeWidth="0.8" fill="none" opacity="0.5" />
          </g>
        );
      
      case "bigbeard":
        return (
          <g className="big-beard">
            {/* Short hair-style beard - starts above mouth, flows down long, fully covers sides */}
            <path
              d="M 72 65 Q 74 72, 80 81 Q 88 93, 100 95 Q 112 93, 120 81 Q 126 72, 128 65 L 126 67 Q 100 77, 74 67 Z"
              fill={facialHairColor}
              stroke={outlineColor}
              strokeWidth={2}
            />
            {/* Natural flowing texture (like short hair) */}
            <path d="M 86 70 Q 88 75, 90 82" stroke={darkerFacialHair} strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M 98 72 Q 100 78, 100 85" stroke={darkerFacialHair} strokeWidth="1.2" fill="none" opacity="0.6" />
            <path d="M 110 70 Q 108 75, 106 82" stroke={darkerFacialHair} strokeWidth="1.2" fill="none" opacity="0.6" />
            {/* Side texture */}
            <path d="M 74 67 Q 76 72, 78 77" stroke={darkerFacialHair} strokeWidth="1" fill="none" opacity="0.5" />
            <path d="M 126 67 Q 124 72, 122 77" stroke={darkerFacialHair} strokeWidth="1" fill="none" opacity="0.5" />
          </g>
        );
      
      default:
        return null;
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
            M ${100 - (attrs.chestWidth / 2 + 6)} 83
            L ${100 - (attrs.chestWidth / 2 + 6)} 115
            Q ${100 - (attrs.chestWidth / 2 + 6)} 135, ${100 - attrs.torsoWidth / 2} 155
            L ${100 - attrs.torsoWidth / 2} 165
            Q ${100 - attrs.torsoWidth / 2} 170, ${100} 170
            Q ${100 + attrs.torsoWidth / 2} 170, ${100 + attrs.torsoWidth / 2} 165
            L ${100 + attrs.torsoWidth / 2} 155
            Q ${100 + (attrs.chestWidth / 2 + 6)} 135, ${100 + (attrs.chestWidth / 2 + 6)} 115
            L ${100 + (attrs.chestWidth / 2 + 6)} 83
            Q ${100} 80, ${100 - (attrs.chestWidth / 2 + 6)} 83
            Z
          `}
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="body-shirt"
        />

        {/* === SHORTS - Hip-aware === */}
        <ellipse
          cx="100"
          cy="170"
          rx={Math.max(attrs.hipWidth / 2 + 2, 24)}
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
        {/* Stage 2+: Center vertical line that grows progressively longer and thicker */}
        {stage >= 2 && (
          <line
            x1="100"
            y1={108 - attrs.posture / 2}
            x2="100"
            y2={120 - attrs.posture / 2 + stage * 1.8}
            stroke={outlineColor}
            strokeWidth={1.4 + stage * 0.08}
            opacity={Math.min(0.3 + stage * 0.03, 0.55)}
          />
        )}
        
        {/* Stage 3+: Progressive pec lines - barely visible at stage 3, HUGE at stage 9 */}
        {stage >= 3 && (
          <>
            {/* Left pec bottom line - grows dramatically from small to covering whole chest */}
            <path
              d={`M ${100 - (3 + stage * 5)} ${123 - attrs.posture / 2} Q ${100 - (2 + stage * 3)} ${123 - attrs.posture / 2 + stage * 0.5}, ${100 - 3} ${123 - attrs.posture / 2}`}
              stroke={outlineColor}
              strokeWidth={1.2 + stage * 0.1}
              opacity={Math.min(0.25 + stage * 0.045, 0.7)}
              fill="none"
            />
            {/* Right pec bottom line - grows dramatically from small to covering whole chest */}
            <path
              d={`M ${100 + 3} ${123 - attrs.posture / 2} Q ${100 + (2 + stage * 3)} ${123 - attrs.posture / 2 + stage * 0.5}, ${100 + (3 + stage * 5)} ${123 - attrs.posture / 2}`}
              stroke={outlineColor}
              strokeWidth={1.2 + stage * 0.1}
              opacity={Math.min(0.25 + stage * 0.045, 0.7)}
              fill="none"
            />
          </>
        )}
        
        {/* Stage 8+: Chest striations - extreme muscle definition */}
        {stage >= 8 && (
          <>
            {/* Left chest striation - diagonal line showing muscle fiber detail */}
            <line
              x1={100 - 18}
              y1={115 - attrs.posture / 2}
              x2={100 - 8}
              y2={118 - attrs.posture / 2}
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity="0.35"
            />
            {/* Right chest striation - diagonal line showing muscle fiber detail */}
            <line
              x1={100 + 8}
              y1={118 - attrs.posture / 2}
              x2={100 + 18}
              y2={115 - attrs.posture / 2}
              stroke={outlineColor}
              strokeWidth="0.8"
              opacity="0.35"
            />
            
            {/* Stage 9: Additional striations for maximum definition */}
            {stage >= 9 && (
              <>
                {/* Left chest second striation - lower diagonal */}
                <line
                  x1={100 - 20}
                  y1={118 - attrs.posture / 2}
                  x2={100 - 10}
                  y2={121 - attrs.posture / 2}
                  stroke={outlineColor}
                  strokeWidth="0.8"
                  opacity="0.35"
                />
                {/* Right chest second striation - lower diagonal */}
                <line
                  x1={100 + 10}
                  y1={121 - attrs.posture / 2}
                  x2={100 + 20}
                  y2={118 - attrs.posture / 2}
                  stroke={outlineColor}
                  strokeWidth="0.8"
                  opacity="0.35"
                />
              </>
            )}
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
            stroke="none"
          />
          
          {/* Head outline - conditionally render based on facial hair */}
          {facialHair === "bigbeard" ? (
            // For big beard: only draw upper arc (forehead and temples), skip jawline
            <path
              d="M 72 60 Q 72 38, 86 32 Q 93 28, 100 28 Q 107 28, 114 32 Q 128 38, 128 60"
              fill="none"
              stroke={outlineColor}
              strokeWidth={outlineWidth}
            />
          ) : (
            // For other facial hair: draw full circle outline
            <circle
              cx="100"
              cy="60"
              r="28"
              fill="none"
              stroke={outlineColor}
              strokeWidth={outlineWidth}
            />
          )}
          
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
          
          {/* Facial Hair */}
          {renderFacialHair()}
          
          {/* Headband */}
          {headband && (
            <g className="headband">
              <ellipse
                cx="100"
                cy="47"
                rx="30"
                ry="4"
                fill="#E74C3C"
                stroke={outlineColor}
                strokeWidth={2}
              />
              <circle cx="127" cy="47" r="3" fill="#C0392B" stroke={outlineColor} strokeWidth={1.5} />
            </g>
          )}
          
          {/* Eyes - simple and clean */}
          <g className="eyes" clipPath="url(#head-clip)">
            {/* Left eye */}
            <ellipse cx="89" cy="64" rx="5" ry="6" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2} />
            <circle cx="90" cy="65" r="3" fill={outlineColor} className="pupil-left" />
            <circle cx="91" cy="63" r="1.2" fill="#FFFFFF" className="eye-shine" />
            
            {/* Right eye */}
            <ellipse cx="111" cy="64" rx="5" ry="6" fill="#FFFFFF" stroke={outlineColor} strokeWidth={2} />
            <circle cx="112" cy="65" r="3" fill={outlineColor} className="pupil-right" />
            <circle cx="113" cy="63" r="1.2" fill="#FFFFFF" className="eye-shine" />
          </g>
          
          {/* Nose */}
          <ellipse cx="100" cy="69" rx="2.5" ry="3" fill="#FFAA66" />
          
          {/* Eyebrows - get more intense as you progress */}
          {stage <= 2 && (
            <>
              {/* Light, uncertain eyebrows */}
              <path d="M 85 54 Q 89 53, 93 54" stroke={outlineColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M 107 54 Q 111 53, 115 54" stroke={outlineColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </>
          )}
          {stage >= 3 && stage <= 5 && (
            <>
              {/* Confident, defined eyebrows */}
              <path d="M 84 53 Q 89 51, 94 52" stroke={outlineColor} strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 106 52 Q 111 51, 116 53" stroke={outlineColor} strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}
          {stage >= 6 && stage <= 7 && (
            <>
              {/* Strong, slightly angled eyebrows */}
              <path d="M 83 52 Q 89 49, 95 51" stroke={outlineColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M 105 51 Q 111 49, 117 52" stroke={outlineColor} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </>
          )}
          {stage >= 8 && (
            <>
              {/* Intense, determined angled eyebrows */}
              <path d="M 82 51 Q 89 47, 96 50" stroke={outlineColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 104 50 Q 111 47, 118 51" stroke={outlineColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          )}
          
          {/* Mouth - progressive expressions */}
          {stage <= 2 && (
            /* Small, uncertain smile - just starting */
            <path
              d="M 94 75 Q 100 78, 106 75"
              stroke={outlineColor}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {stage >= 3 && stage <= 5 && (
            /* Bigger, confident grin - gaining momentum */
            <path
              d="M 92 75 Q 100 81, 108 75"
              stroke={outlineColor}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {stage >= 6 && stage <= 7 && (
            /* Wide, powerful grin - feeling strong */
            <path
              d="M 90 74 Q 100 82, 110 74"
              stroke={outlineColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          )}
          {stage >= 8 && (
            /* Intense, determined expression - beast mode */
            <path
              d="M 91 76 Q 100 80, 109 76"
              stroke={outlineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
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
