import { Fragment } from "react";
import DayCell from "@/components/DayCell";
import WeekAverageSummary from "@/components/WeekAverageSummary";
import WeekWeightSticker from "@/components/WeekWeightSticker";
import { EntriesByDate, WeekWeightsByStart, getWeekWeight } from "@/lib/storage";

export type CalendarViewMode = "week" | "month";

type CalendarGridProps = {
  referenceDate: Date;
  viewMode: CalendarViewMode;
  entries: EntriesByDate;
  weekWeights: WeekWeightsByStart;
  onWeekWeightSave: (weekStartDate: string, weightKg: number | null) => void;
  onDayClick: (dateKey: string) => void;
};

type DayMeta = {
  date: Date;
  dateKey: string;
  inCurrentMonth: boolean;
};

const weekdayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDayStyles = [
  {
    weekTint: "bg-red-50/60",
    weekBorder: "border-l-red-400",
    weekHeader: "bg-red-50",
    monthTint: "bg-red-50/40",
    monthBorder: "border-l-red-300",
    monthHeader: "bg-red-50/70",
  },
  {
    weekTint: "bg-orange-50/60",
    weekBorder: "border-l-orange-400",
    weekHeader: "bg-orange-50",
    monthTint: "bg-orange-50/40",
    monthBorder: "border-l-orange-300",
    monthHeader: "bg-orange-50/70",
  },
  {
    weekTint: "bg-yellow-50/60",
    weekBorder: "border-l-yellow-400",
    weekHeader: "bg-yellow-50",
    monthTint: "bg-yellow-50/40",
    monthBorder: "border-l-yellow-300",
    monthHeader: "bg-yellow-50/70",
  },
  {
    weekTint: "bg-green-50/60",
    weekBorder: "border-l-green-400",
    weekHeader: "bg-green-50",
    monthTint: "bg-green-50/40",
    monthBorder: "border-l-green-300",
    monthHeader: "bg-green-50/70",
  },
  {
    weekTint: "bg-blue-50/60",
    weekBorder: "border-l-blue-400",
    weekHeader: "bg-blue-50",
    monthTint: "bg-blue-50/40",
    monthBorder: "border-l-blue-300",
    monthHeader: "bg-blue-50/70",
  },
  {
    weekTint: "bg-indigo-50/60",
    weekBorder: "border-l-indigo-400",
    weekHeader: "bg-indigo-50",
    monthTint: "bg-indigo-50/40",
    monthBorder: "border-l-indigo-300",
    monthHeader: "bg-indigo-50/70",
  },
  {
    weekTint: "bg-purple-50/60",
    weekBorder: "border-l-purple-400",
    weekHeader: "bg-purple-50",
    monthTint: "bg-purple-50/40",
    monthBorder: "border-l-purple-300",
    monthHeader: "bg-purple-50/70",
  },
];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

function buildWeekRow(referenceDate: Date): DayMeta[][] {
  const startDate = startOfWeekMonday(referenceDate);
  const week: DayMeta[] = [];
  for (let d = 0; d < 7; d += 1) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + d);
    week.push({
      date: current,
      dateKey: toDateKey(current),
      inCurrentMonth: true,
    });
  }
  return [week];
}

function getWeeksForMonth(referenceDate: Date): DayMeta[][] {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // Monday start
  const totalCells = startOffset + daysInMonth;
  const weekCount = Math.ceil(totalCells / 7);
  const gridStart = new Date(year, month, 1 - startOffset);

  const weeks: DayMeta[][] = [];
  for (let w = 0; w < weekCount; w += 1) {
    const week: DayMeta[] = [];
    for (let d = 0; d < 7; d += 1) {
      const current = new Date(gridStart);
      current.setDate(gridStart.getDate() + w * 7 + d);
      week.push({
        date: current,
        dateKey: toDateKey(current),
        inCurrentMonth: current.getMonth() === month,
      });
    }
    weeks.push(week);
  }
  return weeks;
}

export default function CalendarGrid({
  referenceDate,
  viewMode,
  entries,
  weekWeights,
  onWeekWeightSave,
  onDayClick,
}: CalendarGridProps) {
  const today = new Date();

  if (viewMode === "week") {
    const [week] = buildWeekRow(referenceDate);
    const weekStartDate = week[0]?.dateKey ?? "";
    const currentWeightKg = weekStartDate ? getWeekWeight(weekWeights, weekStartDate) : null;
    return (
      <div className="relative rounded-xl border border-slate-300 bg-white p-3 pb-24 shadow-sm">
        <div className="grid grid-cols-7 gap-0">
          {weekdayHeaders.map((header) => (
            <div key={header} className="border-b border-slate-300 px-2 py-2 text-xs font-semibold uppercase text-slate-600">
              {header}
            </div>
          ))}
          {week.map((day) => {
            const weekdayIndex = (day.date.getDay() + 6) % 7;
            const style = weekDayStyles[weekdayIndex];
            return (
              <DayCell
                key={day.dateKey}
                date={day.date}
                dateKey={day.dateKey}
                isToday={isSameDay(day.date, today)}
                compact={false}
                expandedNote
                inCurrentMonth
                weekTintClass={style.weekTint}
                weekAccentBorderClass={style.weekBorder}
                weekHeaderBandClass={style.weekHeader}
                entry={entries[day.dateKey]}
                onClick={onDayClick}
              />
            );
          })}
        </div>
        <div className="absolute bottom-4 right-4 z-20 flex w-auto items-end gap-2">
          <div className="w-40">
            <WeekWeightSticker
              currentWeightKg={currentWeightKg}
              onSave={(weightKg) => {
                if (!weekStartDate) return;
                onWeekWeightSave(weekStartDate, weightKg);
              }}
            />
          </div>
          <div className="w-44">
            <WeekAverageSummary week={week} entries={entries} variant="sticker" showWeight={false} />
          </div>
        </div>
      </div>
    );
  }

  const monthWeeks = getWeeksForMonth(referenceDate);

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-8 gap-0">
        {weekdayHeaders.map((header) => (
          <div key={header} className="border-b border-slate-300 px-2 py-2 text-xs font-semibold uppercase text-slate-600">
            {header}
          </div>
        ))}
        <div className="border-b border-slate-300 px-2 py-2 text-right text-xs font-semibold uppercase text-slate-600">
          Summary
        </div>

        {monthWeeks.map((week, idx) => {
          const weekStartDate = week[0]?.dateKey ?? "";
          const currentWeightKg = weekStartDate ? getWeekWeight(weekWeights, weekStartDate) : null;
          return (
            <Fragment key={`week-${idx}`}>
              {week.map((day) => {
                const weekdayIndex = (day.date.getDay() + 6) % 7;
                const style = weekDayStyles[weekdayIndex];
                return (
                  <DayCell
                    key={day.dateKey}
                    date={day.date}
                    dateKey={day.dateKey}
                    isToday={isSameDay(day.date, today)}
                    compact
                    inCurrentMonth={day.inCurrentMonth}
                    weekTintClass={style.monthTint}
                    weekAccentBorderClass={style.monthBorder}
                    weekHeaderBandClass={style.monthHeader}
                    entry={entries[day.dateKey]}
                    onClick={onDayClick}
                  />
                );
              })}
              <WeekAverageSummary
                key={`summary-${idx}`}
                week={week}
                entries={entries}
                currentWeightKg={currentWeightKg}
              />
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
