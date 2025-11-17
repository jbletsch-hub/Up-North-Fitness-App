// Example Next.js API route - returns JSON estimate for an input like "225 x 8"
import type { NextApiRequest, NextApiResponse } from 'next';
import { estimateFromString } from '../../lib/oneRm';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const input = (req.body?.input || req.query.input || '') as string;
    const formula = (req.body?.formula || req.query.formula || 'epley') as any;
    if (!input) return res.status(400).json({ error: 'input required' });
    const result = estimateFromString(input, formula);
    return res.status(200).json({ result });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to parse input' });
  }
}