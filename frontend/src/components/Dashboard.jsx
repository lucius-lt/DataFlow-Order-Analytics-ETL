import React, { useState, useEffect, useCallback } from 'react';
import FilterBar from './FilterBar';
import KpiCards from './KpiCards';
import { RevenueChart, CategoryChart, DeliveryChart } from './Charts';
import OrdersTable from './OrdersTable';
import { CategoryDrawer, OrderDrawer } from './Drawers';
import { getSummary, getRevenue, getCategories, getDelivery, getOrders } from '../services/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    deliveryStatus: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({});

  const [loading, setLoading] = useState({
    summary: true,
    revenue: true,
    categories: true,
    delivery: true,
    orders: true
  });

  const [error, setError] = useState(null);

  const [data, setData] = useState({
    summary: null,
    revenue: null,
    categories: null,
    delivery: null,
    orders: null
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = useCallback(async (currentFilters) => {
    setLoading({
      summary: true,
      revenue: true,
      categories: true,
      delivery: true,
      orders: true
    });
    setError(null);

    try {
      const [summary, revenue, categories, delivery, orders] = await Promise.all([
        getSummary(currentFilters),
        getRevenue(currentFilters),
        getCategories(currentFilters),
        getDelivery(currentFilters),
        getOrders(currentFilters)
      ]);

      setData({
        summary,
        revenue,
        categories,
        delivery,
        orders
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Unable to load analytics data. Please check your backend connection or reload.');
    } finally {
      setLoading({
        summary: false,
        revenue: false,
        categories: false,
        delivery: false,
        orders: false
      });
    }
  }, []);

  useEffect(() => {
    fetchData(appliedFilters);

    const onDataUpdated = () => fetchData(appliedFilters);
    window.addEventListener('mock_dataset_updated', onDataUpdated);
    return () => window.removeEventListener('mock_dataset_updated', onDataUpdated);
  }, [fetchData, appliedFilters]);

  const handleApplyFilters = (newFilters) => {
    setAppliedFilters(newFilters && newFilters.startDate !== undefined ? { ...newFilters } : { ...filters });
  };

  const handleResetFilters = () => {
    const emptyFilters = { startDate: '', endDate: '', category: '', deliveryStatus: '' };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Unable to Load Analytics</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6">{error}</p>
        <button
          onClick={() => fetchData(appliedFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <RefreshCw size={14} />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Interactive Filters Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      
      {/* Top 4 KPI Metric Cards */}
      <KpiCards summary={data.summary} loading={loading.summary} />
      
      {/* Middle Grid: Revenue Trend (2/3) + Delivery Split (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 min-h-[360px]">
          <RevenueChart data={data.revenue} loading={loading.revenue} />
        </div>
        <div className="min-h-[360px]">
          <DeliveryChart data={data.delivery} loading={loading.delivery} />
        </div>
      </div>

      {/* Bottom Grid: Category Breakdown (1/3) + Recent Orders Table (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1 min-h-[380px]">
          <CategoryChart 
            data={data.categories} 
            loading={loading.categories} 
            onCategoryClick={(entry) => setSelectedCategory(entry)} 
          />
        </div>
        <div className="lg:col-span-2 min-h-[380px]">
          <OrdersTable 
            data={data.orders} 
            loading={loading.orders}
            onOrderClick={(order) => setSelectedOrder(order)}
          />
        </div>
      </div>

      {/* Slide-over Drawers */}
      <CategoryDrawer categoryData={selectedCategory} onClose={() => setSelectedCategory(null)} />
      <OrderDrawer orderData={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default Dashboard;
