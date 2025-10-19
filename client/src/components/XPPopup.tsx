import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface XPPopupProps {
  amount: number;
  onComplete?: () => void;
}

export function XPPopup({ amount, onComplete }: XPPopupProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed top-6 right-6 z-50 animate-in slide-in-from-right fade-in duration-700"
      data-testid="xp-popup"
    >
      <div className="bg-black/90 text-white px-6 py-4 rounded-lg shadow-2xl border border-primary/50">
        <div className="font-display text-2xl text-primary">+{amount} XP</div>
      </div>
    </div>,
    document.body
  );
}

export function useXPPopup() {
  const [xpAmount, setXPAmount] = useState<number | null>(null);

  const showXP = (amount: number) => {
    setXPAmount(amount);
  };

  const popup = xpAmount ? (
    <XPPopup amount={xpAmount} onComplete={() => setXPAmount(null)} />
  ) : null;

  return { showXP, popup };
}
