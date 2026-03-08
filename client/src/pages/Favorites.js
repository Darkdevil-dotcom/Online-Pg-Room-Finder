import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { favoritesApi } from '../api/services';
import RoomCard from '../components/RoomCard';

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (!user) return;
    favoritesApi.list()
      .then(({ data }) => setRooms(data.data || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-2xl font-bold text-airbnb-black dark:text-gray-100 mb-6 transition-colors duration-300">Your favorites</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-airbnb bg-airbnb-gray-light dark:bg-gray-700 aspect-room animate-pulse transition-colors duration-300" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-airbnb-gray dark:text-gray-300 transition-colors duration-300">No favorites yet. Save rooms from the listings or room page.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
}
