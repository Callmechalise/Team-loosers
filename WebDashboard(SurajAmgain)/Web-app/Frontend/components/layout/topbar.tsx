// components/layout/topbar.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Menu,  // ← ADD THIS BACK
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIoTData } from '@/components/providers/iot-data-provider';
import { useAlerts } from '@/components/providers/alert-provider';
import { useCurrentTime, useCountUp } from '@/hooks/use-misc';
import { CARETAKER_PROFILE } from '@/data/mock-data';
import { formatTimeAgo } from '@/lib/health-data';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { residents } = useIoTData();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useAlerts();
  const currentTime = useCurrentTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const searchResults = searchQuery
    ? residents
        .filter(
          (r) =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.room.includes(searchQuery) ||
            r.medicalConditions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80 lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div ref={searchRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search resident, room, condition..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            className="w-full rounded-xl border border-gray-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200/50 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-200 dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-800 dark:focus:ring-blue-500/30 backdrop-blur-sm"
            aria-label="Search residents"
          />
        </div>
        <AnimatePresence>
          {searchOpen && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              {searchResults.map((r) => (
                <Link
                  key={r.id}
                  href={`/residents/${r.id}`}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                >
                  <img src={r.photo} alt={r.name} className="h-9 w-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800 dark:text-white">{r.name}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">Room {r.room} · {r.medicalConditions.join(', ')}</p>
                  </div>
                  <span className={cn(
                    'h-2 w-2 rounded-full',
                    r.status === 'healthy' ? 'bg-green-500' : r.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  )} />
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden items-center gap-2 text-sm text-gray-600 dark:text-gray-400 md:flex">
        <span className="font-medium text-gray-800 dark:text-white">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="tabular-nums">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 p-0 border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          sideOffset={5}
        >
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Notifications</p>
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto bg-white dark:bg-gray-800 scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No notifications</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Alerts will appear here</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    'flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3 text-left last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50',
                    !n.read && 'bg-blue-50/30 dark:bg-blue-900/20'
                  )}
                >
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400 dark:bg-blue-400" />}
                  {n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-transparent" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{n.title}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                    <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">{formatTimeAgo(n.timestamp)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <Link 
            href="/notifications" 
            className="block border-t border-gray-100 bg-white px-4 py-2.5 text-center text-xs font-medium text-blue-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700/50"
          >
            View all notifications
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Avatar className="h-9 w-9 border-2 border-gray-200 dark:border-gray-700">
              <AvatarImage src={CARETAKER_PROFILE.photo} alt={CARETAKER_PROFILE.name} />
              <AvatarFallback>SM</AvatarFallback>
            </Avatar>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{CARETAKER_PROFILE.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{CARETAKER_PROFILE.role}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-gray-400 dark:text-gray-500 lg:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
          sideOffset={5}
        >
          <DropdownMenuLabel className="bg-white dark:bg-gray-800">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-800 dark:text-white">{CARETAKER_PROFILE.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{CARETAKER_PROFILE.email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
          <DropdownMenuItem asChild className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50">
            <Link href="/settings" className="cursor-pointer text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Profile Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50">
            <Link href="/settings" className="cursor-pointer text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Preferences</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700/50">
            <Link href="/settings" className="cursor-pointer text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">User Management</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-700" />
          <DropdownMenuItem className="cursor-pointer bg-white text-red-600 hover:bg-red-50 hover:text-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}