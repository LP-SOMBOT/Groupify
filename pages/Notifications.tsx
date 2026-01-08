import React, { useEffect, useState } from 'react';
import { fetchNotifications } from '../lib/firestore';
import { AppNotification } from '../lib/types';
import { Bell, Info, AlertTriangle, Zap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await fetchNotifications();
      setNotifications(data);
      setLoading(false);
    }
    load();
  }, []);

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
            <div key={item.id} className="bg-dark-light p-4 rounded-2xl border border-white/5 flex gap-4">
              <div className="shrink-0 pt-1">
                {getIcon(item.type)}
              </div>
              <div>
                <h3 className="font-bold text-sm text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-gray-600 mt-2 block">
                  {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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