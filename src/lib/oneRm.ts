// Core 1RM formulas and helpers
export type FormulaName = 'brzycki' | 'epley' | 'wendler' | 'lombardi' | 'oconner';

/**
 * Brzycki: 1RM = weight * (36 / (37 - reps))
 */
export function brzycki(weight: number, reps: number) {
  return weight * (36 / (37 - reps));
}

/**
 * Epley: 1RM = weight * (1 + reps/30)
 */
export function epley(weight: number, reps: number) {
  return weight * (1 + reps / 30);
}

/**
 * Wendler (approximation): 1RM ~= weight / (1 - reps*0.02)
 * Note: Wendler normally uses training max % schemes; this is a simple estimator.
 */
export function wendler(weight: number, reps: number) {
  return weight / (1 - reps * 0.02);
}

/**
 * Lombardi: 1RM = weight * reps^0.10
 */
export function lombardi(weight: number, reps: number) {
  return weight * Math.pow(reps, 0.10);
}

/**
 * O'Conner: 1RM = weight * (1 + reps/40)
 */
export function oconner(weight: number, reps: number) {
  return weight * (1 + reps / 40);
}

export function estimate1RM(weight: number, reps: number, formula: FormulaName = 'epley') {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  switch (formula) {
    case 'brzycki':
      return brzycki(weight, reps);
    case 'epley':
      return epley(weight, reps);
    case 'wendler':
      return wendler(weight, reps);
    case 'lombardi':
      return lombardi(weight, reps);
    case 'oconner':
      return oconner(weight, reps);
    default:
      return epley(weight, reps);
  }
}

/**
 * Parse input like "225 x 8", "225x8", "225 8", "225X8"
 * Returns weight (number), reps (number), and estimated1RM
 */
export function estimateFromString(input: string, formula: FormulaName = 'epley') {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input. Expected string like "225 x 8"');
  }
  const cleaned = input.toLowerCase().replace(/\s+/g, '');
  // Accept unicode multiplication sign too
  const match = cleaned.match(/^(\\d+(\.\d+)?)(x|×)?(\d+)$/);
  if (!match) {
    throw new Error('Invalid input. Expected formats like "225 x 8"');
  }
  const weight = parseFloat(match[1]);
  const reps = parseInt(match[4], 10);
  const estimated1RM = estimate1RM(weight, reps, formula);
  return { weight, reps, estimated1RM };
}
