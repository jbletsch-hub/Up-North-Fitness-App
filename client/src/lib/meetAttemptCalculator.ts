// Simple meet attempt suggestions based on estimated 1RM.
// Strategy: opener ~ 90-94% of 1RM, second ~ 95-99%, third ~ 98-103%
// Rounds to nearest 1 (lb or kg depending on your units)

export type Strategy = 'conservative' | 'balanced' | 'aggressive';

export function suggestAttempts(estimated1RM: number, strategy: Strategy = 'balanced') {
  let openerPct = 0.92, secondPct = 0.97, thirdPct = 1.00;
  if (strategy === 'conservative') {
    openerPct = 0.90; secondPct = 0.95; thirdPct = 0.98;
  } else if (strategy === 'aggressive') {
    openerPct = 0.94; secondPct = 0.99; thirdPct = 1.03;
  }
  const opener = Math.round(estimated1RM * openerPct);
  const second = Math.round(estimated1RM * secondPct);
  const third = Math.round(estimated1RM * thirdPct);
  return { opener, second, third, strategy };
}