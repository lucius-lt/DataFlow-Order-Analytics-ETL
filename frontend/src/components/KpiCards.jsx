import { ShoppingBag, IndianRupee, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

const KpiCard = ({ title, value, subtitle, icon: Icon, iconColor = 'text-slate-600', iconBg = 'bg-slate-50 border-slate-200/70', loading, badge }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-border shadow-xs hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between min-h-[128px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 truncate select-none">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-28 bg-slate-100 animate-pulse rounded mt-2"></div>
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums mt-1 truncate" title={value}>
              {value}
            </p>
          )}
        </div>
        <div className={`w-9 h-9 rounded-lg ${iconBg} border flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        {loading ? (
          <div className="h-3.5 w-24 bg-slate-100 animate-pulse rounded"></div>
        ) : (
          <>
            <span className="truncate text-slate-500 text-[11px] font-medium">{subtitle}</span>
            {badge && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${badge.className}`}>
                {badge.text}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const KpiCards = ({ summary, loading }) => {
  const totalOrders = summary ? summary.totalOrders : 0;
  const deliveredOrders = summary ? summary.deliveredOrders : 0;
  const delayedOrders = summary ? summary.delayedOrders : 0;
  
  // Real calculation from current dataset
  const fulfillmentRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(0) : 0;
  const avgDays = summary?.averageDeliveryDays ? `${summary.averageDeliveryDays}d avg delivery` : 'Standard dispatch';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard
        title="Total Revenue"
        value={summary ? formatCurrency(summary.totalRevenue) : '—'}
        subtitle="Gross order volume"
        icon={IndianRupee}
        iconColor="text-indigo-600"
        iconBg="bg-indigo-50/80 border-indigo-100"
        badge={{ text: 'INR', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' }}
        loading={loading}
      />
      <KpiCard
        title="Total Orders"
        value={summary ? formatNumber(summary.totalOrders) : '—'}
        subtitle={`${deliveredOrders} fulfilled`}
        icon={ShoppingBag}
        iconColor="text-blue-600"
        iconBg="bg-blue-50/80 border-blue-100"
        badge={{ text: `${fulfillmentRate}% on-time`, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }}
        loading={loading}
      />
      <KpiCard
        title="Average Order Value"
        value={summary ? formatCurrency(summary.averageOrderValue) : '—'}
        subtitle="Per transaction yield"
        icon={TrendingUp}
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50/80 border-emerald-100"
        badge={{ text: 'AOV', className: 'bg-slate-50 text-slate-600 border-slate-200' }}
        loading={loading}
      />
      <KpiCard
        title="Delayed Shipments"
        value={summary ? formatNumber(summary.delayedOrders) : '—'}
        subtitle={avgDays}
        icon={Clock}
        iconColor={delayedOrders > 0 ? "text-amber-600" : "text-emerald-600"}
        iconBg={delayedOrders > 0 ? "bg-amber-50/80 border-amber-100" : "bg-emerald-50/80 border-emerald-100"}
        badge={{ 
          text: delayedOrders > 0 ? `${delayedOrders} Delayed` : 'All On-Time', 
          className: delayedOrders > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        }}
        loading={loading}
      />
    </div>
  );
};

export default KpiCards;
