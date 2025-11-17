````markdown
```markdown
Strength Standards data format (sample and guidance)

- Organize by lift (squat, bench, deadlift, ohp, total).
- Within each lift, nest by gender ('male'|'female' or other categories).
- Within gender, nest by ageGroup strings (e.g., "18-39", "40-49").
- Within ageGroup, use bodyweight classes as keys (prefer integer kg values or class strings).
- Each bodyweight class value is an object with keys: untrained, novice, intermediate, advanced, elite (kg values).

Populate programmatically:
- If you have CSVs, write an importer that converts CSV rows into this nested structure.
- Keep canonical units (kg recommended). Convert to lbs in the UI when needed.

Notes:
- For percentile ranking, store either population percentiles per weight class or the raw distribution to allow accurate percentile calculation.
- Consider storing this dataset in a managed DB (Postgres, Firebase) for querying and updates.
```
````