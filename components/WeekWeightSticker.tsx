import { KeyboardEvent, useEffect, useState } from "react";

type WeekWeightStickerProps = {
  currentWeightKg: number | null;
  onSave: (weightKg: number | null) => void;
};

export default function WeekWeightSticker({ currentWeightKg, onSave }: WeekWeightStickerProps) {
  const [inputValue, setInputValue] = useState<string>(currentWeightKg === null ? "" : String(currentWeightKg));

  useEffect(() => {
    setInputValue(currentWeightKg === null ? "" : String(currentWeightKg));
  }, [currentWeightKg]);

  const commit = () => {
    const normalized = inputValue.trim();
    if (normalized === "") {
      onSave(null);
      return;
    }
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) {
      onSave(parsed);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-slate-700 shadow-md">
      <p>Current weight: {currentWeightKg ?? "—"} kg</p>
      <input
        type="number"
        step="0.1"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        placeholder="kg"
        className="mt-2 w-full rounded border border-teal-300 bg-white px-2 py-1 text-xs text-slate-800"
      />
    </div>
  );
}
