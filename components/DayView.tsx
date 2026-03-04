import { Entry } from "@/lib/storage";

type DayViewProps = {
  date: Date;
  entry?: Entry;
  onEdit: (dateKey: string) => void;
};

const workoutColors: Record<NonNullable<Entry["workoutType"]>, string> = {
  Strength: "bg-red-100 text-red-700",
  Run: "bg-orange-100 text-orange-700",
  Yoga: "bg-pink-100 text-pink-700",
  Walk: "bg-green-100 text-green-700",
  Pilates: "bg-purple-100 text-purple-700",
  Recovery: "bg-blue-100 text-blue-700",
  Rest: "bg-gray-100 text-gray-600",
};

const workoutTypeLabels: Record<NonNullable<Entry["workoutType"]>, string> = {
  Strength: "🏋️ Strength",
  Run: "🏃‍♀️ Run",
  Yoga: "🧘‍♀️ Yoga",
  Walk: "🚶‍♀️ Walk",
  Pilates: "🤸‍♀️ Pilates",
  Recovery: "♻️ Recovery",
  Rest: "😴 Rest",
};

const workoutFocusLabels: Record<NonNullable<Entry["workoutFocus"]>, string> = {
  "Upper body": "💪 Upper body",
  "Lower body": "🦵 Lower body",
  "Full body": "🧍‍♀️ Full body",
};

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatCalories(value: Entry["caloriesBurned"] | Entry["caloriesEaten"]): string {
  return isValidNumber(value) ? `${value}` : "—";
}

function formatSignedKcal(value: number): string {
  if (value > 0) return `+${value} kcal`;
  if (value < 0) return `${value} kcal`;
  return "0 kcal";
}

export default function DayView({ date, entry, onEdit }: DayViewProps) {
  const dateKey = toDateKey(date);
  const dateTitle = date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const burned = entry?.caloriesBurned;
  const eaten = entry?.caloriesEaten;
  const showBurnFire = isValidNumber(burned) && isValidNumber(eaten) && burned > eaten;
  const diff = isValidNumber(eaten) && isValidNumber(burned) ? eaten - burned : null;

  return (
    <section className="rounded-xl border border-slate-300 bg-white/85 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold text-slate-900">{dateTitle}</h3>
        <button
          type="button"
          onClick={() => onEdit(dateKey)}
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
        >
          Edit
        </button>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={["rounded px-2 py-1 text-sm font-medium", workoutColors[entry?.workoutType ?? "Rest"]].join(" ")}>
          {workoutTypeLabels[entry?.workoutType ?? "Rest"]}
        </span>
        {entry?.workoutFocus ? (
          <span className="rounded bg-slate-200 px-2 py-1 text-sm font-medium text-slate-700">
            {workoutFocusLabels[entry.workoutFocus]}
          </span>
        ) : null}
      </div>

      <div className="mb-4">
        {entry?.periodStatus && entry.periodStatus !== "none" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-sm text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            <span aria-hidden="true">🌸</span>
            {entry.periodStatus}
          </span>
        ) : (
          <p className="text-sm text-slate-600">Period: none</p>
        )}
      </div>

      <div className="mb-4 rounded-md border border-white/55 bg-white/82 p-3 text-slate-700 shadow-sm backdrop-blur-md">
        <p className="whitespace-pre-wrap text-sm leading-6">{entry?.workoutNote?.trim() ? entry.workoutNote : "No note"}</p>
      </div>

      <div className="space-y-1 text-sm text-slate-700">
        <p>
          <span aria-hidden="true">🍽️ </span>
          Eaten: {formatCalories(entry?.caloriesEaten ?? null)} kcal
        </p>
        <p>
          {showBurnFire ? <span aria-hidden="true">🔥 </span> : null}
          Burned: {formatCalories(entry?.caloriesBurned ?? null)} kcal
        </p>
        <p className={diff !== null && diff < 0 ? "font-semibold text-pink-600" : undefined}>
          Diff: {diff === null ? "—" : formatSignedKcal(diff)}
          {diff !== null && diff < 0 ? (
            <span className="ml-1 inline-block text-lg leading-none text-pink-600" aria-hidden="true">
              ⭐️
            </span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
