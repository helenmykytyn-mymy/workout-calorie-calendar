import { EntriesByDate } from "@/lib/storage";

type WeekDayRef = {
  dateKey: string;
  inCurrentMonth: boolean;
};

type WeekAverageSummaryProps = {
  week: WeekDayRef[];
  entries: EntriesByDate;
  currentWeightKg?: number | null;
  variant?: "cell" | "sticker";
  showWeight?: boolean;
};

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function calculateAverage(values: Array<number | null | undefined>): number | null {
  const valid = values.filter(isValidNumber);
  if (!valid.length) return null;
  const sum = valid.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / valid.length);
}

function formatSignedKcal(value: number): string {
  if (value > 0) return `+${value} kcal`;
  if (value < 0) return `${value} kcal`;
  return "0 kcal";
}

export default function WeekAverageSummary({
  week,
  entries,
  currentWeightKg = null,
  variant = "cell",
  showWeight = true,
}: WeekAverageSummaryProps) {
  const weekEntries = week
    .filter((d) => d.inCurrentMonth)
    .map((d) => entries[d.dateKey])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const eatenAvg = calculateAverage(weekEntries.map((entry) => entry.caloriesEaten));
  const burnedAvg = calculateAverage(weekEntries.map((entry) => entry.caloriesBurned));
  const diffAvg = eatenAvg === null || burnedAvg === null ? null : eatenAvg - burnedAvg;

  return (
    <div
      className={
        variant === "sticker"
          ? "rounded-lg border border-purple-200/70 bg-purple-50/60 p-3 text-xs text-slate-700 shadow-md backdrop-blur-sm"
          : "min-h-[12rem] border border-white/60 bg-white/85 p-3 text-xs text-slate-700 shadow-sm backdrop-blur-sm"
      }
    >
      <p>
        <span aria-hidden="true">🍽️ </span>
        Avg Eat: {eatenAvg ?? "—"} kcal
      </p>
      <p>
        <span aria-hidden="true">🔥 </span>
        Avg Burn: {burnedAvg ?? "—"} kcal
      </p>
      <p className={diffAvg !== null && diffAvg < 0 ? "font-semibold text-pink-600" : undefined}>
        Diff: {diffAvg === null ? "—" : formatSignedKcal(diffAvg)}
        {diffAvg !== null && diffAvg < 0 ? (
          <span className="ml-1 inline-block text-lg leading-none text-pink-600" aria-hidden="true">
            ⭐️
          </span>
        ) : null}
      </p>
      {showWeight ? <p className="mt-2">Current weight: {currentWeightKg ?? "—"} kg</p> : null}
    </div>
  );
}
