import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roomsApi } from '../api/services';
import CompareTable from '../components/CompareTable';
import { getCompareIds, removeCompareId, setCompareIds } from '../utils/compare';

export default function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const [ids, setIds] = useState(() => {
    const parsed = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 3);
    return parsed.length ? parsed : getCompareIds();
  });
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const queryIds = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 3);
    const merged = queryIds.length ? queryIds : getCompareIds();
    setIds(merged);
    setCompareIds(merged);
    if (queryIds.join(',') !== merged.join(',')) {
      setSearchParams({ ids: merged.join(',') }, { replace: true });
    }
  }, [idsParam, setSearchParams]);

  const idsKey = useMemo(() => ids.join(','), [ids]);

  useEffect(() => {
    if (!idsKey) {
      setRooms([]);
      return;
    }
    const idsForRequest = idsKey.split(',');
    setLoading(true);
    roomsApi
      .compare(idsForRequest)
      .then(({ data }) => setRooms(data.data || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [idsKey]);

  const handleRemove = (roomId) => {
    const updated = removeCompareId(roomId);
    setIds(updated);
    setSearchParams(updated.length ? { ids: updated.join(',') } : {}, { replace: true });
  };

  const clearAll = () => {
    setCompareIds([]);
    setIds([]);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-airbnb-black dark:text-gray-100 transition-colors duration-300">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Compare rooms</h1>
          <p className="text-airbnb-gray dark:text-gray-300 text-sm">Select up to 3 rooms from room detail pages.</p>
        </div>
        <button
          type="button"
          onClick={clearAll}
          disabled={ids.length === 0}
          className="px-3 py-2 rounded-full border border-airbnb-gray-light dark:border-gray-700 text-sm disabled:opacity-50 transition-colors duration-300"
        >
          Clear all
        </button>
      </div>

      {ids.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {rooms.map((room) => (
            <button
              key={room._id}
              type="button"
              onClick={() => handleRemove(room._id)}
              className="text-xs px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-airbnb-gray-light dark:border-gray-700 transition-colors duration-300"
            >
              {room.title} x
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="rounded-airbnb bg-white dark:bg-gray-800 p-8 text-center text-airbnb-gray dark:text-gray-300 transition-colors duration-300">Loading...</div>
      ) : (
        <CompareTable rooms={rooms} />
      )}
    </div>
  );
}
