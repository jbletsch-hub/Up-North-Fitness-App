import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trophy, Star } from "lucide-react";

interface GoalCompletionPopupProps {
  goalTitle: string;
  xpAwarded: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export function GoalCompletionPopup({ goalTitle, xpAwarded, position, onComplete }: GoalCompletionPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate particles for the burst effect
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 120 - 60,
      y: Math.random() * 120 - 60,
      delay: Math.random() * 300,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3500);

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
      data-testid="goal-completion-popup"
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
            animationDuration: "1.2s",
            animationIterationCount: "1",
          }}
        >
          <Star className="h-5 w-5 text-chart-3" fill="currentColor" />
        </div>
      ))}

      {/* Main goal completion popup with animations */}
      <div 
        className="relative"
        style={{
          animation: "goalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), goalFloat 2.5s ease-in-out 0.8s forwards",
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-chart-3/60 blur-2xl rounded-2xl animate-pulse" />
        
        {/* Main content */}
        <div className="relative bg-gradient-to-br from-chart-3 via-chart-2 to-primary text-black px-10 py-6 rounded-2xl shadow-2xl border-4 border-chart-3/60">
          {/* Shine overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent rounded-2xl" />
          
          {/* Content */}
          <div className="relative flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Trophy className="h-10 w-10 animate-bounce" fill="currentColor" style={{ animationDuration: "1s" }} />
              <div className="font-display text-3xl tracking-wider drop-shadow-lg" style={{
                textShadow: "0 0 20px rgba(255, 215, 0, 0.9), 0 2px 4px rgba(0,0,0,0.5)",
              }}>
                GOAL COMPLETE!
              </div>
              <Trophy className="h-10 w-10 animate-bounce" fill="currentColor" style={{ animationDuration: "1s", animationDelay: "0.1s" }} />
            </div>
            
            <div className="font-semibold text-xl max-w-xs truncate">
              {goalTitle}
            </div>
            
            {xpAwarded > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-6 w-6" fill="currentColor" />
                <span className="font-display text-2xl tracking-wider">+{xpAwarded} XP</span>
                <Star className="h-6 w-6" fill="currentColor" />
              </div>
            )}
          </div>
        </div>

        {/* Impact ring */}
        <div 
          className="absolute inset-0 border-4 border-chart-3 rounded-2xl opacity-0"
          style={{
            animation: "ringPulse 0.8s ease-out forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes goalBounce {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.15) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes goalFloat {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes ringPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

export function useGoalCompletionPopup() {
  const [goalQueue, setGoalQueue] = useState<Array<{ goalTitle: string; xpAwarded: number; position?: { x: number; y: number }; id: number }>>([]);

  const showGoalCompletion = (goalTitle: string, xpAwarded: number, event?: React.MouseEvent | MouseEvent) => {
    const id = Date.now() + Math.random();
    if (event) {
      const target = (event.currentTarget || event.target) as HTMLElement;
      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        setGoalQueue(prev => [...prev, {
          id,
          goalTitle,
          xpAwarded,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top,
          },
        }]);
      } else {
        setGoalQueue(prev => [...prev, { id, goalTitle, xpAwarded }]);
      }
    } else {
      setGoalQueue(prev => [...prev, { id, goalTitle, xpAwarded }]);
    }
  };

  const handleComplete = (id: number) => {
    setGoalQueue(prev => prev.filter(item => item.id !== id));
  };

  const popup = (
    <>
      {goalQueue.map((goalData) => (
        <GoalCompletionPopup 
          key={goalData.id} 
          goalTitle={goalData.goalTitle}
          xpAwarded={goalData.xpAwarded}
          position={goalData.position} 
          onComplete={() => handleComplete(goalData.id)} 
        />
      ))}
    </>
  );

  return { showGoalCompletion, popup };
}
