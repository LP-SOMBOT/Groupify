import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { LogOut, Settings, Shield, User, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

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

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Account</h3>
        <div className="bg-dark-light rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={18} /></div>
              <span className="text-sm font-medium">Edit Profile</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
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
           <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
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
      
      <p className="text-center text-xs text-gray-600 pb-8">Version 1.0.0 (Beta)</p>
    </div>
  );
}