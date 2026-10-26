import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import OrdersPage from './components/OrdersPage';
import ProductsPage from './components/ProductsPage';
import AnalyticsPage from './components/AnalyticsPage';
import DeliveryPage from './components/DeliveryPage';
import PipelinePage from './components/PipelinePage';
import SettingsPage from './components/SettingsPage';

const validRoutes = ['Dashboard', 'Orders', 'Products', 'Analytics', 'Delivery', 'Pipeline', 'Settings'];

const getInitialRoute = () => {
  if (typeof window !== 'undefined' && window.location.hash) {
    const hash = window.location.hash.replace('#', '').trim();
    const matched = validRoutes.find(v => v.toLowerCase() === hash.toLowerCase());
    if (matched) return matched;
  }
  return 'Dashboard';
};

function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      const route = getInitialRoute();
      setCurrentRoute(route);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (route) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.location.hash = route;
    }
  };

  const renderPage = () => {
    switch (currentRoute) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Orders':
        return <OrdersPage />;
      case 'Products':
        return <ProductsPage />;
      case 'Analytics':
        return <AnalyticsPage />;
      case 'Delivery':
        return <DeliveryPage />;
      case 'Pipeline':
        return <PipelinePage />;
      case 'Settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-900">
      <Sidebar 
        currentRoute={currentRoute} 
        setCurrentRoute={handleNavigate} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Header 
          currentRoute={currentRoute} 
          onNavigate={handleNavigate}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 focus:outline-none">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
