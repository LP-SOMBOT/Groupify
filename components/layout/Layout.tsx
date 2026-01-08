import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import MobileGuard from './MobileGuard';

export default function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <MobileGuard>
      <div className="min-h-screen bg-dark text-gray-100 flex flex-col font-sans">
        {!isAuthPage && <TopBar />}
        
        <main className={!isAuthPage ? "flex-1 pb-20 pt-2 px-4" : "flex-1"}>
          <Outlet />
        </main>
        
        {!isAuthPage && <BottomNav />}
      </div>
    </MobileGuard>
  );
}