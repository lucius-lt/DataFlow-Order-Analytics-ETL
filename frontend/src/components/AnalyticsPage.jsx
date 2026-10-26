import React, { useState, useEffect } from 'react';
import { getSummary, getRevenue, getCategories } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ShoppingBag, Clock, PackageCheck, Calendar, IndianRupee } from 'lucide-react';
import { formatCurrency, formatNumber, formatDate, formatPercentage } from '../utils/formatters';

const CustomAnalyticsTooltip = ({ active, payload, label, isCurrency = true, unitLabel = 'Value' }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    const val = dataPoint.value;
    const formattedVal = isCurrency ? formatCurrency(val) : `${formatNumber(val)} orders`;

    return (
      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-dropdown text-xs min-w-[130px] animate-in fade-in-50 duration-100">
        <p className="font-semibold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5">
          {label ? formatDate(label, true) : dataPoint.name || 'Analytics'}
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

const AnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, r, c] = await Promise.all([
          getSummary(),
          getRevenue(),
          getCategories()
        ]);
        setSummary(s);
        setRevenue(r);
        setCategories(c);
      } catch (err) {
        console.error('Analytics load error:', err);
        setError('Unable to load analytics metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    window.addEventListener('mock_dataset_updated', fetchAll);
    return () => window.removeEventListener('mock_dataset_updated', fetchAll);
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="bg-white rounded-xl border border-border p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalCatRevenue = categories.reduce((sum, c) => sum + (c.revenue || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white p-4 rounded-xl border border-border animate-pulse h-28 shadow-xs"></div>
          ))
        ) : summary ? (
          <>
            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <ShoppingBag size={14} className="text-indigo-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Orders</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-1 truncate">
                {formatNumber(summary.totalOrders)}
              </p>
              <span className="text-[11px] text-slate-400">Total volume</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <IndianRupee size={14} className="text-indigo-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Revenue</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-1 truncate">
                {formatCurrency(summary.totalRevenue, true)}
              </p>
              <span className="text-[11px] text-slate-400">Gross sales</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <TrendingUp size={14} className="text-emerald-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Avg Order</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-1 truncate">
                {formatCurrency(summary.averageOrderValue)}
              </p>
              <span className="text-[11px] text-slate-400">Per cart</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <PackageCheck size={14} className="text-emerald-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Delivered</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-800 tabular-nums mt-1 truncate">
                {formatNumber(summary.deliveredOrders)}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">
                {summary.totalOrders > 0 ? `${((summary.deliveredOrders / summary.totalOrders) * 100).toFixed(0)}% fulfilled` : '0%'}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} className="text-amber-600" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Delayed</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-amber-800 tabular-nums mt-1 truncate">
                {formatNumber(summary.delayedOrders)}
              </p>
              <span className="text-[11px] text-amber-700 font-medium">Pending carrier</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-[11px] font-semibold uppercase tracking-wider truncate">Avg Transit</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums mt-1 truncate">
                {summary.averageDeliveryDays}d
              </p>
              <span className="text-[11px] text-slate-400">Order to delivery</span>
            </div>
          </>
        ) : null}
      </div>

      {/* Revenue Trend Area Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow">
        <div className="mb-4">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Comprehensive Revenue Trajectory
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily historical income derived from normalized order data
          </p>
        </div>

        {loading ? (
          <div className="h-64 sm:h-72 bg-slate-50 animate-pulse rounded-lg"></div>
        ) : (
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue} margin={{ top: 10, right: 10, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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
                  tickFormatter={(v) => formatCurrency(v, true)} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  dx={-4} 
                />
                <Tooltip content={<CustomAnalyticsTooltip isCurrency={true} unitLabel="Revenue" />} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#analyticsRevFill)" 
                  isAnimationActive={false}
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Two Columns: Orders Trend + Category Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Trend */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Order Volume Velocity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Daily completed transaction count</p>
          </div>

          {loading ? (
            <div className="h-60 bg-slate-50 animate-pulse rounded-lg"></div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dx={-4}
                  />
                  <Tooltip content={<CustomAnalyticsTooltip isCurrency={false} unitLabel="Orders" />} />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#059669" 
                    strokeWidth={2} 
                    dot={{ r: 2.5, fill: '#059669' }} 
                    isAnimationActive={false}
                    activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Revenue Bar Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow">
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated revenue generated per department</p>
          </div>

          {loading ? (
            <div className="h-60 bg-slate-50 animate-pulse rounded-lg"></div>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} margin={{ top: 10, right: 10, left: -14, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dy={6}
                  />
                  <YAxis 
                    tickFormatter={(v) => formatCurrency(v, true)} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                    dx={-4}
                  />
                  <Tooltip content={<CustomAnalyticsTooltip isCurrency={true} unitLabel="Revenue" />} />
                  <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs hover:shadow-card transition-shadow">
        <div className="p-4 sm:p-5 border-b border-border bg-white">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Department Performance Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Contribution share and yield across merchandise categories
          </p>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-50 animate-pulse rounded-lg"></div>)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                  <th className="py-3 px-4 font-semibold text-center">Orders</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Order Value</th>
                  <th className="py-3 px-4 font-semibold">Revenue Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => {
                  const shareVal = totalCatRevenue > 0 ? (c.revenue / totalCatRevenue) * 100 : 0;
                  const avgVal = c.orders > 0 ? c.revenue / c.orders : 0;

                  return (
                    <tr key={c.category} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{c.category}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {formatCurrency(c.revenue)}
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-700 font-medium">
                        {formatNumber(c.orders)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 tabular-nums">
                        {formatCurrency(avgVal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5 max-w-xs">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                            <div 
                              className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                              style={{ width: `${Math.min(100, Math.max(2, shareVal))}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 tabular-nums w-12 text-right">
                            {formatPercentage(shareVal, 1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
