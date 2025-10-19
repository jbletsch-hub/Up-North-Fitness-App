import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface XPPopupProps {
  amount: number;
  position?: { x: number; y: number };
  onComplete?: () => void;
}

export function XPPopup({ amount, position, onComplete }: XPPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
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
      className="z-50 animate-in slide-in-from-bottom-4 fade-in duration-500"
      style={style}
      data-testid="xp-popup"
    >
      <div className="bg-gradient-to-r from-primary/90 to-chart-3/90 backdrop-blur-sm text-black px-6 py-3 rounded-full shadow-2xl border-2 border-primary">
        <div className="font-display text-3xl tracking-wider drop-shadow-md">+{amount} XP</div>
      </div>
    </div>,
    document.body
  );
}

export function useXPPopup() {
  const [xpData, setXPData] = useState<{ amount: number; position?: { x: number; y: number } } | null>(null);

  const showXP = (amount: number, event?: React.MouseEvent | MouseEvent) => {
    if (event) {
      const target = event.currentTarget as HTMLElement;
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
  };

  const popup = xpData ? (
    <XPPopup amount={xpData.amount} position={xpData.position} onComplete={() => setXPData(null)} />
  ) : null;

  return { showXP, popup };
}
