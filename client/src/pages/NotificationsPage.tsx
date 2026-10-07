import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Notification } from '../shared/types/index.js';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.getNotifications();
        if (res.success) {
          setNotifications(res.data.notifications || []);
        }
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleMarkAll = async () => {
    await api.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id: string) => {
    await api.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-2 space-y-space-md max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Campus Alerts & Deals</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Order progress & student savings perks</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAll}
            className="font-label-sm text-label-sm text-primary font-bold hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <span className="material-symbols-outlined text-[32px] text-primary-container animate-spin">refresh</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center rounded-lg bg-surface-container-lowest p-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container mx-auto mb-3">
            <span className="material-symbols-outlined text-[32px]">notifications_none</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">All Caught Up!</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            No unread notifications or active dorm discounts right now.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkOne(n.id)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                n.isRead
                  ? 'bg-surface-container-lowest border-surface-container/60 opacity-80'
                  : 'bg-primary-fixed/20 border-primary-container shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    n.isRead ? 'bg-surface-container text-on-surface-variant' : 'bg-primary-container text-on-primary'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {n.type === 'order_status' ? 'moped' : 'percent'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md font-bold text-on-surface">
                      {n.title}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      {n.message}
                    </p>
                  </div>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary-container shrink-0 mt-1.5"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
