import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roommatesApi } from '../api/services';
import RoommateMatchCard from '../components/roommates/RoommateMatchCard';

export default function RoommatesMatches() {
  const { user, isTenant, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [myProfile, setMyProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (!isTenant) {
      navigate('/rooms');
      return;
    }

    setLoading(true);
    setError('');
    roommatesApi
      .findMatches()
      .then(({ data }) => {
        setMyProfile(data?.data?.myProfile || null);
        setMatches(data?.data?.matches || []);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Failed to load matches';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, isTenant, navigate]);

  if (authLoading) return null;
  if (!user || !isTenant) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-airbnb-black dark:text-gray-100 mb-2 transition-colors duration-300">
            Find Roommates
          </h1>
          <p className="text-sm text-airbnb-gray dark:text-gray-300">
            Matched users are ranked by compatibility score (0-100).
          </p>
        </div>

        {!loading && myProfile && (
          <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card border border-airbnb-gray-light dark:border-gray-700 px-4 py-3 text-sm">
            <div className="font-medium text-gray-900 dark:text-gray-100">Your profile</div>
            <div className="text-airbnb-gray dark:text-gray-300 mt-1">
              Cleanliness: {myProfile.cleanliness}/5 • Bedtime: {myProfile.sleepTime}:00 • Food: {myProfile.foodHabits} • Gender: {myProfile.gender}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-6 border border-red-200 text-red-800 dark:text-red-100">
          <div className="font-semibold mb-2">Could not load matches</div>
          <div className="text-sm opacity-90">{error}</div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/roommate-profile')}
              className="rounded-full bg-airbnb-pink text-white px-5 py-3 font-medium hover:bg-airbnb-pink-hover transition-colors duration-300"
            >
              Update Roommate Profile
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-airbnb bg-airbnb-gray-light dark:bg-gray-700 animate-pulse aspect-[4/3]" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-6 border border-airbnb-gray-light dark:border-gray-700">
          <div className="font-semibold">No matches yet</div>
          <div className="text-sm text-airbnb-gray dark:text-gray-300 mt-1">
            Try updating your preferences, or add more tenants with profiles.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((m) => (
            <RoommateMatchCard key={m.tenantId} match={m} />
          ))}
        </div>
      )}
    </div>
  );
}

