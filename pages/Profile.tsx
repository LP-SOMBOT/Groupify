import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { LogOut, Settings, Shield, User, ChevronRight, DollarSign, Wallet, Eye, MousePointerClick } from 'lucide-react';
import { useRealtimeGroups } from '../hooks/useRealtime';

export default function Profile() {
  const { user, logout } = useAuth();
  const { groups } = useRealtimeGroups(undefined, user?.uid);
  
  // Monetization rates
  const RATE_PER_VIEW = 0.005;
  const RATE_PER_CLICK = 0.02;

  const totalViews = groups.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = groups.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const earnings = (totalViews * RATE_PER_VIEW) + (totalClicks * RATE_PER_CLICK);

  if (!user) {
      return (
          <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
              <p>Please log in to view profile.</p>
              <Button onClick={() => window.location.href='/#/auth'}>Go to Login</Button>
          </div>
      )
  }

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-4">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=1A1A2E&color=fff`} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover border-4 border-dark"
          />
        </div>
        <h2 className="text-xl font-bold text-white">{user.displayName || 'User'}</h2>
        <p className="text-sm text-gray-400">{user.email}</p>
      </div>

      {/* Monetization Dashboard */}
      <div className="bg-gradient-to-br from-dark-light to-dark border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={100} className="text-success" />
         </div>
         <div className="relative z-10">
             <div className="flex items-center gap-2 mb-2">
                <Wallet className="text-success" size={20} />
                <h3 className="font-bold text-white">Creator Earnings</h3>
             </div>
             <div className="text-3xl font-bold text-white mb-4">${earnings.toFixed(2)}</div>
             
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 p-3 rounded-xl">
                   <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Eye size={12} /> Views
                   </div>
                   <div className="font-bold">{totalViews}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                   <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <MousePointerClick size={12} /> Clicks
                   </div>
                   <div className="font-bold">{totalClicks}</div>
                </div>
             </div>

             <Button size="sm" className="w-full bg-success hover:bg-success/90 text-white border-0 shadow-lg shadow-success/20">
                Cash Out
             </Button>
         </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Account</h3>
        <div className="bg-dark-light rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5" onClick={() => alert('Feature coming soon')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={18} /></div>
              <span className="text-sm font-medium">Edit Profile</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors" onClick={() => alert('Feature coming soon')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg text-warning"><Settings size={18} /></div>
              <span className="text-sm font-medium">Settings</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Support</h3>
        <div className="bg-dark-light rounded-2xl overflow-hidden">
           <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors" onClick={() => window.open('https://google.com', '_blank')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg text-success"><Shield size={18} /></div>
              <span className="text-sm font-medium">Privacy Policy</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <Button variant="outline" className="w-full border-error text-error hover:bg-error/10 mt-8" onClick={logout}>
        <LogOut size={18} className="mr-2" />
        Sign Out
      </Button>
      
      <p className="text-center text-xs text-gray-600 pb-8">Version 1.2.0 (Realtime)</p>
    </div>
  );
}