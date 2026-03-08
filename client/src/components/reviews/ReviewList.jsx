import React, { useState } from 'react';
import StarRating from './StarRating';

export default function ReviewList({ reviews, user, onReply }) {
  const [replyText, setReplyText] = useState({});

  return (
    <div className="space-y-3">
      {reviews.map((item) => (
        <div key={item._id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{item.tenantId?.name || 'Tenant'}</p>
            <StarRating value={item.rating} readonly />
          </div>
          <p className="text-sm mt-2">{item.review || 'No review text'}</p>

          {item.ownerReply?.message ? (
            <div className="mt-2 p-2 rounded bg-gray-50 dark:bg-gray-700 text-sm">
              <p className="font-medium">Owner reply</p>
              <p>{item.ownerReply.message}</p>
            </div>
          ) : user?.role === 'owner' ? (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText[item._id] || ''}
                onChange={(e) => setReplyText((prev) => ({ ...prev, [item._id]: e.target.value }))}
                className="flex-1 border rounded px-2 py-1 text-sm"
                placeholder="Reply to this review"
              />
              <button
                type="button"
                className="px-3 py-1 text-sm rounded bg-airbnb-pink text-white"
                onClick={() => onReply(item._id, replyText[item._id] || '')}
              >
                Reply
              </button>
            </div>
          ) : null}
        </div>
      ))}
      {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet</p>}
    </div>
  );
}
