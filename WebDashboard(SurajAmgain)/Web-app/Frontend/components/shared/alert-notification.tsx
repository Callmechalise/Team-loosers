// components/shared/alert-notification.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, CheckCircle, Siren } from 'lucide-react';
import { useAlerts } from '@/components/providers/alert-provider';
import { cn } from '@/lib/utils';

interface AlertNotificationProps {
  onClose?: () => void;
}

export function AlertNotification({ onClose }: AlertNotificationProps) {
  const { notifications, markAsRead, unreadCount } = useAlerts();
  const [show, setShow] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length > 0) {
      setLatestNotification(unread[0]);
      setShow(true);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShow(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!latestNotification) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Siren className="h-6 w-6 text-red-500" />;
      case 'fall':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      default:
        return <Bell className="h-6 w-6 text-blue-500" />;
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
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 max-w-md w-full"
        >
          <div className={cn(
            'rounded-lg border p-4 shadow-lg',
            getBgColor(latestNotification.type)
          )}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getIcon(latestNotification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {latestNotification.title}
                  </h4>
                  <button
                    onClick={() => {
                      setShow(false);
                      markAsRead(latestNotification.id);
                      if (onClose) onClose();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {latestNotification.message}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(latestNotification.timestamp).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => {
                      markAsRead(latestNotification.id);
                      setShow(false);
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    Mark as read
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}