'use client';

import { motion } from 'framer-motion';
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '@/hooks/use-misc';
import { cn } from '@/lib/utils';

interface StatCardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    color: 'primary' | 'success' | 'warning' | 'destructive' | 'info';
    suffix?: string;
    trend?: number;
    trendLabel?: string;
    index?: number;
}

const colorMap = {
    primary: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400",
        hoverBg: "bg-blue-500/20 dark:bg-blue-500/30",
    },
    success: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400",
        hoverBg: "bg-green-500/20 dark:bg-green-500/30",
    },
    warning: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-600 dark:text-orange-400",
        hoverBg: "bg-orange-500/20 dark:bg-orange-500/30",
    },
    destructive: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-600 dark:text-red-400",
        hoverBg: "bg-red-500/20 dark:bg-red-500/30",
    },
    info: {
        bg: "bg-cyan-100 dark:bg-cyan-900/30",
        text: "text-cyan-600 dark:text-cyan-400",
        hoverBg: "bg-cyan-500/20 dark:bg-cyan-500/30",
    },
};

export function StatCard({
    label,
    value,
    icon: Icon,
    color,
    suffix = '',
    trend,
    trendLabel,
    index = 0,
}: StatCardProps) {
    const animatedValue = useCountUp(value);
    const c = colorMap[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            whileHover={{ y: -4 }}
            className="
                group relative overflow-hidden
                rounded-2xl
                border border-gray-200
                bg-white
                p-5
                shadow-md
                transition-all
                hover:-translate-y-1
                hover:shadow-xl
                dark:border-gray-700
                dark:bg-gray-800
            "
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-800 tabular-nums dark:text-white">
                        {animatedValue}
                        <span className="text-xl text-gray-500 dark:text-gray-400">{suffix}</span>
                    </p>
                    {trend !== undefined && trendLabel && (
                        <div className="mt-2 flex items-center gap-1.5">
                            <span
                                className={cn(
                                    'flex items-center gap-0.5 text-xs font-semibold',
                                    trend >= 0 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-red-600 dark:text-red-400'
                                )}
                            >
                                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(trend)}%
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{trendLabel}</span>
                        </div>
                    )}
                </div>
                <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
                    c.bg
                )}>
                    <Icon className={cn('h-6 w-6', c.text)} />
                </div>
            </div>
            <div className={cn(
                'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100',
                c.bg
            )} />
        </motion.div>
    );
}