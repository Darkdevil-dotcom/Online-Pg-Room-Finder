import React from 'react';
import { Link } from 'react-router-dom';

export default function RoomCard({ room }) {
  const firstImage = room.images?.[0];
  const img = typeof firstImage === 'string' ? firstImage : firstImage?.url;
  const fallbackImage = 'https://via.placeholder.com/800x600?text=No+image';

  return (
    <Link to={`/rooms/${room._id}`} className="group block">
      <div className="rounded-airbnb overflow-hidden bg-white dark:bg-gray-800 shadow-card hover:shadow-card-hover transition-colors duration-300">
        <div className="aspect-room relative overflow-hidden bg-airbnb-gray-light dark:bg-gray-700">
          <img src={img || fallbackImage} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-gray-900/80 rounded-lg text-xs font-medium text-airbnb-black dark:text-gray-100 transition-colors duration-300">
            Rs {room.price?.toLocaleString()}/mo
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-airbnb-black dark:text-gray-100 truncate transition-colors duration-300">{room.title}</h3>
          <p className="text-sm text-airbnb-gray dark:text-gray-300 truncate transition-colors duration-300">{room.address}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-airbnb-gray dark:text-gray-300 transition-colors duration-300">
            <span>{room.roomType}</span>
            <span>-</span>
            <span>{room.gender || 'Any'}</span>
            {typeof room.distanceKm === 'number' && (
              <>
                <span>-</span>
                <span>{room.distanceKm} km</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
