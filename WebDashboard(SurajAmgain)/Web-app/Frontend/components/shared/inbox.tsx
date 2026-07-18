// components/shared/inbox.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, X, AlertTriangle, Siren, Info } from 'lucide-react';
import { useAlerts } from '@/components/providers/alert-provider';
import { cn } from '@/lib/utils';

export function Inbox() {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Siren className="h-5 w-5 text-red-500" />;
      case 'fall':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'fall':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <>
      {/* Inbox Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Inbox Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[500px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Inbox</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {notifications.length} notifications • {unreadCount} unread
              </p>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[400px] p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Alerts will appear here</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    notification.read ? 'border-transparent' : getBgColor(notification.type)
                  )}
                >
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        'text-sm font-medium',
                        notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                      )}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className={cn(
                      'text-sm mt-0.5',
                      notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}