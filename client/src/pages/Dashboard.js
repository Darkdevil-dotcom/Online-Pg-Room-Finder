import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomsApi } from '../api/services';

export default function Dashboard() {
  const { user, isOwner, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isOwner) {
      navigate('/');
      return;
    }
    if (!isOwner) return;
    roomsApi.myRooms()
      .then(({ data }) => setRooms(data.data || []))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [authLoading, isOwner, user?.id, navigate]);

  if (authLoading || !isOwner) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-airbnb-black dark:text-gray-100 transition-colors duration-300">My listings</h1>
        <Link
          to="/dashboard/new"
          className="inline-flex items-center justify-center rounded-full bg-airbnb-pink text-white px-4 py-2 text-sm font-medium hover:bg-airbnb-pink-hover transition-colors duration-300"
        >
          Add listing
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-airbnb bg-airbnb-gray-light dark:bg-gray-700 animate-pulse transition-colors duration-300" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="rounded-airbnb bg-white dark:bg-gray-800 p-8 text-center text-airbnb-gray dark:text-gray-300 transition-colors duration-300">
          <p className="mb-4">You have not listed any rooms yet.</p>
          <Link to="/dashboard/new" className="text-airbnb-pink font-medium hover:underline">Add your first listing</Link>
        </div>
      ) : (
        <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-700 bg-airbnb-gray-bg dark:bg-gray-900 transition-colors duration-300">
                  <th className="px-4 py-3 text-sm font-semibold text-airbnb-black dark:text-gray-100 transition-colors duration-300">Room</th>
                  <th className="px-4 py-3 text-sm font-semibold text-airbnb-black dark:text-gray-100 transition-colors duration-300">Price</th>
                  <th className="px-4 py-3 text-sm font-semibold text-airbnb-black dark:text-gray-100 transition-colors duration-300">Type</th>
                  <th className="px-4 py-3 text-sm font-semibold text-airbnb-black dark:text-gray-100 transition-colors duration-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id} className="border-b border-gray-300 dark:border-gray-700 hover:bg-airbnb-gray-bg/50 dark:hover:bg-gray-700/50 transition-colors duration-300">
                    <td className="px-4 py-3">
                      <Link to={`/rooms/${room._id}`} className="font-medium text-airbnb-pink hover:underline">
                        {room.title}
                      </Link>
                      <p className="text-xs text-airbnb-gray dark:text-gray-300 truncate max-w-[200px] transition-colors duration-300">{room.address}</p>
                    </td>
                    <td className="px-4 py-3 text-sm">Rs {room.price?.toLocaleString()}/mo</td>
                    <td className="px-4 py-3 text-sm">{room.roomType} - {room.gender || 'Any'}</td>
                    <td className="px-4 py-3">
                      <Link to={`/dashboard/edit/${room._id}`} className="text-sm text-airbnb-pink hover:underline mr-3">Edit</Link>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Delete this listing?')) {
                            roomsApi.delete(room._id).then(() => setRooms((prev) => prev.filter((r) => r._id !== room._id)));
                          }
                        }}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
