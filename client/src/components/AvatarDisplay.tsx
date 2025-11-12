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
  // Map level (1-50) to muscle stage (0-9)
  // Each 5 levels = one muscle stage
  const muscleStage = Math.min(Math.floor((level - 1) / 5), 9);
  
  // Calculate muscle scaling factors based on stage
  // Stage 0 (levels 1-5): skinny (0.6 scale)
  // Stage 9 (levels 46-50): jacked (1.4 scale)
  const muscleScale = 0.6 + (muscleStage * 0.089);
  
  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 160, viewBox: "0 0 200 300" },
    md: { width: 200, height: 280, viewBox: "0 0 200 300" },
    lg: { width: 300, height: 420, viewBox: "0 0 200 300" },
  };
  
  const config = sizeConfig[size];
  
  // Character variations
  const renderCharacter = () => {
    switch (characterType) {
      case "classic":
        return renderClassicCharacter();
      case "athletic":
        return renderAthleticCharacter();
      case "powerlifter":
        return renderPowerlifterCharacter();
      case "runner":
        return renderRunnerCharacter();
      case "boxer":
        return renderBoxerCharacter();
      default:
        return renderClassicCharacter();
    }
  };
  
  const renderClassicCharacter = () => (
    <>
      {/* Head */}
      <circle
        cx="100"
        cy="50"
        r="25"
        fill="#F4A460"
        className="avatar-head"
      />
      
      {/* Headband */}
      {headband && (
        <ellipse
          cx="100"
          cy="40"
          rx="26"
          ry="6"
          fill="#E74C3C"
          className="avatar-accessory"
        />
      )}
      
      {/* Torso */}
      <ellipse
        cx="100"
        cy="120"
        rx={40 * muscleScale}
        ry="50"
        fill={shirtColor}
        className="avatar-torso"
      />
      
      {/* Arms */}
      <ellipse
        cx="65"
        cy="110"
        rx={12 * muscleScale}
        ry="45"
        fill="#F4A460"
        className="avatar-arm-left"
      />
      <ellipse
        cx="135"
        cy="110"
        rx={12 * muscleScale}
        ry="45"
        fill="#F4A460"
        className="avatar-arm-right"
      />
      
      {/* Biceps overlay */}
      <ellipse
        cx="65"
        cy="100"
        rx={8 * muscleScale}
        ry={15 * muscleScale}
        fill="#E09B63"
        opacity="0.6"
        className="avatar-bicep-left"
      />
      <ellipse
        cx="135"
        cy="100"
        rx={8 * muscleScale}
        ry={15 * muscleScale}
        fill="#E09B63"
        opacity="0.6"
        className="avatar-bicep-right"
      />
      
      {/* Wristbands */}
      {wristbands && (
        <>
          <ellipse
            cx="65"
            cy="145"
            rx="13"
            ry="5"
            fill="#E74C3C"
            className="avatar-accessory"
          />
          <ellipse
            cx="135"
            cy="145"
            rx="13"
            ry="5"
            fill="#E74C3C"
            className="avatar-accessory"
          />
        </>
      )}
      
      {/* Chest definition (visible at higher muscle stages) */}
      {muscleStage >= 3 && (
        <line
          x1="100"
          y1="100"
          x2="100"
          y2="135"
          stroke="#D4833F"
          strokeWidth={2 * muscleScale}
          opacity="0.4"
          className="avatar-definition"
        />
      )}
      
      {/* Legs */}
      <ellipse
        cx="85"
        cy="210"
        rx={18 * muscleScale}
        ry="70"
        fill={shortsColor}
        className="avatar-leg-left"
      />
      <ellipse
        cx="115"
        cy="210"
        rx={18 * muscleScale}
        ry="70"
        fill={shortsColor}
        className="avatar-leg-right"
      />
      
      {/* Lower legs */}
      <ellipse
        cx="85"
        cy="250"
        rx={10 * muscleScale}
        ry="40"
        fill="#F4A460"
        className="avatar-calf-left"
      />
      <ellipse
        cx="115"
        cy="250"
        rx={10 * muscleScale}
        ry="40"
        fill="#F4A460"
        className="avatar-calf-right"
      />
      
      {/* Feet */}
      <ellipse
        cx="85"
        cy="285"
        rx="12"
        ry="8"
        fill="#2C3E50"
        className="avatar-foot-left"
      />
      <ellipse
        cx="115"
        cy="285"
        rx="12"
        ry="8"
        fill="#2C3E50"
        className="avatar-foot-right"
      />
    </>
  );
  
  const renderAthleticCharacter = () => (
    <>
      {/* Similar structure but with slightly different proportions */}
      <circle cx="100" cy="50" r="25" fill="#D4A574" className="avatar-head" />
      {headband && (
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#3498DB" className="avatar-accessory" />
      )}
      <ellipse cx="100" cy="120" rx={38 * muscleScale} ry="48" fill={shirtColor} className="avatar-torso" />
      <ellipse cx="67" cy="110" rx={11 * muscleScale} ry="43" fill="#D4A574" className="avatar-arm-left" />
      <ellipse cx="133" cy="110" rx={11 * muscleScale} ry="43" fill="#D4A574" className="avatar-arm-right" />
      {wristbands && (
        <>
          <ellipse cx="67" cy="143" rx="12" ry="4" fill="#3498DB" className="avatar-accessory" />
          <ellipse cx="133" cy="143" rx="12" ry="4" fill="#3498DB" className="avatar-accessory" />
        </>
      )}
      <ellipse cx="85" cy="210" rx={17 * muscleScale} ry="68" fill={shortsColor} className="avatar-leg-left" />
      <ellipse cx="115" cy="210" rx={17 * muscleScale} ry="68" fill={shortsColor} className="avatar-leg-right" />
      <ellipse cx="85" cy="250" rx={9 * muscleScale} ry="38" fill="#D4A574" className="avatar-calf-left" />
      <ellipse cx="115" cy="250" rx={9 * muscleScale} ry="38" fill="#D4A574" className="avatar-calf-right" />
      <ellipse cx="85" cy="285" rx="12" ry="8" fill="#34495E" className="avatar-foot-left" />
      <ellipse cx="115" cy="285" rx="12" ry="8" fill="#34495E" className="avatar-foot-right" />
    </>
  );
  
  const renderPowerlifterCharacter = () => (
    <>
      {/* Stockier build */}
      <circle cx="100" cy="50" r="26" fill="#C68642" className="avatar-head" />
      {headband && (
        <ellipse cx="100" cy="40" rx="27" ry="6" fill="#E67E22" className="avatar-accessory" />
      )}
      <ellipse cx="100" cy="120" rx={45 * muscleScale} ry="52" fill={shirtColor} className="avatar-torso" />
      <ellipse cx="63" cy="110" rx={14 * muscleScale} ry="46" fill="#C68642" className="avatar-arm-left" />
      <ellipse cx="137" cy="110" rx={14 * muscleScale} ry="46" fill="#C68642" className="avatar-arm-right" />
      <ellipse cx="63" cy="100" rx={10 * muscleScale} ry={17 * muscleScale} fill="#A96A2F" opacity="0.6" className="avatar-bicep-left" />
      <ellipse cx="137" cy="100" rx={10 * muscleScale} ry={17 * muscleScale} fill="#A96A2F" opacity="0.6" className="avatar-bicep-right" />
      {wristbands && (
        <>
          <ellipse cx="63" cy="146" rx="15" ry="5" fill="#E67E22" className="avatar-accessory" />
          <ellipse cx="137" cy="146" rx="15" ry="5" fill="#E67E22" className="avatar-accessory" />
        </>
      )}
      <ellipse cx="85" cy="210" rx={20 * muscleScale} ry="72" fill={shortsColor} className="avatar-leg-left" />
      <ellipse cx="115" cy="210" rx={20 * muscleScale} ry="72" fill={shortsColor} className="avatar-leg-right" />
      <ellipse cx="85" cy="250" rx={12 * muscleScale} ry="42" fill="#C68642" className="avatar-calf-left" />
      <ellipse cx="115" cy="250" rx={12 * muscleScale} ry="42" fill="#C68642" className="avatar-calf-right" />
      <ellipse cx="85" cy="285" rx="13" ry="9" fill="#2C3E50" className="avatar-foot-left" />
      <ellipse cx="115" cy="285" rx="13" ry="9" fill="#2C3E50" className="avatar-foot-right" />
    </>
  );
  
  const renderRunnerCharacter = () => (
    <>
      {/* Lean build */}
      <circle cx="100" cy="50" r="24" fill="#E8B088" className="avatar-head" />
      {headband && (
        <ellipse cx="100" cy="40" rx="25" ry="6" fill="#27AE60" className="avatar-accessory" />
      )}
      <ellipse cx="100" cy="120" rx={36 * muscleScale} ry="46" fill={shirtColor} className="avatar-torso" />
      <ellipse cx="68" cy="110" rx={10 * muscleScale} ry="42" fill="#E8B088" className="avatar-arm-left" />
      <ellipse cx="132" cy="110" rx={10 * muscleScale} ry="42" fill="#E8B088" className="avatar-arm-right" />
      {wristbands && (
        <>
          <ellipse cx="68" cy="142" rx="11" ry="4" fill="#27AE60" className="avatar-accessory" />
          <ellipse cx="132" cy="142" rx="11" ry="4" fill="#27AE60" className="avatar-accessory" />
        </>
      )}
      <ellipse cx="85" cy="210" rx={16 * muscleScale} ry="66" fill={shortsColor} className="avatar-leg-left" />
      <ellipse cx="115" cy="210" rx={16 * muscleScale} ry="66" fill={shortsColor} className="avatar-leg-right" />
      <ellipse cx="85" cy="250" rx={8 * muscleScale} ry="36" fill="#E8B088" className="avatar-calf-left" />
      <ellipse cx="115" cy="250" rx={8 * muscleScale} ry="36" fill="#E8B088" className="avatar-calf-right" />
      <ellipse cx="85" cy="285" rx="11" ry="7" fill="#34495E" className="avatar-foot-left" />
      <ellipse cx="115" cy="285" rx="11" ry="7" fill="#34495E" className="avatar-foot-right" />
    </>
  );
  
  const renderBoxerCharacter = () => (
    <>
      {/* Compact, powerful build */}
      <circle cx="100" cy="50" r="25" fill="#B8876B" className="avatar-head" />
      {headband && (
        <ellipse cx="100" cy="40" rx="26" ry="6" fill="#C0392B" className="avatar-accessory" />
      )}
      <ellipse cx="100" cy="120" rx={42 * muscleScale} ry="50" fill={shirtColor} className="avatar-torso" />
      <ellipse cx="65" cy="110" rx={13 * muscleScale} ry="44" fill="#B8876B" className="avatar-arm-left" />
      <ellipse cx="135" cy="110" rx={13 * muscleScale} ry="44" fill="#B8876B" className="avatar-arm-right" />
      <ellipse cx="65" cy="98" rx={9 * muscleScale} ry={16 * muscleScale} fill="#9A6D50" opacity="0.6" className="avatar-bicep-left" />
      <ellipse cx="135" cy="98" rx={9 * muscleScale} ry={16 * muscleScale} fill="#9A6D50" opacity="0.6" className="avatar-bicep-right" />
      {wristbands && (
        <>
          <ellipse cx="65" cy="144" rx="14" ry="5" fill="#C0392B" className="avatar-accessory" />
          <ellipse cx="135" cy="144" rx="14" ry="5" fill="#C0392B" className="avatar-accessory" />
        </>
      )}
      <ellipse cx="85" cy="210" rx={19 * muscleScale} ry="70" fill={shortsColor} className="avatar-leg-left" />
      <ellipse cx="115" cy="210" rx={19 * muscleScale} ry="70" fill={shortsColor} className="avatar-leg-right" />
      <ellipse cx="85" cy="250" rx={11 * muscleScale} ry="40" fill="#B8876B" className="avatar-calf-left" />
      <ellipse cx="115" cy="250" rx={11 * muscleScale} ry="40" fill="#B8876B" className="avatar-calf-right" />
      <ellipse cx="85" cy="285" rx="12" ry="8" fill="#2C3E50" className="avatar-foot-left" />
      <ellipse cx="115" cy="285" rx="12" ry="8" fill="#2C3E50" className="avatar-foot-right" />
    </>
  );
  
  return (
    <div className="avatar-container relative inline-block">
      <svg
        width={config.width}
        height={config.height}
        viewBox={config.viewBox}
        className="avatar-svg"
      >
        {renderCharacter()}
      </svg>
      
      {/* Muscle stage indicator */}
      <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-muted-foreground">
        Stage {muscleStage + 1}/10
      </div>
      
      <style>{`
        .avatar-svg {
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }
        
        .avatar-container {
          animation: avatarBreathe 4s ease-in-out infinite;
        }
        
        @keyframes avatarBreathe {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        
        .avatar-torso {
          animation: torsoExpand 4s ease-in-out infinite;
          transform-origin: center;
        }
        
        @keyframes torsoExpand {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.02);
          }
        }
        
        .avatar-arm-left,
        .avatar-arm-right {
          animation: armFloat 3s ease-in-out infinite;
          transform-origin: center top;
        }
        
        @keyframes armFloat {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }
        
        .avatar-arm-left {
          animation-delay: 0.5s;
        }
        
        .avatar-arm-right {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
