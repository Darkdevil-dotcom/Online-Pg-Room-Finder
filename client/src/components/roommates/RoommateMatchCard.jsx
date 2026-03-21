import React from 'react';

function scoreTone(score) {
  if (score >= 80) return { label: 'Great match', className: 'bg-green-100 text-green-800 border-green-200' };
  if (score >= 60) return { label: 'Good match', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  return { label: 'Possible match', className: 'bg-red-100 text-red-800 border-red-200' };
}

function bedtimeLabel(hour) {
  const h = Number(hour);
  if (!Number.isFinite(h)) return '—';
  if (h < 12) return `${h}:00 AM`;
  if (h === 12) return '12:00 PM';
  return `${h - 12}:00 PM`;
}

export default function RoommateMatchCard({ match }) {
  const tenant = match?.tenant || {};
  const profile = match?.profile || {};
  const score = Number(match?.score || 0);
  const tone = scoreTone(score);

  return (
    <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-5 border border-airbnb-gray-light dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-airbnb-black dark:text-gray-100">
            {tenant.name || 'Unnamed tenant'}
          </div>
          <div className="text-sm text-airbnb-gray dark:text-gray-300 mt-1">
            {profile.gender !== 'Any' ? `${profile.gender} • ` : ''}Cleanliness: {profile.cleanliness}/5
          </div>
        </div>

        <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${tone.className}`}>
          {score}% Match
          <div className="text-xs opacity-80 mt-0.5">{tone.label}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="text-sm">
          <div className="font-medium text-gray-800 dark:text-gray-200">Bedtime</div>
          <div className="text-airbnb-gray dark:text-gray-300">{bedtimeLabel(profile.sleepTime)}</div>
        </div>

        <div className="text-sm">
          <div className="font-medium text-gray-800 dark:text-gray-200">Food</div>
          <div className="text-airbnb-gray dark:text-gray-300">{profile.foodHabits}</div>
        </div>

        <div className="text-sm">
          <div className="font-medium text-gray-800 dark:text-gray-200">Budget max</div>
          <div className="text-airbnb-gray dark:text-gray-300">Rs {profile.budgetMax}</div>
        </div>

        <div className="text-sm">
          <div className="font-medium text-gray-800 dark:text-gray-200">Gender</div>
          <div className="text-airbnb-gray dark:text-gray-300">{profile.gender}</div>
        </div>
      </div>
    </div>
  );
}

