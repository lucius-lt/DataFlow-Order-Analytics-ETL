import { Calendar, RotateCcw, Filter } from 'lucide-react';

const FilterBar = ({ filters, setFilters, onApply, onReset }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyPreset = (startDate, endDate) => {
    const nextFilters = { ...filters, startDate, endDate };
    setFilters(nextFilters);
    if (onApply) {
      setTimeout(() => onApply(nextFilters), 0);
    }
  };

  // Count active non-empty filters
  const activeCount = [
    filters.startDate,
    filters.endDate,
    filters.category,
    filters.deliveryStatus
  ].filter(Boolean).length;

  const isPresetActive = (start, end) => filters.startDate === start && filters.endDate === end;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-border shadow-xs mb-6">
      {/* Quick Date Presets Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 shrink-0 select-none">
          <Calendar size={14} className="text-indigo-600" />
          <span>Quick Periods:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => applyPreset('2024-01-01', '2024-01-07')}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              isPresetActive('2024-01-01', '2024-01-07')
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Jan 1 - 7 (Week 1)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2024-01-08', '2024-01-14')}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              isPresetActive('2024-01-08', '2024-01-14')
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Jan 8 - 14 (Week 2)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('2024-01-01', '2024-01-21')}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              isPresetActive('2024-01-01', '2024-01-21')
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            Full Dataset (Jan 1-21)
          </button>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="px-3 py-1 text-xs rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-1"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Filter Inputs Grid */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 select-none">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 select-none">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 select-none">
              Category
            </label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Clothing">Clothing</option>
              <option value="Toys">Toys</option>
              <option value="Books">Books</option>
            </select>
          </div>

          {/* Delivery Status */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 select-none">
              Fulfillment Status
            </label>
            <select
              name="deliveryStatus"
              value={filters.deliveryStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            >
              <option value="">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onApply && onApply(filters)}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
          >
            <Filter size={15} />
            <span>Apply Filters</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-[11px] font-bold flex items-center justify-center text-white">
                {activeCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="p-2 sm:px-3 sm:py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs sm:text-sm font-medium transition-colors"
            title="Reset filters"
            aria-label="Reset all filters"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
