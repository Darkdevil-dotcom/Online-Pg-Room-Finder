import React from 'react';
import { Link } from 'react-router-dom';

export default function RecommendationCard({ room }) {
  return (
    <div className="rounded-airbnb bg-white dark:bg-gray-800 shadow-card p-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="font-semibold text-lg">{room.title}</h3>
          <p className="text-sm text-gray-500">{room.address}</p>
          <p className="text-sm mt-1">Rs {room.price?.toLocaleString()} / month</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Match Score</p>
          <p className="text-2xl font-bold text-airbnb-pink">{room.matchScore}%</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">{room.matchExplanation?.summary}</p>
      <Link to={`/rooms/${room._id}`} className="inline-block mt-3 text-sm text-airbnb-pink hover:underline">
        View Details
      </Link>
    </div>
  );
}
