import React, { useState } from 'react';

const initial = {
  budget: { min: 5000, max: 15000 },
  preferredLocation: { city: '', area: '' },
  acPreference: 'Any',
  foodType: 'Any',
  maxDistanceKm: 5,
  weights: {
    budget: 0.35,
    location: 0.25,
    ac: 0.15,
    food: 0.1,
    distance: 0.15
  }
};

export default function PreferenceForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initial);

  const update = (path, value) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.');
      setForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [path]: value }));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="rounded-airbnb bg-white dark:bg-gray-800 p-4 shadow-card grid md:grid-cols-2 gap-4"
    >
      <input className="border rounded-lg px-3 py-2" type="number" value={form.budget.min} onChange={(e) => update('budget.min', Number(e.target.value))} placeholder="Budget Min" />
      <input className="border rounded-lg px-3 py-2" type="number" value={form.budget.max} onChange={(e) => update('budget.max', Number(e.target.value))} placeholder="Budget Max" />
      <input className="border rounded-lg px-3 py-2" value={form.preferredLocation.city} onChange={(e) => update('preferredLocation.city', e.target.value)} placeholder="Preferred City" />
      <input className="border rounded-lg px-3 py-2" value={form.preferredLocation.area} onChange={(e) => update('preferredLocation.area', e.target.value)} placeholder="Preferred Area" />
      <select className="border rounded-lg px-3 py-2" value={form.acPreference} onChange={(e) => update('acPreference', e.target.value)}>
        <option value="Any">AC/Non-AC: Any</option>
        <option value="AC">AC</option>
        <option value="Non-AC">Non-AC</option>
      </select>
      <select className="border rounded-lg px-3 py-2" value={form.foodType} onChange={(e) => update('foodType', e.target.value)}>
        <option value="Any">Food: Any</option>
        <option value="Veg">Veg</option>
        <option value="Non-Veg">Non-Veg</option>
      </select>
      <input className="border rounded-lg px-3 py-2" type="number" value={form.maxDistanceKm} onChange={(e) => update('maxDistanceKm', Number(e.target.value))} placeholder="Max Distance (km)" />
      <button type="submit" disabled={loading} className="rounded-full bg-airbnb-pink text-white px-4 py-2">
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}
