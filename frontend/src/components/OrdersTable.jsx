import { ChevronRight, ShoppingBag } from 'lucide-react';
import Badge from './ui/Badge';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

const OrdersTable = ({ data, loading, onOrderClick }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="h-5 w-36 bg-slate-100 animate-pulse rounded"></div>
          <div className="h-4 w-20 bg-slate-100 animate-pulse rounded"></div>
        </div>
        <div className="p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full bg-slate-50 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-border p-10 flex flex-col items-center justify-center text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
          <ShoppingBag size={20} />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No orders match filter criteria</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Try loosening your date range, category, or status parameters in the filter bar above.
        </p>
      </div>
    );
  }

  // Display top orders in the dashboard preview
  const displayOrders = data.slice(0, 10);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs hover:shadow-card transition-shadow">
      {/* Table Header */}
      <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-white">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            Recent Orders
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {displayOrders.length} of {data.length} records • Click any order for breakdown
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400 sm:hidden">
          Scroll horizontally →
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <th className="py-3 px-4 font-semibold">Order ID</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold text-center">Items</th>
              <th className="py-3 px-4 font-semibold text-right">Amount</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {displayOrders.map((order) => {
              const isDelivered = order.deliveryStatus === 'Delivered';

              return (
                <tr
                  key={order.orderId}
                  onClick={() => onOrderClick && onOrderClick(order)}
                  className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  {/* Order ID */}
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-700 text-xs">
                    {order.orderId}
                  </td>

                  {/* Customer Name */}
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {order.customer}
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(order.date, true)}
                  </td>

                  {/* Items */}
                  <td className="py-3 px-4 text-center tabular-nums text-slate-700 font-medium">
                    {formatNumber(order.items)}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                    {formatCurrency(order.amount)}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                      {order.category}
                    </span>
                  </td>

                  {/* Delivery Status Badge */}
                  <td className="py-3 px-4">
                    <Badge variant={isDelivered ? 'delivered' : 'delayed'}>
                      {order.deliveryStatus}
                    </Badge>
                  </td>

                  {/* Chevron drilldown icon */}
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
  );
};

export default OrdersTable;
