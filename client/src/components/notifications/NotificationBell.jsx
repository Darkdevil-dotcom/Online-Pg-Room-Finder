import React, { useEffect, useState } from 'react';
import { notificationApi } from '../../api/services';
import { connectSocket, disconnectSocket } from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
  const { user, accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user || !accessToken) return undefined;

    let mounted = true;

    notificationApi
      .list()
      .then(({ data }) => {
        if (mounted) setItems(data.data || []);
      })
      .catch(() => {});

    const socket = connectSocket({ token: accessToken, userId: user.id });
    if (socket) {
      socket.on('notification:new', (payload) => {
        setItems((prev) => [payload, ...prev]);
      });
    }

    return () => {
      mounted = false;
      if (socket) {
        socket.off('notification:new');
      }
      disconnectSocket();
    };
  }, [user, accessToken]);

  if (!user) return null;

  const unread = items.filter((item) => !item.read).length;

  const markRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setItems((prev) => prev.map((item) => (item._id === id ? { ...item, read: true } : item)));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="relative px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600"
        onClick={() => setOpen((v) => !v)}
      >
        Notifications
        {unread > 0 && (
          <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-pink-500 text-white text-xs">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40">
          {items.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No notifications</p>
          ) : (
            items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => markRead(item._id)}
                className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 ${item.read ? 'opacity-70' : ''}`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">{item.message}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
