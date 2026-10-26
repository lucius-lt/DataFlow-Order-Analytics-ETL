import React, { useState, useEffect } from 'react';
import { getDelivery, getOrders } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Truck, PackageCheck, Clock, ChevronRight } from 'lucide-react';
import Badge from './ui/Badge';
import { OrderDrawer } from './Drawers';
import { formatCurrency, formatNumber } from '../utils/formatters';

const CustomDeliveryTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <div className="bg-white px-3.5 py-2.5 rounded-lg border border-slate-200 shadow-dropdown text-xs min-w-[120px]">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-1">
          <span 
            className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: dataPoint.payload?.color || '#4f46e5' }}
          />
          <span>{dataPoint.name}</span>
        </div>
        <p className="font-bold text-slate-900 tabular-nums">
          {formatNumber(dataPoint.value)} shipments
        </p>
      </div>
    );
  }
  return null;
};

const DeliveryPage = () => {
  const [delivery, setDelivery] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusView, setStatusView] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [d, o] = await Promise.all([
          getDelivery(),
          getOrders()
        ]);
        setDelivery(d);
        setOrders(o);
      } catch (err) {
        console.error('Delivery data load error:', err);
        setError('Unable to load fulfillment metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();

    window.addEventListener('mock_dataset_updated', fetchAll);
    return () => window.removeEventListener('mock_dataset_updated', fetchAll);
  }, []);

  const filteredOrders = statusView === 'all'
    ? orders
    : orders.filter(o => o.deliveryStatus === statusView);

  const total = delivery ? delivery.delivered + delivery.delayed + (delivery.unknown || 0) : 0;
  const onTimePct = total > 0 ? ((delivery.delivered / total) * 100).toFixed(0) : 0;

  const pieData = delivery ? [
    { name: 'Delivered', value: delivery.delivered, color: '#10b981' },
    { name: 'Delayed', value: delivery.delayed, color: '#f59e0b' },
    ...(delivery.unknown > 0 ? [{ name: 'Unknown', value: delivery.unknown, color: '#94a3b8' }] : [])
  ].filter(item => item.value > 0) : [];

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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* 3 Summary & Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white border border-border rounded-xl animate-pulse shadow-xs" />
          ))
        ) : (
          <>
            {/* Total Shipments Card */}
            <button
              onClick={() => setStatusView('all')}
              className={`p-5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                statusView === 'all'
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-border hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total Dispatched
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Truck size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
                  {formatNumber(total)}
                </p>
                <span className="text-xs text-slate-500 mt-0.5 block">Across all courier lines</span>
              </div>
            </button>

            {/* Delivered Card */}
            <button
              onClick={() => setStatusView(statusView === 'Delivered' ? 'all' : 'Delivered')}
              className={`p-5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                statusView === 'Delivered'
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-border hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Delivered on Schedule
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <PackageCheck size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-800 mt-2 tabular-nums">
                  {formatNumber(delivery?.delivered || 0)}
                </p>
                <span className="text-xs text-emerald-700 font-medium mt-0.5 block">
                  {total > 0 ? `${((delivery.delivered / total) * 100).toFixed(1)}% fulfillment rate` : '0%'}
                </span>
              </div>
            </button>

            {/* Delayed Card */}
            <button
              onClick={() => setStatusView(statusView === 'Delayed' ? 'all' : 'Delayed')}
              className={`p-5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                statusView === 'Delayed'
                  ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                  : 'bg-white border-border hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Transit Delays
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Clock size={16} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-800 mt-2 tabular-nums">
                  {formatNumber(delivery?.delayed || 0)}
                </p>
                <span className="text-xs text-amber-700 font-medium mt-0.5 block">
                  {total > 0 ? `${((delivery.delayed / total) * 100).toFixed(1)}% delay rate` : '0%'}
                </span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Main Content Grid: Pie Chart (1/3) + Shipments Table (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Pie Chart Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Fulfillment Ratio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Carrier delivery split</p>
          </div>

          <div className="h-56 sm:h-64 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={84} 
                  paddingAngle={4} 
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomDeliveryTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center percentage badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                {onTimePct}%
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                On Time
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] uppercase font-semibold text-emerald-800">Delivered</span>
              <p className="text-sm font-bold text-emerald-900 tabular-nums">
                {formatNumber(delivery?.delivered || 0)}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] uppercase font-semibold text-amber-800">Delayed</span>
              <p className="text-sm font-bold text-amber-900 tabular-nums">
                {formatNumber(delivery?.delayed || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-border overflow-hidden shadow-xs hover:shadow-card transition-shadow flex flex-col justify-between">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-white">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                {statusView === 'all' ? 'All Monitored Shipments' : `${statusView} Shipments`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredOrders.length} order shipments • Click row to inspect
              </p>
            </div>
            {statusView !== 'all' && (
              <button
                onClick={() => setStatusView('all')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Show All
              </button>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold text-right">Order Value</th>
                  <th className="py-3 px-4 font-semibold text-center">Transit Days</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.slice(0, 15).map((o) => {
                  const isDelivered = o.deliveryStatus === 'Delivered';

                  return (
                    <tr 
                      key={o.orderId} 
                      onClick={() => setSelectedOrder(o)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-700 text-xs">
                        {o.orderId}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {o.customer}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {formatCurrency(o.amount)}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-600 font-medium">
                        {o.deliveryDays ? `${o.deliveryDays} days` : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={isDelivered ? 'delivered' : 'delayed'}>
                          {o.deliveryStatus}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-300 group-hover:text-slate-600 transition-colors">
                        <ChevronRight size={15} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Order */}
      <OrderDrawer orderData={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default DeliveryPage;
