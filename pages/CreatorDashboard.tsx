import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeGroups } from '../hooks/useRealtime';
import Button from '../components/ui/Button';
import { ChevronLeft, Lock, Trophy, TrendingUp, Wallet, ArrowRight, FlaskConical, MousePointerClick, Eye, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompactNumber } from '../lib/utils';
import { updateUserProfile } from '../lib/db';
import { useToast } from '../context/ToastContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { groups } = useRealtimeGroups(undefined, user?.uid, false);
  
  // Monetization Logic
  const RATE_PER_VIEW = 0.005;
  const RATE_PER_CLICK = 0.02;

  const totalViews = groups.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = groups.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  
  const ELIGIBILITY_THRESHOLD = 1000;
  const isEligible = totalViews >= ELIGIBILITY_THRESHOLD || profile?.isBetaTester;

  // Mock Data for Chart based on current stats to make it look dynamic
  const chartData = useMemo(() => {
    const data = [];
    const baseViews = Math.floor(totalViews / 7);
    const baseClicks = Math.floor(totalClicks / 7);
    for (let i = 6; i >= 0; i--) {
      data.push({
        name: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
        views: Math.max(0, baseViews + Math.floor(Math.random() * 50) - 25),
        clicks: Math.max(0, baseClicks + Math.floor(Math.random() * 10) - 5),
      });
    }
    return data;
  }, [totalViews, totalClicks]);

  const handleJoinProgram = async () => {
    if (!profile) return;
    try {
        await updateUserProfile(profile.uid, { isCreator: true });
        showToast("Welcome to the Creator Program!", "success");
    } catch (e) {
        showToast("Error joining program.", "error");
    }
  };

  if (!profile) return null;

  return (
    <div className="pb-10 animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft />
                </button>
                <h1 className="text-xl font-bold">Creator Studio</h1>
            </div>
            {profile.isCreator && (
                <div className="px-3 py-1 bg-gradient-to-r from-primary to-secondary rounded-full text-[10px] font-bold text-white shadow-lg shadow-primary/20">
                    PARTNER
                </div>
            )}
        </div>

        {/* Beta Notice */}
        {profile.isBetaTester && !profile.isCreator && (
             <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-2xl flex gap-3 items-center">
                 <div className="p-2 bg-secondary/20 rounded-full text-secondary">
                    <FlaskConical size={20} />
                 </div>
                 <div>
                     <h3 className="font-bold text-secondary text-sm">Beta Access</h3>
                     <p className="text-xs text-gray-400">You can monetize immediately without waiting for thresholds.</p>
                 </div>
             </div>
        )}

        {/* Main Revenue Card */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#2A2A3E] to-[#1A1A2E] border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">${(profile.balance || 0).toFixed(2)}</h2>
                
                <div className="flex gap-3">
                    <Button 
                        disabled={!profile.isCreator || profile.balance < 1}
                        onClick={() => navigate('/cashout')}
                        className="bg-success hover:bg-success/90 border-0 flex-1 shadow-success/20"
                    >
                        <Wallet size={16} className="mr-2" /> Cash Out
                    </Button>
                    <Button 
                        variant="ghost"
                        className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10"
                        onClick={() => showToast("Detailed history coming soon", "success")}
                    >
                        <Activity size={16} className="mr-2" /> History
                    </Button>
                </div>
                {profile.monetizationFrozen && (
                    <div className="mt-4 p-2 bg-error/10 rounded-lg text-error text-xs font-bold text-center border border-error/20">
                        Monetization Suspended
                    </div>
                )}
            </div>
        </div>

        {/* Program Status / Analytics */}
        {!profile.isCreator ? (
             <div className="bg-dark-light rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="text-warning" size={24} /> 
                        <h3 className="font-bold text-lg">Unlock Monetization</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold text-gray-400">
                            <span>Progress</span>
                            <span>{Math.min(totalViews, ELIGIBILITY_THRESHOLD)} / {ELIGIBILITY_THRESHOLD} Views</span>
                        </div>
                        <div className="h-3 bg-dark rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000" 
                                style={{ width: `${Math.min((totalViews / ELIGIBILITY_THRESHOLD) * 100, 100)}%` }}
                            />
                        </div>
                        
                        {isEligible ? (
                            <Button fullWidth onClick={handleJoinProgram} className="mt-2 gap-2 bg-gradient-to-r from-primary to-secondary border-0">
                                Activate Partner Status <ArrowRight size={16} />
                            </Button>
                        ) : (
                            <Button fullWidth disabled variant="ghost" className="mt-2 bg-white/5 text-gray-500">
                                <Lock size={16} className="mr-2" /> Reach 1k Views to Unlock
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-dark-light p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
                        <div className="p-2 bg-primary/10 w-fit rounded-xl text-primary mb-2">
                            <Eye size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{formatCompactNumber(totalViews)}</div>
                            <div className="text-xs text-gray-400 font-medium">Total Views</div>
                        </div>
                    </div>
                    <div className="bg-dark-light p-4 rounded-2xl border border-white/5 flex flex-col justify-between h-32">
                        <div className="p-2 bg-secondary/10 w-fit rounded-xl text-secondary mb-2">
                            <MousePointerClick size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{formatCompactNumber(totalClicks)}</div>
                            <div className="text-xs text-gray-400 font-medium">Total Clicks</div>
                        </div>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-dark-light p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp size={18} className="text-success" /> Performance
                        </h3>
                        <div className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded-lg">Last 7 Days</div>
                    </div>
                    
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#1A1A2E', borderColor: '#ffffff20', borderRadius: '12px'}}
                                    itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                                    cursor={{stroke: '#ffffff20'}}
                                />
                                <Area type="monotone" dataKey="views" stroke="#6C63FF" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Rates Info */}
                <div className="bg-gradient-to-r from-dark-light to-dark p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                        <p className="mb-1">Rate per View</p>
                        <p className="text-white font-bold font-mono">$0.005</p>
                    </div>
                    <div className="h-8 w-px bg-white/10"></div>
                    <div className="text-xs text-gray-400 text-right">
                        <p className="mb-1">Rate per Click</p>
                        <p className="text-white font-bold font-mono">$0.02</p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}