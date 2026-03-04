export type WorkoutType =
  | "Strength"
  | "Run"
  | "Yoga"
  | "Walk"
  | "Pilates"
  | "Recovery"
  | "Rest";

export type WorkoutFocus = "Upper body" | "Lower body" | "Full body";

export type PeriodStatus = "none" | "spotting" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7";

export type Entry = {
  workoutType: WorkoutType;
  workoutFocus?: WorkoutFocus;
  workoutNote: string;
  caloriesBurned: number | null;
  caloriesEaten: number | null;
  weightKg?: number | null;
  periodStatus: PeriodStatus;
};

export type EntriesByDate = Record<string, Entry>;
export type WeekWeightsByStart = Record<string, number>;

const STORAGE_KEY = "workout_calendar_entries_v1";
const WEEK_WEIGHTS_KEY = "workoutCalendar_weekWeights";

const SAMPLE_DATA: EntriesByDate = {
  "2026-01-05": {
    workoutType: "Strength",
    workoutFocus: "Lower body",
    workoutNote: "[ ] Squats\n[ ] Deadlifts\n[ ] Push-ups",
    caloriesBurned: 420,
    caloriesEaten: 2050,
    weightKg: 64.8,
    periodStatus: "none",
  },
  "2026-01-07": {
    workoutType: "Run",
    workoutFocus: "Full body",
    workoutNote: "[ ] 5km easy run\n[ ] 10m stretching",
    caloriesBurned: 360,
    caloriesEaten: 1900,
    weightKg: 64.5,
    periodStatus: "spotting",
  },
  "2026-01-12": {
    workoutType: "Yoga",
    workoutFocus: "Upper body",
    workoutNote: "[ ] 30m flow\n[ ] Breathwork",
    caloriesBurned: 180,
    caloriesEaten: 1850,
    weightKg: 64.2,
    periodStatus: "D1",
  },
};

export const EMPTY_ENTRY: Entry = {
  workoutType: "Rest",
  workoutNote: "",
  caloriesBurned: null,
  caloriesEaten: null,
  weightKg: null,
  periodStatus: "none",
};

function normalizeWorkoutType(value: unknown): WorkoutType {
  if (value === "Pilates/Cardio") return "Pilates";
  if (
    value === "Strength" ||
    value === "Run" ||
    value === "Yoga" ||
    value === "Walk" ||
    value === "Pilates" ||
    value === "Recovery" ||
    value === "Rest"
  ) {
    return value;
  }
  return "Rest";
}

function normalizeEntries(entries: Record<string, unknown>): EntriesByDate {
  const result: EntriesByDate = {};
  Object.entries(entries).forEach(([dateKey, value]) => {
    if (!value || typeof value !== "object") return;
    const raw = value as Partial<Entry> & { workoutType?: unknown };
    result[dateKey] = {
      ...EMPTY_ENTRY,
      ...raw,
      workoutType: normalizeWorkoutType(raw.workoutType),
    };
  });
  return result;
}

export function loadEntries(): EntriesByDate {
  if (typeof window === "undefined") return {};

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA));
    return SAMPLE_DATA;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === "object" ? normalizeEntries(parsed) : {};
  } catch {
    return {};
  }
}

export function saveEntries(entries: EntriesByDate): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function exportEntries(entries: EntriesByDate): void {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "workout-calendar-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importEntries(file: File): Promise<EntriesByDate> {
  const text = await file.text();
  const parsed = JSON.parse(text) as Record<string, unknown>;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON format.");
  }
  return normalizeEntries(parsed);
}

export function loadWeekWeights(): WeekWeightsByStart {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(WEEK_WEIGHTS_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const cleaned: WeekWeightsByStart = {};
    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  } catch {
    return {};
  }
}

export function saveWeekWeights(weekWeights: WeekWeightsByStart): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WEEK_WEIGHTS_KEY, JSON.stringify(weekWeights));
}

export function getWeekWeight(weekWeights: WeekWeightsByStart, weekStartDate: string): number | null {
  const value = weekWeights[weekStartDate];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
