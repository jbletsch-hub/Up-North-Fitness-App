// Wilks score calculator (classic Wilks). Replace with DOTS/IPF points as desired.
export type Gender = 'male' | 'female';

// Classic Wilks coefficients (legacy)
const wilksCoeffs: Record<Gender, number[]> = {
  male: [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-06, -1.291e-08],
  female: [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-05, -9.054e-08],
};

/**
 * totalKg: total of the three competition lifts (kg)
 * bodyweightKg: lifter's bodyweight (kg)
 * gender: 'male' | 'female'
 *
 * Returns Wilks points (higher is better)
 */
export function wilksScore(totalKg: number, bodyweightKg: number, gender: Gender = 'male') {
  const a = wilksCoeffs[gender];
  const bw = bodyweightKg;
  const denom = a[0] + a[1]*bw + a[2]*Math.pow(bw,2) + a[3]*Math.pow(bw,3) + a[4]*Math.pow(bw,4) + a[5]*Math.pow(bw,5);
  if (denom === 0) return 0;
  const coefficient = 500 / denom;
  return coefficient * totalKg;
}