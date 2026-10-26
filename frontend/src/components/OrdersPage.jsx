import React, { useState, useEffect, useCallback } from 'react';
import { getOrders } from '../services/api';
import { OrderDrawer } from './Drawers';
import { Search, ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react';
import Badge from './ui/Badge';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (statusFilter) filters.deliveryStatus = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      const data = await getOrders(filters);
      setOrders(data);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Unable to retrieve orders from database.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchOrders();

    window.addEventListener('mock_dataset_updated', fetchOrders);
    return () => window.removeEventListener('mock_dataset_updated', fetchOrders);
  }, [fetchOrders]);

  const filtered = orders.filter(o =>
    o.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const resetAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-xs flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        {/* Search input with leading icon */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or category..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-9 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Toys">Toys</option>
            <option value="Books">Books</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            <option value="">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Delayed">Delayed</option>
          </select>

          {(searchTerm || statusFilter || categoryFilter) && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Data Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs">
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
          <button 
            onClick={fetchOrders} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <ShoppingCart size={20} />
          </div>
          <h4 className="text-base font-bold text-slate-900">No matching orders found</h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try revising your search criteria or resetting the applied filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden shadow-xs hover:shadow-card transition-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 px-4 font-semibold text-center">Items</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Delivery Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {paginated.map((order) => {
                  const isDelivered = order.deliveryStatus === 'Delivered';

                  return (
                    <tr 
                      key={order.orderId} 
                      onClick={() => setSelectedOrder(order)} 
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-700 text-xs">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {order.customer}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {formatDate(order.date, true)}
                      </td>
                      <td className="py-3.5 px-4 text-center tabular-nums text-slate-700 font-medium">
                        {formatNumber(order.items)}
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums font-bold text-slate-900">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/60">
                          {order.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isDelivered ? 'delivered' : 'delayed'}>
                          {order.deliveryStatus}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-slate-500 tabular-nums">
                        {order.deliveryDays ? `${order.deliveryDays} days` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="p-3.5 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/40">
            <p className="text-slate-500 text-center sm:text-left font-medium">
              Showing <span className="font-semibold text-slate-900">{(currentPage - 1) * perPage + 1}</span>–<span className="font-semibold text-slate-900">{Math.min(currentPage * perPage, filtered.length)}</span> of <span className="font-semibold text-slate-900">{formatNumber(filtered.length)}</span> orders
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(p => p - 1)} 
                  className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-600 font-medium px-2">
                  Page <span className="font-semibold text-slate-900">{currentPage}</span> of {totalPages}
                </span>
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)} 
                  className="p-1.5 border border-slate-200 rounded-md bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-over Order Details Drawer */}
      <OrderDrawer orderData={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default OrdersPage;
