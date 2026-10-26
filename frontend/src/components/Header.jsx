import React, { useState } from 'react';
import { Menu, RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import DataFlowLogo from './ui/DataFlowLogo';

const routeConfig = {
  Dashboard: {
    section: 'Overview',
    title: 'Dashboard',
    description: 'Executive revenue, order volume, category mix, and fulfillment metrics.'
  },
  Orders: {
    section: 'Operations',
    title: 'Orders Management',
    description: 'Search, filter, and inspect incoming order records across channels.'
  },
  Products: {
    section: 'Operations',
    title: 'Product Catalog',
    description: 'Catalog inventory, pricing breakdown, and category distribution.'
  },
  Analytics: {
    section: 'Overview',
    title: 'Deep Analytics',
    description: 'Revenue trends, order frequency distributions, and comparative breakdown.'
  },
  Delivery: {
    section: 'Overview',
    title: 'Delivery & Logistics',
    description: 'Shipment timelines, carrier dispatch performance, and delay mitigation.'
  },
  Pipeline: {
    section: 'ETL Engine',
    title: 'Data Ingestion & Pipeline',
    description: 'Multi-format parser (JSON, CSV, XML) transforming raw data into SQLite tables.'
  },
  Settings: {
    section: 'System',
    title: 'System Settings',
    description: 'Backend REST API endpoint configuration and connectivity diagnostics.'
  }
};

const Header = ({ currentRoute, setMobileMenuOpen, onRefresh }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  const currentConfig = routeConfig[currentRoute] || {
    section: 'Overview',
    title: currentRoute,
    description: 'Overview and operational metrics.'
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setJustRefreshed(false);

    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Broadcast data update event to all active listening pages
        window.dispatchEvent(new CustomEvent('mock_dataset_updated', { detail: { manual: true } }));
      }
      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2000);
    } catch (e) {
      console.warn('Manual refresh error:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-xs">
      {/* Left side: Mobile menu toggle + Breadcrumbs & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileMenuOpen && setMobileMenuOpen(true)}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Small Brand Logo on mobile */}
        <div className="lg:hidden shrink-0">
          <DataFlowLogo size={26} showText={false} />
        </div>

        <div className="flex flex-col min-w-0">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span className="hover:text-slate-600 transition-colors">DataFlow</span>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="hidden sm:inline hover:text-slate-600 transition-colors">{currentConfig.section}</span>
            <ChevronRight size={12} className="hidden sm:inline text-slate-300" />
            <span className="text-slate-700 font-semibold truncate">{currentConfig.title}</span>
          </nav>

          {/* Page Title & Context */}
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate leading-tight">
              {currentConfig.title}
            </h1>
            <p className="hidden xl:inline text-xs text-slate-500 truncate max-w-lg leading-tight">
              — {currentConfig.description}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Actions & Status */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px]">Pipeline Active</span>
        </div>

        {/* Refresh Action Button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            justRefreshed
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-white border-border text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:bg-slate-100 shadow-xs'
          }`}
          title="Refresh dataset from live database or simulated engine"
          aria-label="Refresh data"
        >
          {justRefreshed ? (
            <>
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="hidden xs:inline">Updated</span>
            </>
          ) : (
            <>
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'} />
              <span className="hidden xs:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
