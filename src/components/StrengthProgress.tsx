import React from 'react';

/*
 Props:
 - currentKg: user's 1RM or lift in kg (or the same units as standards)
 - standards: object { untrained, novice, intermediate, advanced, elite } (kg values)
 Renders a simple progress bar showing where currentKg sits between levels
*/
export default function StrengthProgress({ currentKg, standards }: { currentKg: number, standards: Record<string, number> }) {
  const levels = ['untrained','novice','intermediate','advanced','elite'];
  const levelValues = levels.map(l => standards[l]);
  // Find the segment the user is in
  let segment = 0;
  while (segment < levelValues.length && currentKg > (levelValues[segment] ?? Infinity)) segment++;
  const prevValue = segment === 0 ? 0 : levelValues[segment - 1];
  const nextValue = levelValues[segment] ?? levelValues[levelValues.length - 1];
  const percent = nextValue === prevValue ? 100 : Math.max(0, Math.min(100, ((currentKg - prevValue) / (nextValue - prevValue)) * 100));
  const labelCurrentLevel = levels[Math.max(0, Math.min(levels.length - 1, segment))];
  return (
    <div>
      <div style={{ background: '#eee', height: 18, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: '#2b8aef' }} />
      </div>
      <div style={{ marginTop: 8 }}>
        <small>{`You're ${Math.round(percent)}% into ${labelCurrentLevel}`}</small>
      </div>
      <div>
        <small>{`Prev: ${prevValue} — Next: ${nextValue}`}</small>
      </div>
    </div>
  );
}