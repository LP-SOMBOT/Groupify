import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeGroups } from '../hooks/useRealtime';
import Button from '../components/ui/Button';
import { ChevronLeft, Lock, Trophy, TrendingUp, Wallet, ArrowRight, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompactNumber } from '../lib/utils';
import { updateUserProfile } from '../lib/db';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { groups } = useRealtimeGroups(undefined, user?.uid, false); // Get all status groups
  
  // Monetization Logic
  const RATE_PER_VIEW = 0.005;
  const RATE_PER_CLICK = 0.02;

  const totalViews = groups.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = groups.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  
  // Live earnings calc for display, actual balance is in profile.balance
  const estimatedEarnings = (totalViews * RATE_PER_VIEW) + (totalClicks * RATE_PER_CLICK);

  const ELIGIBILITY_THRESHOLD = 1000;
  // Beta testers bypass threshold
  const isEligible = totalViews >= ELIGIBILITY_THRESHOLD || profile?.isBetaTester;

  const handleJoinProgram = async () => {
    if (!profile) return;
    try {
        await updateUserProfile(profile.uid, { isCreator: true });
        alert("Welcome to the Creator Program!");
    } catch (e) {
        alert("Error joining program.");
    }
  };

  return (
    <div className="pb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ChevronLeft />
            </button>
            <h1 className="text-xl font-bold">Creator Dashboard</h1>
        </div>

        {profile?.isBetaTester && (
             <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl mb-4 flex gap-3 items-center">
                 <FlaskConical className="text-secondary" />
                 <div>
                     <h3 className="font-bold text-secondary text-sm">Beta Tester Access</h3>
                     <p className="text-xs text-gray-400">You have early access to monetization features.</p>
                 </div>
             </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-success/20 to-primary/20 border border-success/30 rounded-2xl p-6 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-success"><Wallet size={100} /></div>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Available Balance</p>
            <h2 className="text-4xl font-bold text-white mb-6">${profile?.balance?.toFixed(2) || '0.00'}</h2>
            
            <div className="flex gap-3 justify-center">
                 <Button 
                    disabled={!profile?.isCreator || profile?.balance < 1}
                    onClick={() => navigate('/cashout')}
                    className="bg-success hover:bg-success/90 border-0"
                 >
                    Request Cashout
                 </Button>
            </div>
            {profile?.monetizationFrozen && <p className="text-error text-xs font-bold mt-2">Monetization Frozen by Admin</p>}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-dark-light p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Views</div>
                <div className="text-2xl font-bold">{formatCompactNumber(totalViews)}</div>
            </div>
            <div className="bg-dark-light p-4 rounded-xl border border-white/5">
                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Clicks</div>
                <div className="text-2xl font-bold">{formatCompactNumber(totalClicks)}</div>
            </div>
        </div>

        {/* Monetization Status */}
        <div className="bg-dark-light rounded-2xl p-5 border border-white/5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Trophy className="text-warning" /> Creator Status
            </h3>

            {profile?.isCreator ? (
                <div className="text-center py-4">
                    <div className="text-success font-bold text-lg mb-2">Active Partner</div>
                    <p className="text-xs text-gray-400">You are earning money from your groups.</p>
                </div>
            ) : (
                <div className="space-y-4">
                     <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                        <span>Progress to Eligibility</span>
                        <span>{Math.min(totalViews, ELIGIBILITY_THRESHOLD)} / {ELIGIBILITY_THRESHOLD} Views</span>
                     </div>
                     <div className="h-2 bg-dark rounded-full overflow-hidden border border-white/10">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                            style={{ width: `${Math.min((totalViews / ELIGIBILITY_THRESHOLD) * 100, 100)}%` }}
                        />
                     </div>
                     
                     {isEligible ? (
                         <Button fullWidth onClick={handleJoinProgram} className="mt-2 gap-2">
                            Join Creator Program <ArrowRight size={16} />
                         </Button>
                     ) : (
                         <Button fullWidth disabled variant="ghost" className="mt-2 bg-white/5 text-gray-500">
                            <Lock size={16} className="mr-2" /> Reach 1k Views to Unlock
                         </Button>
                     )}
                </div>
            )}
        </div>
    </div>
  );
}