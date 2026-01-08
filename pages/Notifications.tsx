import React, { useEffect } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtime';
import { deleteNotification } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import { Bell, Info, AlertTriangle, Zap, ArrowLeft, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, loading } = useRealtimeNotifications();
  const navigate = useNavigate();

  // Clear Personal Notifications from DB on View
  useEffect(() => {
    if (user && notifications.length > 0) {
      notifications.forEach(n => {
        if (!n.isBroadcast) {
          deleteNotification(user.uid, n.id);
        }
      });
    }
  }, [user, notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'update': return <Zap size={20} className="text-warning" />;
      case 'alert': return <AlertTriangle size={20} className="text-error" />;
      default: return <Info size={20} className="text-primary" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-dark-light rounded-2xl animate-pulse" />)}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map(item => (
            <div key={item.id} className={`p-4 rounded-2xl border flex gap-4 ${item.isBroadcast ? 'bg-primary/10 border-primary/20' : 'bg-dark-light border-white/5'}`}>
              <div className="shrink-0 pt-1">
                {item.isBroadcast ? <Radio size={20} className="text-primary animate-pulse" /> : getIcon(item.type)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-white">{item.title}</h3>
                    {item.isBroadcast && <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-gray-600 mt-2 block">
                  {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
          <div className="w-16 h-16 bg-dark-light rounded-full flex items-center justify-center mb-4">
            <Bell size={32} className="opacity-50" />
          </div>
          <p>No new notifications</p>
        </div>
      )}
    </div>
  );
}