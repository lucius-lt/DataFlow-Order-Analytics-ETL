import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

// Custom Tooltip component for consistent SaaS aesthetics
const CustomChartTooltip = ({ active, payload, label, isCurrency = true, unitLabel = 'Revenue' }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const val = dataPoint.value;
    const formattedVal = isCurrency ? formatCurrency(val) : `${formatNumber(val)} orders`;

    return (
      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-dropdown text-xs min-w-[130px] animate-in fade-in-50 duration-100">
        <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5">
          {label ? formatDate(label, true) : dataPoint.name || 'Detail'}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
            <span 
              className="w-2 h-2 rounded-full shrink-0" 
              style={{ backgroundColor: dataPoint.color || dataPoint.fill || '#4f46e5' }}
            />
            {unitLabel}
          </span>
          <span className="font-bold text-slate-900 tabular-nums">
            {formattedVal}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ data, loading }) => {
  const [metric, setMetric] = useState('revenue');

  if (loading) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs h-80 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 w-40 bg-slate-100 animate-pulse rounded"></div>
          <div className="h-7 w-28 bg-slate-100 animate-pulse rounded-md"></div>
        </div>
        <div className="flex-1 bg-slate-50/70 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-border shadow-xs h-80 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-2 border border-slate-200/60">
          —
        </div>
        <p className="text-sm font-semibold text-slate-800">No revenue data available</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">No recorded transactions match the selected filter criteria.</p>
      </div>
    );
  }

  const isRevenue = metric === 'revenue';

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Revenue & Volume Trends
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRevenue ? 'Gross daily sales trajectory' : 'Daily customer order counts'}
          </p>
        </div>

        {/* Segmented Controller */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-lg self-start sm:self-auto border border-slate-200/50">
          <button
            onClick={() => setMetric('revenue')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              isRevenue
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('orders')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              !isRevenue
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickFormatter={(d) => formatDate(d, false)}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (isRevenue ? formatCurrency(v, true) : v)}
              tick={{ fontSize: 11, fill: '#64748b' }}
              dx={-4}
            />
            <Tooltip
              content={
                <CustomChartTooltip
                  isCurrency={isRevenue}
                  unitLabel={isRevenue ? 'Revenue' : 'Orders'}
                />
              }
            />
            {isRevenue ? (
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueFill)"
                isAnimationActive={false}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#4f46e5' }}
              />
            ) : (
              <Area
                type="monotone"
                dataKey="orders"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#ordersFill)"
                isAnimationActive={false}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#059669' }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const CategoryChart = ({ data, loading, onCategoryClick }) => {
  if (loading) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs h-80 flex flex-col justify-between">
        <div className="h-5 w-32 bg-slate-100 animate-pulse rounded mb-4"></div>
        <div className="flex-1 bg-slate-50/70 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-border shadow-xs h-80 flex flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold text-slate-800">No categories found</p>
        <p className="text-xs text-slate-400 mt-1">Try resetting current filters.</p>
      </div>
    );
  }

  // Consistent palette for category bars
  const colors = ['#4f46e5', '#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b'];

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Revenue by Category
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Click any bar for item drilldown</p>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrency(v, true)}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              dataKey="category"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 500 }}
              width={82}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc', opacity: 0.8 }}
              content={
                <CustomChartTooltip isCurrency={true} unitLabel="Revenue" />
              }
            />
            <Bar
              dataKey="revenue"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
              onClick={(entry) => onCategoryClick && onCategoryClick(entry)}
              className="cursor-pointer transition-opacity hover:opacity-85"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DeliveryChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs h-80 flex flex-col justify-between">
        <div className="h-5 w-36 bg-slate-100 animate-pulse rounded mb-4"></div>
        <div className="flex-1 bg-slate-50/70 animate-pulse rounded-full mx-auto w-48 h-48"></div>
      </div>
    );
  }

  const delivered = data?.delivered || 0;
  const delayed = data?.delayed || 0;
  const total = delivered + delayed + (data?.unknown || 0);
  const onTimePercentage = total > 0 ? ((delivered / total) * 100).toFixed(0) : 0;

  const chartData = [
    { name: 'Delivered', value: delivered, color: '#10b981' },
    { name: 'Delayed', value: delayed, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Delivery Performance
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Carrier fulfillment ratio</p>
        </div>
      </div>

      <div className="h-56 sm:h-60 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={
                <CustomChartTooltip isCurrency={false} unitLabel="Shipments" />
              }
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Donut Center Statistic */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {onTimePercentage}%
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            On-Time
          </span>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50/60 border border-emerald-100/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-slate-600 block text-[11px] font-medium truncate">Delivered</span>
            <span className="font-bold text-emerald-900 tabular-nums">{formatNumber(delivered)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-50/60 border border-amber-100/60">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-slate-600 block text-[11px] font-medium truncate">Delayed</span>
            <span className="font-bold text-amber-900 tabular-nums">{formatNumber(delayed)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
