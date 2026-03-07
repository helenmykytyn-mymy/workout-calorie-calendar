"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import CalendarGrid, { CalendarViewMode } from "@/components/CalendarGrid";
import DayView from "@/components/DayView";
import EntryModal from "@/components/EntryModal";
import {
  EntriesByDate,
  Entry,
  exportEntries,
  loadWeekWeights,
  importEntries,
  loadEntries,
  saveWeekWeights,
  saveEntries,
  WeekWeightsByStart,
} from "@/lib/storage";
function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

function shiftDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function shiftMonth(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function weekRangeTitle(referenceDate: Date): string {
  const startDate = startOfWeekMonday(referenceDate);
  const endDate = shiftDays(startDate, 6);
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startLabel = startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = endDate.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  });
  const yearLabel = sameYear
    ? startDate.getFullYear().toString()
    : `${startDate.getFullYear()}-${endDate.getFullYear()}`;
  return sameMonth ? `${startLabel}\u2013${endLabel}, ${yearLabel}` : `${startLabel} \u2013 ${endLabel}, ${yearLabel}`;
}

function monthTitle(referenceDate: Date): string {
  return referenceDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function dayTitle(referenceDate: Date): string {
  return referenceDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const VIEW_MODE_STORAGE_KEY = "workout_calendar_view_mode_v1";
type ViewMode = CalendarViewMode | "day";

export default function Home() {
    const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
      }
    };

    checkUser();
  }, [router]);
  const testSupabase = async () => {
    const { data, error } = await supabase
      .from("workouts")
      .select("*");

    console.log("SUPABASE DATA:", data);
    console.log("SUPABASE ERROR:", error);
  };

  testSupabase();

  const [entries, setEntries] = useState<EntriesByDate>({});
  const [weekWeights, setWeekWeights] = useState<WeekWeightsByStart>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const viewModeInitialized = useRef(false);
  const [importError, setImportError] = useState<string>("");

 useEffect(() => {
  const testInsert = async () => {
    const { data, error } = await supabase
      .from("workouts")
      .insert([
        {
          date: new Date().toISOString(),
          title: "Test workout",
          calories: 123,
        },
      ]);

    console.log("INSERT RESULT:", data, error);
  };
  testInsert();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsSmallScreen(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (viewModeInitialized.current) return;
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === "day" || stored === "week" || stored === "month") {
      setViewMode(stored);
    } else {
      setViewMode(isSmallScreen ? "day" : "week");
    }
    viewModeInitialized.current = true;
  }, [isSmallScreen]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  const saveEntry = (dateKey: string, entry: Entry) => {
    setEntries((prev) => {
      const next = { ...prev, [dateKey]: entry };
      saveEntries(next);
      return next;
    });
    setSelectedDate(null);
  };

  const clearEntry = (dateKey: string) => {
    setEntries((prev) => {
      const next = { ...prev };
      delete next[dateKey];
      saveEntries(next);
      return next;
    });
    setSelectedDate(null);
  };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    setImportError("");
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await importEntries(file);
      setEntries(parsed);
      saveEntries(parsed);
      e.target.value = "";
    } catch {
      setImportError("Failed to import JSON. Check file format.");
    }
  };

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return undefined;
    return entries[selectedDate];
  }, [entries, selectedDate]);
  const viewTitle =
    viewMode === "week" ? weekRangeTitle(viewDate) : viewMode === "month" ? monthTitle(viewDate) : dayTitle(viewDate);

  const saveWeekWeight = (weekStartDate: string, weightKg: number | null) => {
    setWeekWeights((prev) => {
      const next = { ...prev };
      if (weightKg === null) {
        delete next[weekStartDate];
      } else {
        next[weekStartDate] = weightKg;
      }
      saveWeekWeights(next);
      return next;
    });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-15 blur-md"
        style={{ backgroundImage: "url('/bg-gradient.jpg')" }}
      />
      <div className="relative z-10 mx-auto max-w-[1600px] p-4 md:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Workout + Calories Calendar</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded border border-slate-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setViewMode("day")}
                className={[
                  "rounded px-3 py-1 text-sm",
                  viewMode === "day" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setViewMode("week")}
                className={[
                  "rounded px-3 py-1 text-sm",
                  viewMode === "week" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => setViewMode("month")}
                className={[
                  "rounded px-3 py-1 text-sm",
                  viewMode === "month" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                Month
              </button>
            </div>
            <button
              type="button"
              onClick={() =>
                setViewDate((prev) =>
                  viewMode === "day" ? shiftDays(prev, -1) : viewMode === "week" ? shiftDays(prev, -7) : shiftMonth(prev, -1),
                )
              }
              className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
            >
              {viewMode === "day" ? "Prev day" : viewMode === "week" ? "Prev week" : "Prev month"}
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
            >
              Today
            </button>
            <div className="min-w-52 text-center text-sm font-semibold">{viewTitle}</div>
            <button
              type="button"
              onClick={() =>
                setViewDate((prev) =>
                  viewMode === "day" ? shiftDays(prev, 1) : viewMode === "week" ? shiftDays(prev, 7) : shiftMonth(prev, 1),
                )
              }
              className="rounded bg-slate-200 px-3 py-2 text-sm hover:bg-slate-300"
            >
              {viewMode === "day" ? "Next day" : viewMode === "week" ? "Next week" : "Next month"}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{viewTitle}</h2>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportEntries(entries)}
            className="rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700"
          >
            Export JSON
          </button>

          <label className="cursor-pointer rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">
            Import JSON
            <input type="file" accept="application/json" onChange={onImport} className="hidden" />
          </label>

          {importError ? <p className="text-sm text-rose-600">{importError}</p> : null}
        </div>

        {viewMode === "day" ? (
          <DayView date={viewDate} entry={entries[toDateKey(viewDate)]} onEdit={setSelectedDate} />
        ) : (
          <CalendarGrid
            referenceDate={viewDate}
            viewMode={viewMode}
            entries={entries}
            weekWeights={weekWeights}
            onWeekWeightSave={saveWeekWeight}
            onDayClick={setSelectedDate}
          />
        )}

        {selectedDate ? (
          <EntryModal
            dateKey={selectedDate}
            initialEntry={selectedEntry}
            onSave={saveEntry}
            onClear={clearEntry}
            onClose={() => setSelectedDate(null)}
          />
        ) : null}
      </div>
    </main>
  );
}
