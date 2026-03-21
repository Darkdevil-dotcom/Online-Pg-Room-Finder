import React, { useMemo, useState } from 'react';

const initial = {
  sleepTime: 23,
  foodHabits: 'Any',
  gender: 'Any',
  budgetMax: 15000,
  cleanliness: 3
};

function bedtimeLabel(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return '—';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

export default function RoommateProfileForm({ initialProfile, onSubmit, loading }) {
  const mergedInitial = useMemo(() => ({ ...initial, ...(initialProfile || {}) }), [initialProfile]);
  const [form, setForm] = useState(mergedInitial);

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <form
      className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-6 space-y-5 transition-colors duration-300"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(form);
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Preferred bedtime (0-23)</label>
          <input
            type="number"
            min={0}
            max={23}
            value={form.sleepTime}
            onChange={(e) => update('sleepTime', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white"
            required
          />
          <p className="text-xs text-airbnb-gray mt-1">
            Interpreted as: <span className="font-medium">{bedtimeLabel(form.sleepTime)}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your gender</label>
          <select
            value={form.gender}
            onChange={(e) => update('gender', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white"
          >
            <option value="Any">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Food habits</label>
          <select
            value={form.foodHabits}
            onChange={(e) => update('foodHabits', e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white"
          >
            <option value="Any">Any</option>
            <option value="Veg">Veg</option>
            <option value="Non-Veg">Non-Veg</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Monthly budget max (Rs)</label>
          <input
            type="number"
            min={0}
            value={form.budgetMax}
            onChange={(e) => update('budgetMax', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Cleanliness (1 - 5)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={form.cleanliness}
              onChange={(e) => update('cleanliness', Number(e.target.value))}
              className="w-full"
            />
            <div className="min-w-14 text-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <span className="font-semibold">{form.cleanliness}</span>
            </div>
          </div>
          <p className="text-xs text-airbnb-gray mt-1">1 = low maintenance, 5 = very clean.</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-full bg-airbnb-pink text-white py-3 font-medium hover:bg-airbnb-pink-hover disabled:opacity-50 transition-colors duration-300"
        >
          {loading ? 'Saving...' : 'Save Roommate Profile'}
        </button>
      </div>
    </form>
  );
}

