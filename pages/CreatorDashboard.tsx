import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeGroups, useRealtimeWithdrawals } from '../hooks/useRealtime';
import Button from '../components/ui/Button';
import { ChevronLeft, TrendingUp, Wallet, MousePointerClick, Eye, Sparkles, Activity, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompactNumber } from '../lib/utils';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { groups } = useRealtimeGroups(undefined, user?.uid, false);
  const { withdrawals } = useRealtimeWithdrawals();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  
  if (!profile || !profile.isCreator) return null; // Should be guarded by route/profile logic
  
  // Stats Calculation
  const totalViews = groups.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = groups.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  
  // Mock Data Generators for Visuals
  const generateChartData = (days: number) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      // Randomize slightly for effect based on real totals (simulated distribution)
      const v = Math.max(0, Math.floor((totalViews / days) + (Math.random() * 20 - 10)));
      const c = Math.floor(v * 0.15); 
      const r = (c * 0.02) + (v * 0.005);
      data.push({ name: dayName, views: v, clicks: c, revenue: r });
    }
    return data;
  };

  const chartData = useMemo(() => generateChartData(timeRange === '7d' ? 7 : 30), [timeRange, totalViews]);
  const userWithdrawals = withdrawals.filter(w => w.userId === user?.uid).slice(0, 5);

  return (
    <div className="min-h-screen pb-10 pt-2 space-y-6 animate-fade-in bg-dark">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 z-30 bg-dark/80 backdrop-blur-md py-2 -mx-4 px-4 border-b border-white/5">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ChevronLeft />
                </button>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Creator Studio</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <div className="px-3 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-full text-[10px] font-bold text-white flex items-center gap-1 shadow-[0_0_10px_rgba(108,99,255,0.2)]">
                    <Sparkles size={10} className="text-primary" /> PRO
                </div>
            </div>
        </div>

        {/* Revenue Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 bg-gradient-to-br from-[#1E1E30] to-[#141420] border border-white/10 shadow-2xl group transition-all hover:border-primary/20">
             {/* Decorative */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-all duration-1000"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-secondary/10 rounded-full blur-[50px]"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-3 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Wallet size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-300 tracking-wider">AVAILABLE BALANCE</span>
                </div>
                
                <h2 className="text-5xl font-black text-white mb-8 tracking-tighter flex items-start gap-1">
                    <span className="text-2xl text-gray-500 mt-2">$</span>
                    {(profile.balance || 0).toFixed(2)}
                </h2>
                
                <div className="w-full max-w-xs grid grid-cols-1 gap-3">
                    <Button 
                        size="lg"
                        disabled={profile.monetizationFrozen || (profile.balance < 1)}
                        onClick={() => navigate('/cashout')}
                        className="bg-white text-dark hover:bg-gray-200 border-0 font-black shadow-xl shadow-white/10 h-14 text-base"
                    >
                        Cash Out Funds
                    </Button>
                </div>
                {profile.monetizationFrozen && (
                    <span className="text-[10px] text-error mt-4 flex items-center gap-1 bg-error/10 px-2 py-1 rounded">
                        <Activity size={10} /> Monetization Frozen
                    </span>
                )}
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            {[
                { icon: Eye, label: 'Views', value: formatCompactNumber(totalViews), color: 'text-primary', bg: 'bg-primary/10' },
                { icon: MousePointerClick, label: 'Clicks', value: formatCompactNumber(totalClicks), color: 'text-secondary', bg: 'bg-secondary/10' },
                { icon: TrendingUp, label: 'CTR', value: `${(totalClicks/Math.max(1, totalViews)*100).toFixed(1)}%`, color: 'text-success', bg: 'bg-success/10' }
            ].map((stat, i) => (
                <div key={i} className="bg-dark-light p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                    <div className={`absolute inset-0 ${stat.bg} opacity-20`}></div>
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} mb-2 relative z-10`}><stat.icon size={18} /></div>
                    <div className="text-xl font-black text-white relative z-10">{stat.value}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase relative z-10">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* Analytics Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg text-white">Analytics</h3>
                <div className="flex bg-dark-light rounded-xl p-1 border border-white/5">
                    <button onClick={() => setTimeRange('7d')} className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold ${timeRange === '7d' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>7D</button>
                    <button onClick={() => setTimeRange('30d')} className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold ${timeRange === '30d' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>30D</button>
                </div>
            </div>

            {/* Revenue Area Chart */}
            <div className="bg-dark-light p-5 rounded-[2rem] border border-white/5 shadow-lg relative">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary/20 rounded-lg">
                            <DollarSign size={14} className="text-secondary" />
                        </div>
                        <span className="text-sm font-bold text-gray-300">Revenue Trend</span>
                    </div>
                </div>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FF6584" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#FF6584" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} dy={10} minTickGap={20} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1A1A2E', borderColor: '#ffffff20', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'}}
                                cursor={{stroke: '#ffffff20', strokeDasharray: '4 4'}}
                                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Est. Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#FF6584" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Views Bar Chart */}
            <div className="bg-dark-light p-5 rounded-[2rem] border border-white/5 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                        <Eye size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold text-gray-300">Daily Views</span>
                </div>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#6b7280'}} dy={10} minTickGap={20} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1A1A2E', borderColor: '#ffffff20', borderRadius: '16px', fontSize: '12px'}}
                                cursor={{fill: '#ffffff05'}}
                            />
                            <Bar dataKey="views" fill="#6C63FF" radius={[4, 4, 4, 4]} barSize={timeRange === '7d' ? 20 : 8} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3 pt-2">
             <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg text-white">History</h3>
                <button onClick={() => {}} className="text-xs text-primary font-bold">View All</button>
            </div>
            
            {userWithdrawals.length > 0 ? (
                <div className="bg-dark-light rounded-[1.5rem] border border-white/5 overflow-hidden">
                    {userWithdrawals.map((tx) => (
                        <div key={tx.id} className="p-4 border-b border-white/5 last:border-0 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'paid' ? 'bg-success/10 text-success' : tx.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>
                                    {tx.status === 'paid' ? <ArrowUpRight size={18} /> : <Activity size={18} />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white capitalize">{tx.method}</div>
                                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(tx.timestamp).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-black text-white text-sm">${tx.amount.toFixed(2)}</div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'paid' ? 'text-success' : tx.status === 'rejected' ? 'text-error' : 'text-warning'}`}>
                                    {tx.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 bg-dark-light rounded-3xl border border-white/5 text-gray-500 text-xs">
                    No withdrawal history yet.
                </div>
            )}
        </div>
    </div>
  );
}