import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roommatesApi } from '../api/services';
import RoommateProfileForm from '../components/roommates/RoommateProfileForm';

export default function RoommateProfile() {
  const { user, isTenant, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [initialProfile, setInitialProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

    setLoadingProfile(true);
    roommatesApi
      .getMyProfile()
      .then(({ data }) => setInitialProfile(data?.data || null))
      .catch((err) => {
        // If not found, keep form with defaults.
        const msg = err?.response?.data?.message;
        if (msg && String(msg).toLowerCase().includes('not found')) {
          setInitialProfile(null);
          return;
        }
        setError(msg || 'Failed to load roommate profile');
      })
      .finally(() => setLoadingProfile(false));
  }, [authLoading, user, isTenant, navigate]);

  const handleSubmit = async (form) => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        sleepTime: Number(form.sleepTime),
        foodHabits: form.foodHabits,
        gender: form.gender,
        budgetMax: Number(form.budgetMax),
        cleanliness: Number(form.cleanliness)
      };
      const { data } = await roommatesApi.upsertMyProfile(payload);
      setInitialProfile(data?.data || null);
      setSuccess('Profile saved. You can now find roommate matches.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return null;
  if (!user || !isTenant) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-2xl font-bold text-airbnb-black dark:text-gray-100 mb-2 transition-colors duration-300">
        Roommate matching profile
      </h1>
      <p className="text-sm text-airbnb-gray dark:text-gray-300 mb-6">
        Fill your preferences once. We’ll use them to generate a compatibility score with other tenants.
      </p>

      {loadingProfile ? (
        <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-airbnb-gray-light rounded w-2/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 bg-airbnb-gray-light rounded" />
            ))}
          </div>
          <div className="h-11 bg-airbnb-pink/20 rounded-full" />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {success}
            </div>
          )}

          <RoommateProfileForm initialProfile={initialProfile} onSubmit={handleSubmit} loading={saving} />

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/roommates')}
              className="flex-1 rounded-full bg-airbnb-pink text-white py-3 font-medium hover:bg-airbnb-pink-hover transition-colors duration-300"
            >
              Find Roommates
            </button>
            <button
              type="button"
              onClick={() => navigate('/rooms')}
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-700 transition-colors duration-300"
            >
              Browse Rooms
            </button>
          </div>
        </>
      )}
    </div>
  );
}

