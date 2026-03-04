import { Entry } from "@/lib/storage";

type DayCellProps = {
  date: Date;
  dateKey: string;
  isToday: boolean;
  compact?: boolean;
  expandedNote?: boolean;
  inCurrentMonth?: boolean;
  weekTintClass?: string;
  weekAccentBorderClass?: string;
  weekHeaderBandClass?: string;
  entry?: Entry;
  onClick: (dateKey: string) => void;
};

const workoutColors: Record<Entry["workoutType"], string> = {
  Strength: "bg-red-100 text-red-700",
  Run: "bg-orange-100 text-orange-700",
  Yoga: "bg-pink-100 text-pink-700",
  Walk: "bg-green-100 text-green-700",
  Pilates: "bg-purple-100 text-purple-700",
  Recovery: "bg-blue-100 text-blue-700",
  Rest: "bg-gray-100 text-gray-600",
};

const workoutTypeLabels: Record<Entry["workoutType"], string> = {
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

function formatCalories(value: Entry["caloriesBurned"] | Entry["caloriesEaten"]): string {
  return typeof value === "number" && Number.isFinite(value) ? `${value}` : "—";
}

function isValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatSignedKcal(value: number): string {
  if (value > 0) return `+${value} kcal`;
  if (value < 0) return `${value} kcal`;
  return "0 kcal";
}

export default function DayCell({
  date,
  dateKey,
  isToday,
  compact = false,
  expandedNote = false,
  inCurrentMonth = true,
  weekTintClass,
  weekAccentBorderClass,
  weekHeaderBandClass,
  entry,
  onClick,
}: DayCellProps) {
  const showBurnFire =
    isValidNumber(entry?.caloriesBurned) &&
    isValidNumber(entry?.caloriesEaten) &&
    entry.caloriesBurned > entry.caloriesEaten;
  const diff =
    isValidNumber(entry?.caloriesEaten) && isValidNumber(entry?.caloriesBurned)
      ? entry.caloriesEaten - entry.caloriesBurned
      : null;

  const renderPeriod = () =>
    entry?.periodStatus && entry.periodStatus !== "none" ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">
        <span className="h-2 w-2 rounded-full bg-rose-600" />
        <span aria-hidden="true">🌸</span>
        {entry.periodStatus}
      </span>
    ) : null;

  return (
    <button
      type="button"
      onClick={() => onClick(dateKey)}
      className={[
        "flex flex-col border p-3 text-left transition hover:bg-slate-50",
        compact ? "min-h-[12rem]" : "min-h-[19rem]",
        isToday ? "border-pink-300 todayHighlight" : "border-slate-200",
        inCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400",
        !isToday && weekTintClass ? weekTintClass : "",
      ].join(" ")}
    >
      {!expandedNote ? (
        <div className="mb-3 flex items-start justify-between gap-4">
          <span className="relative inline-flex h-10 w-10 items-center justify-center">
            <span className="relative z-10 text-base font-semibold">{date.getDate()}</span>
          </span>
          {renderPeriod()}
        </div>
      ) : null}

      <div
        className={[
          "flex h-full flex-col rounded-md border border-white/55 bg-white/82 p-3 shadow-sm backdrop-blur-md",
          compact ? "text-xs" : "text-sm",
          expandedNote || (compact && weekAccentBorderClass) ? "border-l-[5px]" : "",
          (expandedNote || compact) && weekAccentBorderClass ? weekAccentBorderClass : "",
        ].join(" ")}
      >
        {compact && weekHeaderBandClass ? <div className={["-mx-3 -mt-3 mb-2 h-1.5 rounded-t-md", weekHeaderBandClass].join(" ")} /> : null}
        {expandedNote ? (
          <div
            className={[
              "-mx-3 -mt-3 mb-3 flex items-start justify-between gap-5 border-b border-slate-100 px-3 py-2.5",
              weekHeaderBandClass ?? "bg-slate-50",
            ].join(" ")}
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center">
              <span className="relative z-10 text-base font-semibold text-slate-900">{date.getDate()}</span>
            </span>
            {renderPeriod()}
          </div>
        ) : null}
        <div className="mb-2 flex flex-wrap items-center gap-1">
          <span className={["rounded px-1.5 py-0.5 font-medium", workoutColors[entry?.workoutType ?? "Rest"]].join(" ")}>
            {workoutTypeLabels[entry?.workoutType ?? "Rest"]}
          </span>
          {entry?.workoutFocus ? (
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-700">
              {workoutFocusLabels[entry.workoutFocus]}
            </span>
          ) : null}
        </div>
        <div
          className={[
            "mb-2 whitespace-pre-wrap break-words text-slate-700",
            compact
              ? "max-h-[7.5rem] min-h-[7.5rem] overflow-y-auto leading-4"
              : expandedNote
                ? "min-h-[23rem] leading-5"
                : "max-h-[15rem] min-h-[15rem] overflow-y-auto leading-5",
          ].join(" ")}
        >
          {entry?.workoutNote?.trim() ? entry.workoutNote : "No note"}
        </div>
        <div className="mt-auto space-y-1 text-slate-700">
          <p>
            <span aria-hidden="true">🍽️ </span>
            Eaten: {formatCalories(entry?.caloriesEaten)} kcal
          </p>
          <p>
            {showBurnFire ? <span aria-hidden="true">🔥 </span> : null}
            Burned: {formatCalories(entry?.caloriesBurned)} kcal
          </p>
          <p>
            Diff: {diff === null ? "—" : formatSignedKcal(diff)}
            {diff !== null && diff < 0 ? " ⭐️" : ""}
          </p>
          <p>Period: {entry?.periodStatus ?? "none"}</p>
        </div>
      </div>
    </button>
  );
}
