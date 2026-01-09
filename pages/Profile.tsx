import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { LogOut, Settings, User, ChevronRight, MessageCircle, Sparkles, Lock, Trophy, Zap, FlaskConical, LayoutDashboard, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getNameInitials } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { useRealtimeGroups } from '../hooks/useRealtime';
import { updateUserProfile } from '../lib/db';

export default function Profile() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  // Fetch groups to calculate eligibility locally for the UI preview
  const { groups } = useRealtimeGroups(undefined, user?.uid, false);
  const [isJoining, setIsJoining] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'success');
  };

  const handleJoinProgram = async () => {
    if (!profile || !user) return;
    setIsJoining(true);
    try {
        // Simulate network delay for effect
        await new Promise(r => setTimeout(r, 1500));
        
        // Update DB: Set isCreator true AND creatorWelcomeSeen true immediately.
        // This ensures if they leave the page and come back, they don't see the success card again.
        // We rely on local 'justJoined' state to show the success message for this session only.
        await updateUserProfile(profile.uid, { isCreator: true, creatorWelcomeSeen: true });
        
        setJustJoined(true);
    } catch (e) {
        showToast("Error joining program.", "error");
    } finally {
        setIsJoining(false);
    }
  };

  const handleViewDashboard = async () => {
      // No need to update DB here anymore
      navigate('/dashboard');
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
  const totalViews = groups.reduce((acc, g) => acc + (g.views || 0), 0);
  const ELIGIBILITY_THRESHOLD = 1000;
  // Cap at 100 for visual bar
  const progressPercent = Math.min((totalViews / ELIGIBILITY_THRESHOLD) * 100, 100);
  const isEligible = totalViews >= ELIGIBILITY_THRESHOLD || profile?.isBetaTester;
  
  // Show welcome/success ONLY if justJoined local state is true.
  // We ignore profile.creatorWelcomeSeen for display logic because we set it to true immediately.
  const showSuccessCard = justJoined;

  return (
    <div className="space-y-6 pt-4 animate-fade-in pb-20">
      {/* Profile Header */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-4 flex items-center justify-center relative shadow-xl shadow-primary/20">
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
            {profile?.isCreator && (
                <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-4 border-dark shadow-lg">
                    <Sparkles size={14} fill="currentColor" />
                </div>
            )}
        </div>
        <h2 className="text-xl font-bold text-white">{name}</h2>
        <p className="text-sm text-gray-400 text-center max-w-xs mt-1">
            {profile?.bio || "No bio yet."}
        </p>
        {profile?.isBetaTester && <span className="mt-2 text-[10px] bg-secondary/20 text-secondary border border-secondary/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><FlaskConical size={10}/> Beta Tester</span>}
      </div>

      {/* Creator Program Section Logic */}
      {showSuccessCard ? (
        // STATE 4: SUCCESS (ACTIVATED)
        <div className="w-full bg-dark-light border border-success/30 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center text-center animate-fade-in relative overflow-hidden">
             {/* Background glow effect */}
            <div className="absolute inset-0 bg-success/5 pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center text-success mb-4 relative z-10 shadow-[0_0_20px_rgba(76,175,80,0.3)]">
                <CheckCircle size={40} strokeWidth={3} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Activated</h3>
            <p className="text-gray-400 text-sm mb-6 text-center max-w-[80%] relative z-10">
                You have successfully joined the Creator Program.
            </p>

            <Button 
                fullWidth 
                onClick={handleViewDashboard}
                className="bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20 border-0 relative z-10"
            >
                View Dashboard
            </Button>
        </div>
      ) : profile?.isCreator ? (
        // STATE 3: ALREADY A CREATOR
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full bg-[#1A1A2E] border border-white/5 p-4 rounded-3xl shadow-lg flex items-center justify-between group active:scale-[0.98] transition-all relative overflow-hidden"
        >
           {/* Background hover effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
           
           <div className="flex items-center gap-4 relative z-10">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                  <LayoutDashboard size={22} className="text-white" />
              </div>
              
              <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-base">Creator Studio</h3>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">Balance:</span>
                    <span className="text-sm font-bold text-[#4CAF50]">${(profile.balance || 0).toFixed(2)}</span>
                  </div>
              </div>
           </div>
           
           {/* Action Icon */}
           <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors">
              <ChevronRight className="text-gray-400 group-hover:text-white transition-colors" size={16} />
           </div>
        </button>
      ) : isEligible ? (
        // STATE 2: ELIGIBLE BUT NOT JOINED
        <div className="w-full bg-gradient-to-br from-dark-light to-dark border border-success/30 p-5 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Trophy size={80} className="text-success" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-success/20 rounded-lg text-success">
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold text-success uppercase tracking-wider">You are eligible!</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Join Creator Program</h3>
                <p className="text-sm text-gray-400 mb-4 max-w-[80%]">
                    Monetize your groups and earn revenue from every view and click.
                </p>
                <Button 
                    fullWidth 
                    isLoading={isJoining}
                    onClick={handleJoinProgram}
                    className="bg-success hover:bg-success/90 text-white shadow-lg shadow-success/20 border-0"
                >
                    Activate Creator Mode
                </Button>
            </div>
        </div>
      ) : (
        // STATE 1: NOT ELIGIBLE (PROGRESS)
        <div className="w-full bg-dark-light border border-white/5 p-5 rounded-3xl shadow-lg relative overflow-hidden">
           <div className="flex items-center gap-4 relative z-10 w-full mb-4">
              <div className="bg-white/5 p-3 rounded-2xl text-gray-400">
                  <Lock size={24} />
              </div>
              <div className="text-left flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-white font-bold text-base">Unlock Creator Mode</h3>
                    <span className="text-[10px] font-bold text-gray-500">{Math.floor(progressPercent)}%</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                  </div>
              </div>
           </div>
           <div className="flex items-center justify-between text-[10px] text-gray-500 bg-white/5 p-3 rounded-xl">
               <span>Requirements:</span>
               <span className="font-mono">{totalViews} / {ELIGIBILITY_THRESHOLD} Views</span>
           </div>
        </div>
      )}

      {/* Standard Menus */}
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

      <Button variant="outline" className="w-full border-error/50 text-error hover:bg-error/10 mt-8 mb-4" onClick={handleLogout}>
        <LogOut size={18} className="mr-2" />
        Sign Out
      </Button>
      
      <p className="text-center text-xs text-gray-600">Groupify v3.2.0</p>
    </div>
  );
}