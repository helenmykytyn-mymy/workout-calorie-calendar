import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { EMPTY_ENTRY, Entry, PeriodStatus, WorkoutFocus, WorkoutType } from "@/lib/storage";

type EntryModalProps = {
  dateKey: string;
  initialEntry?: Entry;
  onSave: (dateKey: string, entry: Entry) => void;
  onClear: (dateKey: string) => void;
  onClose: () => void;
};

const workoutTypes: WorkoutType[] = ["Strength", "Run", "Yoga", "Walk", "Pilates", "Recovery", "Rest"];
const workoutFocuses: WorkoutFocus[] = ["Upper body", "Lower body", "Full body"];
const periodStatuses: PeriodStatus[] = ["none", "spotting", "D1", "D2", "D3", "D4", "D5", "D6", "D7"];

const workoutTypeLabels: Record<WorkoutType, string> = {
  Strength: "🏋️ Strength",
  Run: "🏃‍♀️ Run",
  Yoga: "🧘‍♀️ Yoga",
  Walk: "🚶‍♀️ Walk",
  Pilates: "🤸‍♀️ Pilates",
  Recovery: "♻️ Recovery",
  Rest: "😴 Rest",
};

const workoutFocusLabels: Record<WorkoutFocus, string> = {
  "Upper body": "💪 Upper body",
  "Lower body": "🦵 Lower body",
  "Full body": "🧍‍♀️ Full body",
};

type EntryFormState = {
  workoutType: WorkoutType;
  workoutFocus?: WorkoutFocus;     // optional
  workoutNote: string;

  caloriesBurned: string;          // inputs are strings
  caloriesEaten: string;
  weightKg: string;

  periodStatus: PeriodStatus;
};

function toFormState(entry?: Entry): EntryFormState {
  const base = entry ?? EMPTY_ENTRY;

  return {
    workoutType: base.workoutType,
    workoutFocus: base.workoutFocus ?? undefined,
    workoutNote: base.workoutNote ?? "",

    caloriesBurned:
      typeof base.caloriesBurned === "number" && Number.isFinite(base.caloriesBurned)
        ? String(base.caloriesBurned)
        : "",
    caloriesEaten:
      typeof base.caloriesEaten === "number" && Number.isFinite(base.caloriesEaten)
        ? String(base.caloriesEaten)
        : "",
    weightKg:
      typeof base.weightKg === "number" && Number.isFinite(base.weightKg)
        ? String(base.weightKg)
        : "",

    periodStatus: base.periodStatus,
  };
}

export default function EntryModal({ dateKey, initialEntry, onSave, onClear, onClose }: EntryModalProps) {
  const [form, setForm] = useState<EntryFormState>(toFormState(initialEntry));

  const title = useMemo(() => {
    const date = new Date(`${dateKey}T12:00:00`);
    return date.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "long", day: "numeric" });
  }, [dateKey]);

  useEffect(() => {
    setForm(toFormState(initialEntry));
  }, [initialEntry, dateKey]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const burnedNumber = Number(form.caloriesBurned);
    const eatenNumber = Number(form.caloriesEaten);
    const weightNumber = Number(form.weightKg);
    const burned = form.caloriesBurned.trim() === "" || !Number.isFinite(burnedNumber) ? null : burnedNumber;
    const eaten = form.caloriesEaten.trim() === "" || !Number.isFinite(eatenNumber) ? null : eatenNumber;
    const weight = form.weightKg.trim() === "" || !Number.isFinite(weightNumber) ? null : weightNumber;
    onSave(dateKey, {
      ...form,
      workoutFocus: !form.workoutFocus ? undefined : form.workoutFocus,
      caloriesBurned: burned,
      caloriesEaten: eaten,
      weightKg: weight,
    });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "Enter" && !(e.target as HTMLElement).matches("textarea") && !e.shiftKey) {
      e.preventDefault();
      submit();
      return;
    }

    if (e.key === "Enter" && (e.target as HTMLElement).matches("textarea") && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onKeyDown={onKeyDown}>
      <div className="w-full max-w-md rounded-xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Edit {title}</h2>
          <button type="button" onClick={onClose} className="rounded bg-slate-100 px-2 py-1 text-sm hover:bg-slate-200">
            Close
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Workout type</span>
            <select
              className="w-full rounded border border-slate-300 p-2"
              value={form.workoutType}
              onChange={(e) => setForm((prev) => ({ ...prev, workoutType: e.target.value as WorkoutType }))}
            >
              {workoutTypes.map((type) => (
                <option key={type} value={type}>
                  {workoutTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Workout focus</span>
            <select
  className="w-full rounded border border-slate-300 p-2"
  value={form.workoutFocus ?? ""}
  onChange={(e) => {
    const v = e.target.value;
    setForm((prev) => ({
      ...prev,
      workoutFocus: v ? (v as WorkoutFocus) : undefined,
    }));
  }}
>
  <option value="">None</option>
  {workoutFocuses.map((focus) => (
    <option key={focus} value={focus}>
      {workoutFocusLabels[focus]}
    </option>
  ))}
</select>
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Workout note</span>
            <textarea
              rows={4}
              className="w-full rounded border border-slate-300 p-2"
              value={form.workoutNote}
              onChange={(e) => setForm((prev) => ({ ...prev, workoutNote: e.target.value }))}
              placeholder="[ ] Squats\n[ ] Push-ups"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              <span className="mb-1 block text-slate-700">Burned (kcal)</span>
              <input
                type="number"
                className="w-full rounded border border-slate-300 p-2"
                value={form.caloriesBurned}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    caloriesBurned: e.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-slate-700">Eaten (kcal)</span>
              <input
                type="number"
                className="w-full rounded border border-slate-300 p-2"
                value={form.caloriesEaten}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    caloriesEaten: e.target.value,
                  }))
                }
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Weight (kg)</span>
            <input
              type="number"
              step="0.1"
              className="w-full rounded border border-slate-300 p-2"
              value={form.weightKg}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  weightKg: e.target.value,
                }))
              }
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Period status</span>
            <select
              className="w-full rounded border border-slate-300 p-2"
              value={form.periodStatus}
              onChange={(e) => setForm((prev) => ({ ...prev, periodStatus: e.target.value as PeriodStatus }))}
            >
              {periodStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              className="rounded bg-rose-100 px-3 py-2 text-sm text-rose-700 hover:bg-rose-200"
              onClick={() => onClear(dateKey)}
            >
              Clear day
            </button>

            <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
