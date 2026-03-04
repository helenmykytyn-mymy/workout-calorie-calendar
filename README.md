# Workout + Calories Calendar

Minimal local-only monthly planner built with Next.js (App Router), TypeScript, and Tailwind.

## Run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Features

- Monday-first month grid with sticky-note summaries shown directly in each day cell
- Workout type, workout note, burned/eaten calories, period status
- Today highlight
- Week-row averages for burned and eaten calories
- Day edit modal with keyboard shortcuts:
  - `Enter` = save
  - `Esc` = close
- Local-first storage via `localStorage` (single object keyed by `YYYY-MM-DD`)
- JSON export/import backup
- Tiny sample dataset loaded on first run
