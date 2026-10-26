import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../services/api';
import { Search, Package, X } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/formatters';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (categoryFilter) filters.category = categoryFilter;
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error('Fetch products error:', err);
      setError('Unable to load product catalog.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchProducts();

    window.addEventListener('mock_dataset_updated', fetchProducts);
    return () => window.removeEventListener('mock_dataset_updated', fetchProducts);
  }, [fetchProducts]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate category aggregates for top cards
  const categoryGroups = {};
  products.forEach(p => {
    if (!categoryGroups[p.category]) {
      categoryGroups[p.category] = { count: 0, totalValue: 0 };
    }
    categoryGroups[p.category].count++;
    categoryGroups[p.category].totalValue += (p.price * (p.stock || 1));
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Object.entries(categoryGroups).map(([cat, info]) => {
          const isSelected = categoryFilter.toLowerCase() === cat.toLowerCase();

          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(isSelected ? '' : cat)}
              className={`p-4 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-border hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
              }`}
            >
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block truncate">
                  {cat}
                </span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {info.count}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                {info.count === 1 ? '1 item listed' : `${info.count} items listed`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, catalog SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {categoryFilter && (
          <button
            onClick={() => setCategoryFilter('')}
            className="px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Category: {categoryFilter}</span>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-white border border-border rounded-xl p-5 space-y-3 animate-pulse shadow-xs">
              <div className="flex justify-between">
                <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
                <div className="w-20 h-5 bg-slate-100 rounded"></div>
              </div>
              <div className="h-5 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-border p-10 text-center shadow-xs">
          <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Package size={20} />
          </div>
          <h4 className="text-base font-bold text-slate-900">No products found</h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            No items matched your current search and category criteria.
          </p>
          {(searchTerm || categoryFilter) && (
            <button
              onClick={() => { setSearchTerm(''); setCategoryFilter(''); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(product => {
            const isLowStock = product.stock !== undefined && product.stock < 50;

            return (
              <div 
                key={product.id} 
                className="bg-white p-5 rounded-xl border border-border shadow-xs hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Package size={18} />
                    </div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200/60 rounded text-[11px] font-medium">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-indigo-700 font-semibold">{product.id}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Unit Price</span>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  {product.stock !== undefined && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Inventory</span>
                      <span className={`text-xs font-medium tabular-nums ${isLowStock ? 'text-amber-700 font-semibold' : 'text-slate-600'}`}>
                        {formatNumber(product.stock)} units
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
