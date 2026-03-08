import React, { useState } from 'react';
import { recommendationApi } from '../api/services';
import PreferenceForm from '../components/recommendations/PreferenceForm';
import RecommendationCard from '../components/recommendations/RecommendationCard';

export default function RecommendationsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const savePreferences = async (payload) => {
    setLoading(true);
    setError('');
    try {
      await recommendationApi.savePreferences(payload);
      const { data } = await recommendationApi.getRecommendations();
      setRooms(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold">AI PG Recommendations</h1>
      <PreferenceForm onSubmit={savePreferences} loading={loading} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <RecommendationCard key={room._id} room={room} />
        ))}
      </div>
    </div>
  );
}
