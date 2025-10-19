import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles } from "lucide-react";

interface XPPopupProps {
  amount: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export function XPPopup({ amount, position, onComplete }: XPPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles for the burst effect
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 200,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  const style = position
    ? {
        position: "fixed" as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -120%)",
      }
    : {};

  return createPortal(
    <div
      className="z-50 pointer-events-none"
      style={style}
      data-testid="xp-popup"
    >
      {/* Particle burst effect */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-ping opacity-0"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: "1s",
            animationIterationCount: "1",
          }}
        >
          <Sparkles className="h-4 w-4 text-primary" fill="currentColor" />
        </div>
      ))}

      {/* Main XP popup with animations */}
      <div 
        className="relative"
        style={{
          animation: "xpBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55), xpFloat 2s ease-in-out 0.6s forwards",
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full animate-pulse" />
        
        {/* Main content */}
        <div className="relative bg-gradient-to-br from-primary via-chart-2 to-chart-3 text-black px-8 py-4 rounded-2xl shadow-2xl border-4 border-primary/50">
          {/* Shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-2xl" />
          
          {/* Content */}
          <div className="relative flex items-center gap-3">
            <Sparkles className="h-8 w-8 animate-spin" fill="currentColor" style={{ animationDuration: "3s" }} />
            <div className="font-display text-5xl tracking-wider drop-shadow-lg" style={{
              textShadow: "0 0 20px rgba(241, 196, 15, 0.8), 0 2px 4px rgba(0,0,0,0.5)",
            }}>
              +{amount} XP
            </div>
            <Sparkles className="h-8 w-8 animate-spin" fill="currentColor" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
          </div>
        </div>

        {/* Impact ring */}
        <div 
          className="absolute inset-0 border-4 border-primary rounded-2xl opacity-0"
          style={{
            animation: "ringPulse 0.6s ease-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes xpBounce {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes xpFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

export function useXPPopup() {
  const [xpData, setXPData] = useState<{ amount: number; position?: { x: number; y: number } } | null>(null);

  const showXP = (amount: number, event?: React.MouseEvent | MouseEvent) => {
    if (event) {
      const target = (event.currentTarget || event.target) as HTMLElement;
      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        setXPData({
          amount,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top,
          },
        });
      } else {
        setXPData({ amount });
      }
    } else {
      setXPData({ amount });
    }
  };

  const popup = xpData ? (
    <XPPopup amount={xpData.amount} position={xpData.position} onComplete={() => setXPData(null)} />
  ) : null;

  return { showXP, popup };
}
