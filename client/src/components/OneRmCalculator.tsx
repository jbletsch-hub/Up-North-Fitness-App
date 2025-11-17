import React, { useState } from 'react';
import { estimateFromString, FormulaName } from '@/lib/oneRm';
import { suggestAttempts } from '@/lib/meetAttemptCalculator';
import { Button } from '@/components/ui/button';

export default function OneRmCalculator() {
  const [input, setInput] = useState('225 x 8');
  const [formula, setFormula] = useState<FormulaName>('epley');
  const [result, setResult] = useState<{ weight: number; reps: number; estimated1RM: number } | null>(null);
  const [attempts, setAttempts] = useState<{ opener: number; second: number; third: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = () => {
    try {
      setError(null);
      const r = estimateFromString(input, formula);
      setResult(r);
      setAttempts(suggestAttempts(r.estimated1RM));
    } catch (err: any) {
      setResult(null);
      setAttempts(null);
      setError(err.message || 'Parse error');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <input
          className="w-full rounded-md border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="lift-input"
        />
        <select className="rounded-md border p-2" value={formula} onChange={(e) => setFormula(e.target.value as FormulaName)}>
          <option value="epley">Epley</option>
          <option value="brzycki">Brzycki</option>
          <option value="wendler">Wendler</option>
          <option value="lombardi">Lombardi</option>
          <option value="oconner">O'Conner</option>
        </select>
        <Button onClick={compute}>Estimate</Button>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {result && (
        <div className="text-sm">
          <div>{result.weight} x {result.reps} → Est. 1RM: <strong>{Math.round(result.estimated1RM)}</strong></div>
        </div>
      )}

      {attempts && (
        <div className="text-sm">
          <div className="mt-2 font-medium">Meet Attempt Suggestions</div>
          <ol className="list-decimal pl-5">
            <li>Opener: {attempts.opener}</li>
            <li>Second: {attempts.second}</li>
            <li>Third: {attempts.third}</li>
          </ol>
        </div>
      )}
    </div>
  );
}