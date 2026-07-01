import React from 'react';
import './dashboard.css';
import { AppProvider, useApp } from './contexts/AppContext';
import Login      from './pages/Login';
import Sidebar    from './components/Sidebar';
import Topbar     from './components/Topbar';
import Toast      from './components/Toast';
import Dashboard  from './pages/Dashboard';
import Orders     from './pages/Orders';
import Products   from './pages/Products';
import Categories from './pages/Categories';
import Branches   from './pages/Branches';
import Staff      from './pages/Staff';
import CounterPanel from './pages/CounterPanel';
import Kitchen    from './pages/Kitchen';
import Inventory  from './pages/Inventory';
import Analytics  from './pages/Analytics';
import Reports    from './pages/Reports';
import Settings   from './pages/Settings';
import POSIntegration from './pages/POSIntegration';

function DashboardContent() {
  const { currentUser, activeNav, theme, mobileMenuOpen, closeMobileMenu } = useApp();
  if (!currentUser) return <div className="dashboard-shell" data-theme={theme}><Login /></div>;

  const pages = {
    dashboard:  <Dashboard />,
    counter:    <CounterPanel />,
    orders:     <Orders />,
    kitchen:    <Kitchen />,
    products:   <Products />,
    categories: <Categories />,
    branches:   <Branches />,
    inventory:  <Inventory />,
    staff:      <Staff />,
    analytics:  <Analytics />,
    reports:    <Reports />,
    settings:   <Settings />,
    pos:        <POSIntegration />,
  };

  return (
    <div className="dashboard-shell" data-theme={theme}>
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} aria-hidden="true" />
      )}
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <Topbar />
          <main className="dashboard-content fade-up" key={activeNav}>
            {pages[activeNav] || <Dashboard />}
          </main>
        </div>
      </div>
      <Toast />
    </div>
  );
}

export default function DashboardApp() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
