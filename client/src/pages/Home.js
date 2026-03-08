import React, { useState, useEffect } from 'react';
import { roomsApi } from '../api/services';
import RoomCard from '../components/RoomCard';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ roomType: '', gender: '', sortBy: 'createdAt', sortOrder: 'desc' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = { page, limit: 12, ...filters };
    roomsApi.list(params)
      .then(({ data }) => {
        if (!cancelled) {
          setRooms(data.data || []);
          setMeta(data.meta || {});
        }
      })
      .catch(() => {
        if (!cancelled) setRooms([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [page, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-2xl font-bold text-airbnb-black dark:text-gray-100 mb-6 transition-colors duration-300">Find your room</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filters.roomType}
          onChange={(e) => { setFilters((f) => ({ ...f, roomType: e.target.value })); setPage(1); }}
          className="rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm transition-colors duration-300"
        >
          <option value="">All types</option>
          <option value="Single">Single</option>
          <option value="Double">Double</option>
          <option value="Triple">Triple</option>
        </select>
        <select
          value={filters.gender}
          onChange={(e) => { setFilters((f) => ({ ...f, gender: e.target.value })); setPage(1); }}
          className="rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm transition-colors duration-300"
        >
          <option value="">Any gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Any">Any</option>
        </select>
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            setFilters((f) => ({ ...f, sortBy, sortOrder }));
            setPage(1);
          }}
          className="rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 text-sm transition-colors duration-300"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="rounded-airbnb bg-airbnb-gray-light dark:bg-gray-700 aspect-room animate-pulse transition-colors duration-300" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <p className="text-airbnb-gray dark:text-gray-300 py-12 transition-colors duration-300">No rooms found. Try different filters.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
          {meta.total > (meta.limit || 12) && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 disabled:opacity-50 transition-colors duration-300"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-airbnb-gray dark:text-gray-300 transition-colors duration-300">
                Page {page} of {Math.ceil((meta.total || 0) / (meta.limit || 12))}
              </span>
              <button
                type="button"
                disabled={page >= Math.ceil((meta.total || 0) / (meta.limit || 12))}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 disabled:opacity-50 transition-colors duration-300"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
