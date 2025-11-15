import confetti from "canvas-confetti";
import { useCallback } from "react";

export type CelebrationType = "confetti" | "gold" | "fireworks" | "streak";

export function useCelebration() {
  const celebrate = useCallback((type: CelebrationType = "confetti", origin?: { x: number; y: number }) => {
    const defaults = {
      origin: origin || { x: 0.5, y: 0.5 },
      disableForReducedMotion: true,
    };

    switch (type) {
      case "confetti":
        // Colorful confetti burst - for goals and general achievements
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 70,
          colors: ["#FF5722", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0"],
        });
        break;

      case "gold":
        // Gold particles - for XP gains and MVL wins
        const count = 200;
        const goldDefaults = {
          ...defaults,
          colors: ["#FFD700", "#FFA500", "#FF8C00"],
          ticks: 200,
        };

        confetti({
          ...goldDefaults,
          particleCount: count,
          spread: 26,
          startVelocity: 55,
        });
        
        confetti({
          ...goldDefaults,
          particleCount: count,
          spread: 60,
        });
        
        confetti({
          ...goldDefaults,
          particleCount: count / 2,
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        
        confetti({
          ...goldDefaults,
          particleCount: count / 4,
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });
        break;

      case "fireworks":
        // Fireworks - for big milestones
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;

        const randomInRange = (min: number, max: number) => {
          return Math.random() * (max - min) + min;
        };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }

          confetti({
            ...defaults,
            origin: {
              x: randomInRange(0.1, 0.9),
              y: randomInRange(0.2, 0.6),
            },
            particleCount: 50,
            spread: 60,
            colors: ["#FF5722", "#2196F3", "#4CAF50", "#FFC107", "#9C27B0", "#E91E63"],
            ticks: 200,
          });
        }, 250);
        break;

      case "streak":
        // Fire/flame effect - for streaks
        confetti({
          ...defaults,
          particleCount: 150,
          spread: 100,
          colors: ["#FF4500", "#FF6347", "#FFA500", "#FFD700"],
          shapes: ["circle"],
          gravity: 0.8,
          drift: 0,
          ticks: 300,
        });
        break;
    }
  }, []);

  return { celebrate };
}
