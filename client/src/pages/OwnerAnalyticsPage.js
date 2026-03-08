import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/services';
import OwnerAnalyticsCharts from '../components/analytics/OwnerAnalyticsCharts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function OwnerAnalyticsPage() {
  const { isOwner, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isOwner) {
      navigate('/');
      return;
    }

    analyticsApi
      .owner()
      .then(({ data: res }) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [authLoading, isOwner, navigate]);

  if (authLoading || loading) return <div className="p-6">Loading analytics...</div>;
  if (!data) return <div className="p-6">Unable to load analytics.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Owner Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg p-4 bg-white dark:bg-gray-800 shadow-card">
          <p className="text-xs text-gray-500">Total Views</p>
          <p className="text-xl font-semibold">{data.totals?.totalViews || 0}</p>
        </div>
        <div className="rounded-lg p-4 bg-white dark:bg-gray-800 shadow-card">
          <p className="text-xs text-gray-500">Inquiries</p>
          <p className="text-xl font-semibold">{data.totals?.totalInquiries || 0}</p>
        </div>
        <div className="rounded-lg p-4 bg-white dark:bg-gray-800 shadow-card">
          <p className="text-xs text-gray-500">Conversions</p>
          <p className="text-xl font-semibold">{data.totals?.totalConversions || 0}</p>
        </div>
        <div className="rounded-lg p-4 bg-white dark:bg-gray-800 shadow-card">
          <p className="text-xs text-gray-500">Conversion Rate</p>
          <p className="text-xl font-semibold">{data.totals?.overallConversionRate || 0}%</p>
        </div>
      </div>
      <OwnerAnalyticsCharts data={data} />
    </div>
  );
}
