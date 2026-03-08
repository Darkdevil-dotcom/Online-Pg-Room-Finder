import React from 'react';
import { Link } from 'react-router-dom';

const ROWS = [
  { key: 'title', label: 'Title' },
  { key: 'price', label: 'Rent/mo', format: (v) => (v != null ? `Rs ${Number(v).toLocaleString()}` : '-') },
  { key: 'deposit', label: 'Deposit', format: (v) => (v != null ? `Rs ${Number(v).toLocaleString()}` : '-') },
  { key: 'address', label: 'Address' },
  { key: 'roomType', label: 'Room type' },
  { key: 'gender', label: 'Gender' },
  { key: 'distanceKm', label: 'Distance', format: (v) => (v != null ? `${v} km` : '-') },
  { key: 'facilities', label: 'Facilities', format: (v) => (Array.isArray(v) ? v.join(', ') : v || '-') }
];

export default function CompareTable({ rooms }) {
  if (!rooms?.length) {
    return (
      <div className="rounded-airbnb bg-white dark:bg-gray-800 p-8 text-center text-airbnb-gray dark:text-gray-300">
        Select up to 3 rooms and compare them here.
      </div>
    );
  }

  return (
    <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-airbnb-gray-light dark:border-gray-700 bg-airbnb-gray-bg dark:bg-gray-900">
              <th className="px-4 py-3 text-sm font-semibold text-airbnb-black dark:text-gray-100 w-32">Feature</th>
              {rooms.map((room) => (
                <th key={room._id} className="px-4 py-3 text-sm font-semibold text-airbnb-black dark:text-gray-100 max-w-[200px]">
                  <Link to={`/rooms/${room._id}`} className="text-airbnb-pink hover:underline truncate block">
                    {room.title || 'Room'}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ key, label, format }) => (
              <tr key={key} className="border-b border-airbnb-gray-light dark:border-gray-700 hover:bg-airbnb-gray-bg/50 dark:hover:bg-gray-900/40">
                <td className="px-4 py-3 text-sm font-medium text-airbnb-gray dark:text-gray-300">{label}</td>
                {rooms.map((room) => {
                  const raw = room[key];
                  const value = format ? format(raw) : raw ?? '-';
                  return (
                    <td key={room._id} className="px-4 py-3 text-sm text-airbnb-black dark:text-gray-100 max-w-[200px]">
                      {typeof value === 'string' && value.length > 80 ? `${value.slice(0, 80)}...` : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
