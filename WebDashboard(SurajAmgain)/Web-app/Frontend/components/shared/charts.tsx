'use client';

import {AreaChart,Area,LineChart,Line,BarChart,Bar,PieChart,Pie,Cell,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,RadialBarChart,RadialBar,} from 'recharts';

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #CBD5E1',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#1E293B',
  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
};

const tooltipStyleDark = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#F3F4F6',
  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
};

const chartColors = {
  grid: '#E2E8F0',
  axis: '#64748B',
};

const chartColorsDark = {
  grid: '#374151',
  axis: '#9CA3AF',
};

// Helper to detect dark mode
const isDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

const getTooltipStyle = () => {
  return isDarkMode() ? tooltipStyleDark : tooltipStyle;
};

const getChartColors = () => {
  return isDarkMode() ? chartColorsDark : chartColors;
};

interface TrendChartProps {
  data: Array<Record<string, any>>;
  dataKey: string;
  color: string;
  xKey: string;
  unit?: string;
  height?: number;
}

export function TrendAreaChart({ data, dataKey, color, xKey, unit = '', height = 220 }: TrendChartProps) {
  const colors = getChartColors();
  const tooltip = getTooltipStyle();
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis 
          dataKey={xKey} 
          stroke={colors.axis} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          className="dark:text-gray-400"
        />
        <YAxis 
          stroke={colors.axis} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          className="dark:text-gray-400"
        />
        <Tooltip
          contentStyle={tooltip}
          labelStyle={{color: isDarkMode() ? '#F3F4F6' : '#0F172A', fontWeight: 600}}
          formatter={(value: any) => [`${value}${unit}`, '']}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface MultiLineChartProps {
  data: Array<Record<string, any>>;
  lines: Array<{ key: string; color: string; name: string }>;
  xKey: string;
  height?: number;
}

export function MultiLineChart({ data, lines, xKey, height = 220 }: MultiLineChartProps) {
  const colors = getChartColors();
  const tooltip = getTooltipStyle();
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis 
          dataKey={xKey} 
          stroke={colors.axis} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          className="dark:text-gray-400"
        />
        <YAxis 
          stroke={colors.axis} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          className="dark:text-gray-400"
        />
        <Tooltip 
          contentStyle={tooltip} 
          labelStyle={{color: isDarkMode() ? '#F3F4F6' : '#0F172A', fontWeight: 600}} 
        />
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            name={line.name}
            dot={false}
            animationDuration={600}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface MultiBarChartProps {
  data: Array<Record<string, any>>;
  bars: Array<{ key: string; color: string; name: string }>;
  xKey: string;
  height?: number;
  stacked?: boolean;
}

export function MultiBarChart({ data, bars, xKey, height = 220, stacked = false }: MultiBarChartProps) {
  const colors = getChartColors();
  const tooltip = getTooltipStyle();
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis 
          dataKey={xKey} 
          stroke={colors.axis} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          className="dark:text-gray-400"
        />
        <YAxis 
          stroke={colors.axis} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          className="dark:text-gray-400"
        />
        <Tooltip 
          contentStyle={tooltip} 
          labelStyle={{color: isDarkMode() ? '#F3F4F6' : '#0F172A', fontWeight: 600}} 
          cursor={{fill: isDarkMode() ? '#374151' : '#DBEAFE', opacity: 0.6}}
        />
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            fill={bar.color}
            name={bar.name}
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            animationDuration={600}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  height?: number;
  innerRadius?: number;
}

export function DonutChart({ data, height = 220, innerRadius = 50 }: DonutChartProps) {
  const tooltip = getTooltipStyle();
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 25}
          paddingAngle={3}
          dataKey="value"
          animationDuration={600}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={tooltip} 
          labelStyle={{color: isDarkMode() ? '#F3F4F6' : '#0F172A', fontWeight: 600}} 
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface RadialGaugeProps {
  value: number;
  max: number;
  color: string;
  label: string;
  height?: number;
}

export function RadialGauge({ value, max, color, label, height = 160 }: RadialGaugeProps) {
  const colors = getChartColors();
  const data = [{ name: label, value, fill: color }];
  
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="65%" 
          outerRadius="100%" 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <RadialBar 
            background={{ fill: colors.grid }} 
            dataKey="value" 
            cornerRadius={10} 
            fill={color} 
            animationDuration={600} 
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-800 tabular-nums dark:text-white">{value}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  );
}