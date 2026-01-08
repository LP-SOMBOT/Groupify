import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { LogOut, Settings, Shield, User, ChevronRight, BarChart3, MessageCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNameInitials } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
  };

  if (!user) {
      return (
          <div className="p-4 flex flex-col items-center justify-center h-full space-y-4">
              <p>Please log in to view profile.</p>
              <Button onClick={() => navigate('/auth')}>Go to Login</Button>
          </div>
      )
  }

  const name = profile?.displayName || user.displayName || 'User';

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-4 flex items-center justify-center">
            {profile?.photoURL ? (
                <img 
                    src={profile.photoURL} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-4 border-dark"
                />
            ) : (
                <div className="w-full h-full rounded-full bg-dark-light border-4 border-dark flex items-center justify-center text-4xl font-bold text-white">
                    {getNameInitials(name)}
                </div>
            )}
        </div>
        <h2 className="text-xl font-bold text-white">{name}</h2>
        <p className="text-sm text-gray-400 text-center max-w-xs mt-1">
            {profile?.bio || "No bio yet."}
        </p>
        {profile?.isBetaTester && <span className="mt-2 text-[10px] bg-secondary/20 text-secondary border border-secondary/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Beta Tester</span>}
      </div>

      {/* Creator Dashboard Entry */}
      {profile?.isCreator ? (
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-dark-light border border-white/10 p-4 rounded-2xl shadow-lg flex items-center justify-between group active:scale-[0.98] transition-all relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50"></div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl text-white shadow-lg">
                  <Sparkles size={24} />
              </div>
              <div className="text-left">
                  <h3 className="text-white font-bold text-lg">Creator Studio</h3>
                  <p className="text-gray-400 text-xs">Analytics, Revenue & Growth</p>
              </div>
           </div>
           <ChevronRight className="text-white group-hover:translate-x-1 transition-transform relative z-10" />
        </button>
      ) : (
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-gradient-to-r from-dark-light to-dark border border-white/5 p-4 rounded-2xl shadow-lg flex items-center justify-between group active:scale-[0.98] transition-all"
        >
           <div className="flex items-center gap-4">
              <div className="bg-white/5 p-3 rounded-xl text-white">
                  <BarChart3 size={24} />
              </div>
              <div className="text-left">
                  <h3 className="text-white font-bold text-lg">Creator Program</h3>
                  <p className="text-gray-400 text-xs">Join to start earning</p>
              </div>
           </div>
           <ChevronRight className="text-white group-hover:translate-x-1 transition-transform" />
        </button>
      )}

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Account</h3>
        <div className="bg-dark-light rounded-2xl overflow-hidden border border-white/5">
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5" onClick={() => navigate('/edit-profile')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={18} /></div>
              <span className="text-sm font-medium">Edit Profile</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors" onClick={() => navigate('/settings')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg text-warning"><Settings size={18} /></div>
              <span className="text-sm font-medium">Settings & PIN</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Support</h3>
        <div className="bg-dark-light rounded-2xl overflow-hidden border border-white/5">
           <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors" onClick={() => window.open('https://wa.me/252613982172', '_blank')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg text-success"><MessageCircle size={18} /></div>
              <span className="text-sm font-medium">Contact Support</span>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      <Button variant="outline" className="w-full border-error/50 text-error hover:bg-error/10 mt-8" onClick={handleLogout}>
        <LogOut size={18} className="mr-2" />
        Sign Out
      </Button>
      
      <p className="text-center text-xs text-gray-600 pb-8">Groupify v3.1.0</p>
    </div>
  );
}