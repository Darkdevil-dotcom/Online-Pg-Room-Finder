import React from 'react';

export default function OwnerAnalyticsCharts({ data }) {
  const stats = data?.listingStats || [];
  const maxViews = Math.max(1, ...stats.map((item) => item.viewsCount || 0));

  return (
    <div className="space-y-4">
      {stats.map((item) => (
        <div key={item._id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex justify-between text-sm mb-2">
            <p className="font-medium">{item.title}</p>
            <p>{item.viewsCount} views</p>
          </div>
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div className="h-full bg-airbnb-pink" style={{ width: `${((item.viewsCount || 0) / maxViews) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Inquiries: {item.inquiriesCount || 0} | Conversion: {(item.conversionRate || 0).toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
}
