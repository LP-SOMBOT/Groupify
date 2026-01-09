import React from 'react';
import { Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useRealtimeNotifications } from '../../hooks/useRealtime';

export default function TopBar() {
  const location = useLocation();
  const { unreadCount } = useRealtimeNotifications();

  // Hide header on notifications page and dashboard as requested
  if (location.pathname === '/notifications' || location.pathname === '/dashboard') return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-dark/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
          G
        </div>
        <span className="font-bold text-lg tracking-tight text-white">Groupify</span>
      </Link>
      
      <div className="flex items-center gap-3">
        <Link to="/notifications" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-secondary rounded-full border border-dark text-[9px] flex items-center justify-center text-white font-bold px-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}