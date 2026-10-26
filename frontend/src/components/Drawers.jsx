import React, { useEffect, useState } from 'react';
import { X, Package, ShoppingBag, Calendar, User, Clock, IndianRupee, Layers } from 'lucide-react';
import { getProducts } from '../services/api';
import Badge from './ui/Badge';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

export const CategoryDrawer = ({ categoryData, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Esc key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && categoryData) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categoryData, onClose]);

  useEffect(() => {
    if (!categoryData) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ category: categoryData.category });
        setProducts(data.filter(p => p.category.toLowerCase() === categoryData.category.toLowerCase()));
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryData]);

  if (!categoryData) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${categoryData.category} details`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {categoryData.category}
              </h2>
              <span className="text-xs text-slate-500 font-medium">Category Breakdown</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Revenue & Volume Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatCurrency(categoryData.revenue)}
              </p>
            </div>
            <div className="bg-slate-50/80 p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Order Volume</p>
              <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatNumber(categoryData.orders)} orders
              </p>
            </div>
          </div>

          {/* Products List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Package size={15} className="text-indigo-600" />
                <span>Catalog Items ({products.length})</span>
              </h3>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-2.5">
                {products.map(product => (
                  <div 
                    key={product.id} 
                    className="p-3.5 rounded-lg border border-border bg-white shadow-xs hover:border-slate-300 transition-colors flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-semibold text-slate-900 text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-indigo-600 font-semibold">{product.id}</span>
                        {product.stock !== undefined && (
                          <span className="text-[11px] text-slate-400">• {product.stock} in stock</span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 text-sm tabular-nums shrink-0">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-border text-xs">
                No catalog items mapped to this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrderDrawer = ({ orderData, onClose }) => {
  // Esc key closes drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && orderData) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderData, onClose]);

  if (!orderData) return null;

  const isDelivered = orderData.deliveryStatus === 'Delivered';

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${orderData.orderId} details`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-slate-900">{orderData.orderId}</span>
              <Badge variant={isDelivered ? 'delivered' : 'delayed'}>
                {orderData.deliveryStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Order Details & Fulfillment</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Key Metric Banner */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-900/70">Total Order Value</p>
              <p className="text-2xl font-bold text-indigo-950 mt-0.5 tabular-nums">
                {formatCurrency(orderData.amount)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <IndianRupee size={20} />
            </div>
          </div>

          {/* Order Metadata Grid */}
          <div className="space-y-3.5 bg-slate-50/60 p-4 rounded-xl border border-border text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <User size={13} className="text-slate-400" /> Customer
              </span>
              <span className="font-semibold text-slate-900">{orderData.customer}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" /> Date Placed
              </span>
              <span className="font-semibold text-slate-900">{formatDate(orderData.date, true)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-slate-400" /> Total Items
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">{orderData.items} items</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Package size={13} className="text-slate-400" /> Category
              </span>
              <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-slate-700 font-medium">
                {orderData.category}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-slate-400" /> Delivery Duration
              </span>
              <span className="font-semibold text-slate-900">
                {orderData.deliveryDays ? `${orderData.deliveryDays} business days` : 'Pending'}
              </span>
            </div>
          </div>

          {/* Fulfillment Status Information */}
          <div className="p-4 rounded-xl border border-border bg-white shadow-xs">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Dispatch Verification
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              This order has been processed by the DataFlow ingestion pipeline and validated against SQLite shipment records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
