import React from 'react';

export default function StrengthProgress({ currentKg, standards }: { currentKg: number, standards: Record<string, number> }) {
  const levels = ['untrained','novice','intermediate','advanced','elite'];
  const levelValues = levels.map(l => standards[l]);
  let segment = 0;
  while (segment < levelValues.length && currentKg > (levelValues[segment] ?? Infinity)) segment++;
  const prevValue = segment === 0 ? 0 : levelValues[segment - 1];
  const nextValue = levelValues[segment] ?? levelValues[levelValues.length - 1];
  const percent = nextValue === prevValue ? 100 : Math.max(0, Math.min(100, ((currentKg - prevValue) / (nextValue - prevValue)) * 100));
  const labelCurrentLevel = levels[Math.max(0, Math.min(levels.length - 1, segment))];
  return (
    <div>
      <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
        <div className="h-4 bg-blue-600" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{`You're ${Math.round(percent)}% into ${labelCurrentLevel}`}</div>
      <div className="mt-1 text-xs text-muted-foreground">{`Prev: ${prevValue} — Next: ${nextValue}`}</div>
    </div>
  );
}