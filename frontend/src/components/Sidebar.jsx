import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  BarChart2, 
  Truck, 
  Layers, 
  Settings, 
  X, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DataFlowLogo from './ui/DataFlowLogo';

const navSections = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, badge: null },
      { name: 'Analytics', icon: BarChart2, badge: null },
      { name: 'Delivery', icon: Truck, badge: null }
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Orders', icon: ShoppingCart, badge: null },
      { name: 'Products', icon: Package, badge: null }
    ]
  },
  {
    title: 'ETL Engine',
    items: [
      { name: 'Pipeline', icon: Layers, badge: 'ETL' }
    ]
  },
  {
    title: 'Preferences',
    items: [
      { name: 'Settings', icon: Settings, badge: null }
    ]
  }
];

const Sidebar = ({ 
  currentRoute, 
  setCurrentRoute, 
  mobileMenuOpen, 
  setMobileMenuOpen,
  isCollapsed = false,
  setIsCollapsed
}) => {
  // Close drawer on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen && setMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleSelectRoute = (name) => {
    setCurrentRoute(name);
    if (setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const renderNavContent = (isMobileDrawer = false) => {
    const showCompact = !isMobileDrawer && isCollapsed;

    return (
      <div className="flex flex-col h-full bg-white text-slate-800">
        {/* Brand Header */}
        <div className={`h-16 flex items-center justify-between border-b border-border px-4 ${showCompact ? 'justify-center px-2' : ''}`}>
          <div className="flex items-center min-w-0">
            <DataFlowLogo size={30} showText={!showCompact} />
          </div>

          {/* Mobile close button */}
          {isMobileDrawer && setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}

          {/* Desktop collapse toggle */}
          {!isMobileDrawer && setIsCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!showCompact && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleSelectRoute(item.name)}
                    title={showCompact ? item.name : undefined}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all relative ${
                      showCompact ? 'justify-center px-2' : ''
                    } ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {/* Active vertical accent pill on the left */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r-full" />
                    )}

                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? 'text-indigo-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />

                    {!showCompact && (
                      <>
                        <span className="truncate text-left flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border bg-slate-50/50">
          {!showCompact ? (
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-medium text-slate-600">SQLite Engine Active</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">v1.2.0</span>
            </div>
          ) : (
            <div className="flex justify-center" title="SQLite Engine Active">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-border h-full shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
        >
          {/* Backdrop with subtle blur */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col w-72 max-w-[85vw] bg-white h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
