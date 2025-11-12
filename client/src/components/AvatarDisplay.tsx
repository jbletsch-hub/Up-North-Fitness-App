interface AvatarDisplayProps {
  level: number;
  characterType?: string;
  shirtColor?: string;
  shortsColor?: string;
  headband?: boolean;
  wristbands?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AvatarDisplay({
  level,
  characterType = "classic",
  shirtColor = "#FF6B35",
  shortsColor = "#1E3A8A",
  headband = false,
  wristbands = false,
  size = "md",
}: AvatarDisplayProps) {
  // Map level (1-50) to evolution stage (0-9)
  const stage = Math.min(Math.floor((level - 1) / 5), 9);
  
  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 160, viewBox: "0 0 200 280" },
    md: { width: 180, height: 252, viewBox: "0 0 200 280" },
    lg: { width: 260, height: 364, viewBox: "0 0 200 280" },
  };
  
  const config = sizeConfig[size];
  
  // Stage-specific attributes
  const getStageAttributes = () => {
    const stages = [
      { muscleSize: 0.7, confidence: 0.3, pose: 0, energy: 0, expression: "determined" },
      { muscleSize: 0.8, confidence: 0.4, pose: 0.1, energy: 0, expression: "hopeful" },
      { muscleSize: 0.9, confidence: 0.5, pose: 0.2, energy: 0, expression: "focused" },
      { muscleSize: 1.0, confidence: 0.6, pose: 0.3, energy: 0.2, expression: "confident" },
      { muscleSize: 1.1, confidence: 0.7, pose: 0.4, energy: 0.3, expression: "strong" },
      { muscleSize: 1.2, confidence: 0.8, pose: 0.5, energy: 0.5, expression: "proud" },
      { muscleSize: 1.3, confidence: 0.9, pose: 0.6, energy: 0.7, expression: "powerful" },
      { muscleSize: 1.4, confidence: 1.0, pose: 0.7, energy: 0.8, expression: "heroic" },
      { muscleSize: 1.5, confidence: 1.0, pose: 0.8, energy: 0.9, expression: "legendary" },
      { muscleSize: 1.6, confidence: 1.0, pose: 1.0, energy: 1.0, expression: "immortal" },
    ];
    return stages[stage];
  };
  
  const attrs = getStageAttributes();
  const skinTone = "#F5C98E";
  const outlineColor = "#2C1810";
  const outlineWidth = 3;
  
  // Character-specific base proportions
  const getCharacterProps = () => {
    switch (characterType) {
      case "athletic":
        return { headSize: 28, shoulderWidth: 1.0, legWidth: 0.95 };
      case "powerlifter":
        return { headSize: 30, shoulderWidth: 1.2, legWidth: 1.15 };
      case "runner":
        return { headSize: 26, shoulderWidth: 0.9, legWidth: 0.85 };
      case "boxer":
        return { headSize: 28, shoulderWidth: 1.1, legWidth: 1.0 };
      default: // classic
        return { headSize: 28, shoulderWidth: 1.0, legWidth: 1.0 };
    }
  };
  
  const charProps = getCharacterProps();
  const poseOffset = attrs.pose * 3; // Dynamic pose shift

  return (
    <div className="avatar-container relative inline-block">
      <svg
        width={config.width}
        height={config.height}
        viewBox={config.viewBox}
        className="avatar-svg"
      >
        {/* Energy Aura (high levels only) */}
        {attrs.energy > 0.5 && (
          <g className="energy-aura" opacity={attrs.energy * 0.3}>
            <ellipse
              cx="100"
              cy="140"
              rx={80 + attrs.energy * 20}
              ry={120 + attrs.energy * 30}
              fill="url(#energyGradient)"
              className="aura-pulse"
            />
          </g>
        )}
        
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="energyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFA500" stopOpacity="0.2" />
          </linearGradient>
          <radialGradient id="muscleShadow">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.15" />
          </radialGradient>
        </defs>

        {/* === LEGS === */}
        {/* Left Leg */}
        <g className="leg-left">
          <ellipse
            cx={85 - poseOffset}
            cy="215"
            rx={16 * attrs.muscleSize * charProps.legWidth}
            ry="50"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx={85 - poseOffset}
            cy="250"
            rx={11 * attrs.muscleSize * charProps.legWidth}
            ry="28"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Calf definition */}
          <ellipse
            cx={85 - poseOffset}
            cy="245"
            rx={8 * attrs.muscleSize * charProps.legWidth}
            ry="12"
            fill="url(#muscleShadow)"
          />
        </g>
        
        {/* Right Leg */}
        <g className="leg-right">
          <ellipse
            cx={115 + poseOffset}
            cy="215"
            rx={16 * attrs.muscleSize * charProps.legWidth}
            ry="50"
            fill={shortsColor}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx={115 + poseOffset}
            cy="250"
            rx={11 * attrs.muscleSize * charProps.legWidth}
            ry="28"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx={115 + poseOffset}
            cy="245"
            rx={8 * attrs.muscleSize * charProps.legWidth}
            ry="12"
            fill="url(#muscleShadow)"
          />
        </g>

        {/* Feet */}
        <ellipse cx={85 - poseOffset} cy="272" rx="14" ry="6" fill="#2C3E50" stroke={outlineColor} strokeWidth={2} />
        <ellipse cx={115 + poseOffset} cy="272" rx="14" ry="6" fill="#2C3E50" stroke={outlineColor} strokeWidth={2} />

        {/* === TORSO === */}
        <ellipse
          cx="100"
          cy="135"
          rx={35 * attrs.muscleSize * charProps.shoulderWidth}
          ry="45"
          fill={shirtColor}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
          className="torso-main"
        />
        
        {/* Chest definition */}
        {attrs.muscleSize >= 1.0 && (
          <>
            <line
              x1="100"
              y1="115"
              x2="100"
              y2="150"
              stroke={outlineColor}
              strokeWidth={2}
              opacity="0.3"
            />
            <path
              d="M 85 125 Q 100 130, 115 125"
              stroke={outlineColor}
              strokeWidth={2}
              fill="none"
              opacity="0.3"
            />
          </>
        )}
        
        {/* Six-pack (high stages) */}
        {attrs.muscleSize >= 1.3 && (
          <g opacity="0.25">
            <rect x="90" y="140" width="8" height="6" rx="2" fill={outlineColor} />
            <rect x="102" y="140" width="8" height="6" rx="2" fill={outlineColor} />
            <rect x="90" y="148" width="8" height="6" rx="2" fill={outlineColor} />
            <rect x="102" y="148" width="8" height="6" rx="2" fill={outlineColor} />
          </g>
        )}

        {/* === ARMS === */}
        {/* Left Arm */}
        <g className="arm-left">
          <ellipse
            cx={65 - poseOffset * 0.5}
            cy="125"
            rx={11 * attrs.muscleSize}
            ry="38"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          {/* Bicep bulge */}
          <ellipse
            cx={65 - poseOffset * 0.5}
            cy="115"
            rx={7 * attrs.muscleSize}
            ry={13 * attrs.muscleSize}
            fill="#E5B87E"
            opacity="0.6"
          />
          {/* Wristband */}
          {wristbands && (
            <ellipse
              cx={65 - poseOffset * 0.5}
              cy="155"
              rx="12"
              ry="4"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
              className="wristband-left"
            />
          )}
          {/* Fist */}
          <circle
            cx={65 - poseOffset * 0.5}
            cy="168"
            r="8"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={2.5}
          />
        </g>
        
        {/* Right Arm */}
        <g className="arm-right">
          <ellipse
            cx={135 + poseOffset * 0.5}
            cy="125"
            rx={11 * attrs.muscleSize}
            ry="38"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          <ellipse
            cx={135 + poseOffset * 0.5}
            cy="115"
            rx={7 * attrs.muscleSize}
            ry={13 * attrs.muscleSize}
            fill="#E5B87E"
            opacity="0.6"
          />
          {wristbands && (
            <ellipse
              cx={135 + poseOffset * 0.5}
              cy="155"
              rx="12"
              ry="4"
              fill="#E74C3C"
              stroke={outlineColor}
              strokeWidth={2}
              className="wristband-right"
            />
          )}
          <circle
            cx={135 + poseOffset * 0.5}
            cy="168"
            r="8"
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={2.5}
          />
        </g>

        {/* === NECK === */}
        <rect
          x="90"
          y="85"
          width="20"
          height={15 * attrs.muscleSize}
          rx="5"
          fill={skinTone}
          stroke={outlineColor}
          strokeWidth={outlineWidth}
        />

        {/* === HEAD === */}
        <g className="head-group">
          {/* Head base */}
          <ellipse
            cx="100"
            cy="60"
            rx={charProps.headSize}
            ry={charProps.headSize + 2}
            fill={skinTone}
            stroke={outlineColor}
            strokeWidth={outlineWidth}
          />
          
          {/* Headband */}
          {headband && (
            <g className="headband">
              <ellipse
                cx="100"
                cy="48"
                rx={charProps.headSize + 2}
                ry="5"
                fill="#E74C3C"
                stroke={outlineColor}
                strokeWidth={2}
              />
              {/* Headband knot */}
              <circle cx="128" cy="48" r="4" fill="#C0392B" stroke={outlineColor} strokeWidth={2} />
            </g>
          )}
          
          {/* Hair/Top of head */}
          <path
            d={`M ${72} 50 Q 100 ${headband ? 38 : 35}, ${128} 50`}
            fill="#4A3728"
            stroke={outlineColor}
            strokeWidth={2.5}
          />
          
          {/* Eyes */}
          <g className="eyes">
            <ellipse cx="88" cy="58" rx="4" ry="5" fill="white" stroke={outlineColor} strokeWidth={1.5} />
            <ellipse cx="112" cy="58" rx="4" ry="5" fill="white" stroke={outlineColor} strokeWidth={1.5} />
            <circle cx="88" cy="59" r="2.5" fill={outlineColor} className="pupil-left" />
            <circle cx="112" cy="59" r="2.5" fill={outlineColor} className="pupil-right" />
            {/* Determined eyebrows (angled down for low stages, up for high stages) */}
            <path
              d={`M 82 ${52 + (5 - attrs.confidence * 3)} L 92 ${50 + (5 - attrs.confidence * 5)}`}
              stroke={outlineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d={`M 108 ${50 + (5 - attrs.confidence * 5)} L 118 ${52 + (5 - attrs.confidence * 3)}`}
              stroke={outlineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
          
          {/* Nose */}
          <line x1="100" y1="62" x2="100" y2="68" stroke={outlineColor} strokeWidth="2" strokeLinecap="round" />
          
          {/* Mouth - changes with confidence */}
          {attrs.confidence < 0.5 ? (
            // Determined thin line
            <line x1="92" y1="73" x2="108" y2="73" stroke={outlineColor} strokeWidth="2.5" strokeLinecap="round" />
          ) : (
            // Confident smile
            <path
              d={`M 90 72 Q 100 ${74 + attrs.confidence * 2}, 110 72`}
              stroke={outlineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          )}
          
          {/* Legendary sparkle effect */}
          {attrs.energy >= 0.9 && (
            <g className="sparkles">
              <path d="M 75 45 L 77 47 L 75 49 L 73 47 Z" fill="#FFD700" className="sparkle-1" />
              <path d="M 125 55 L 127 57 L 125 59 L 123 57 Z" fill="#FFD700" className="sparkle-2" />
              <path d="M 70 70 L 72 72 L 70 74 L 68 72 Z" fill="#FFD700" className="sparkle-3" />
            </g>
          )}
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
          filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.15));
        }
        
        /* Main breathing/floating animation */
        .avatar-container {
          animation: avatarFloat 4s ease-in-out infinite;
        }
        
        @keyframes avatarFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        /* Torso breathing */
        .torso-main {
          animation: torsoBreath 3s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes torsoBreath {
          0%, 100% {
            transform: scale(1, 1);
          }
          50% {
            transform: scale(1.02, 1.03);
          }
        }
        
        /* Head slight sway */
        .head-group {
          animation: headSway 5s ease-in-out infinite;
          transform-origin: 100px 85px;
        }
        
        @keyframes headSway {
          0%, 100% {
            transform: rotate(-1deg);
          }
          50% {
            transform: rotate(1deg);
          }
        }
        
        /* Arms sway with delay */
        .arm-left {
          animation: armSwayLeft 4s ease-in-out infinite;
          transform-origin: 65px 105px;
        }
        
        .arm-right {
          animation: armSwayRight 4s ease-in-out infinite 0.5s;
          transform-origin: 135px 105px;
        }
        
        @keyframes armSwayLeft {
          0%, 100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
        
        @keyframes armSwayRight {
          0%, 100% {
            transform: rotate(2deg);
          }
          50% {
            transform: rotate(-2deg);
          }
        }
        
        /* Wristbands move with arms */
        .wristband-left {
          animation: armSwayLeft 4s ease-in-out infinite;
          transform-origin: 65px 105px;
        }
        
        .wristband-right {
          animation: armSwayRight 4s ease-in-out infinite 0.5s;
          transform-origin: 135px 105px;
        }
        
        /* Headband moves with head */
        .headband {
          animation: headSway 5s ease-in-out infinite;
          transform-origin: 100px 85px;
        }
        
        /* Energy aura pulse */
        .aura-pulse {
          animation: auraPulse 2s ease-in-out infinite;
        }
        
        @keyframes auraPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        /* Sparkles twinkle */
        .sparkle-1 {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        .sparkle-2 {
          animation: sparkle 1.5s ease-in-out infinite 0.5s;
        }
        
        .sparkle-3 {
          animation: sparkle 1.5s ease-in-out infinite 1s;
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }
        
        /* Pupils subtle movement */
        .pupil-left, .pupil-right {
          animation: pupilMove 6s ease-in-out infinite;
        }
        
        @keyframes pupilMove {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(0.5px, -0.5px);
          }
          75% {
            transform: translate(-0.5px, 0.5px);
          }
        }
      `}</style>
    </div>
  );
}
