import React, { useState } from 'react';
import { estimateFromString, FormulaName } from '../lib/oneRm';
import { suggestAttempts } from '../lib/meetAttemptCalculator';

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
    <div style={{ maxWidth: 640 }}>
      <label style={{ display: 'block', marginBottom: 6 }}>Lift (e.g., "225 x 8")</label>
      <input style={{ width: '100%', padding: 8, marginBottom: 12 }} value={input} onChange={(e) => setInput(e.target.value)} />
      <label style={{ display: 'block', marginBottom: 6 }}>Formula</label>
      <select style={{ marginBottom: 12 }} value={formula} onChange={(e) => setFormula(e.target.value as FormulaName)}>
        <option value="epley">Epley</option>
        <option value="brzycki">Brzycki</option>
        <option value="wendler">Wendler</option>
        <option value="lombardi">Lombardi</option>
        <option value="oconner">O'Conner</option>
      </select>
      <div>
        <button onClick={compute}>Estimate 1RM</button>
      </div>

      {error && <div style={{ color: 'crimson', marginTop: 12 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h3>Result</h3>
          <p>{result.weight} x {result.reps} → Est. 1RM: {Math.round(result.estimated1RM)} (units as input)</p>
        </div>
      )}

      {attempts && (
        <div style={{ marginTop: 8 }}>
          <h4>Meet Attempt Suggestions</h4>
          <ol>
            <li>Opener: {attempts.opener}</li>
            <li>Second: {attempts.second}</li>
            <li>Third: {attempts.third}</li>
          </ol>
        </div>
      )}
    </div>
  );
}