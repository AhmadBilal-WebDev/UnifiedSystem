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
  const { currentUser, activeNav, theme } = useApp();
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
    <div className="dashboard-shell" data-theme={theme} style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Topbar />
        <main style={{ flex:1, overflowY:'auto', overflowX:'hidden', background:'var(--bg-base)' }}
          className="fade-up" key={activeNav}>
          {pages[activeNav] || <Dashboard />}
        </main>
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
