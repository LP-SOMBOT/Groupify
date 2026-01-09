import React, { useMemo, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeGroups, useRealtimeWithdrawals } from '../hooks/useRealtime';
import Button from '../components/ui/Button';
import { ChevronLeft, TrendingUp, Wallet, MousePointerClick, Eye, Sparkles, Activity, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompactNumber } from '../lib/utils';

// --- Modern Interactive Chart Components ---

interface ChartProps {
  data: any[];
  dataKey: string;
  color?: string;
  labelKey?: string;
  valuePrefix?: string;
}

const ModernAreaChart = ({ data, dataKey, color = '#FF6584', labelKey = 'name', valuePrefix = '' }: ChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return null;
  
  const values = data.map(d => Number(d[dataKey]));
  const maxVal = Math.max(...values) || 1;
  const minVal = 0; // Baseline

  // Generate path points
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const val = Number(d[dataKey]);
    const y = 100 - ((val - minVal) / (maxVal - minVal)) * 80; // 80% height usage, 20% padding top
    return `${x},${y}`;
  }).join(' ');

  const fillPath = `0,100 ${points} 100,100`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const index = Math.min(Math.max(Math.round((x / width) * (data.length - 1)), 0), data.length - 1);
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Active point coordinates
  const activeX = activeIndex !== null ? (activeIndex / (data.length - 1)) * 100 : 0;
  const activeVal = activeIndex !== null ? Number(data[activeIndex][dataKey]) : 0;
  const activeY = 100 - ((activeVal - minVal) / (maxVal - minVal)) * 80;

  return (
    <div 
      className="w-full h-full relative group cursor-crosshair select-none" 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={(e) => {
         const touch = e.touches[0];
         if (!containerRef.current) return;
         const rect = containerRef.current.getBoundingClientRect();
         const x = touch.clientX - rect.left;
         const width = rect.width;
         const index = Math.min(Math.max(Math.round((x / width) * (data.length - 1)), 0), data.length - 1);
         setActiveIndex(index);
      }}
    >
       <div className="absolute inset-0 top-0 bottom-6">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>
              <line x1="0" y1="60" x2="100" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" vectorEffect="non-scaling-stroke"/>
              
              {/* Area Fill */}
              <polygon points={fillPath} fill={`url(#gradient-${dataKey})`} />
              
              {/* Line */}
              <polyline 
                points={points} 
                fill="none" 
                stroke={color} 
                strokeWidth="2.5" 
                vectorEffect="non-scaling-stroke" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                filter="url(#glow)"
              />

              {/* Active Indicator Line */}
              {activeIndex !== null && (
                 <line 
                   x1={activeX} y1="0" 
                   x2={activeX} y2="100" 
                   stroke="rgba(255,255,255,0.2)" 
                   strokeWidth="1" 
                   strokeDasharray="2 2"
                   vectorEffect="non-scaling-stroke"
                 />
              )}
              
              {/* Active Dot */}
              {activeIndex !== null && (
                <circle 
                  cx={activeX} 
                  cy={activeY} 
                  r="4" 
                  fill={color} 
                  stroke="white" 
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              )}
          </svg>
       </div>

       {/* Tooltip Overlay */}
       {activeIndex !== null && (
          <div 
             className="absolute top-0 pointer-events-none z-10 bg-dark-light/90 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-xl text-center min-w-[80px] transition-all duration-75"
             style={{ 
               left: `${activeX}%`, 
               transform: `translateX(-50%) translateY(-120%)`,
               top: `${activeY}%`
             }}
          >
             <div className="text-[10px] text-gray-400 font-bold mb-0.5">{data[activeIndex][labelKey]}</div>
             <div className="text-sm font-black text-white" style={{ color: color }}>
                {valuePrefix}{data[activeIndex][dataKey].toFixed(2)}
             </div>
          </div>
       )}

       {/* X Axis Labels */}
       <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
          {data.map((d, i) => {
             const showLabel = i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;
             return (
                 <span key={i} className={showLabel ? 'opacity-100' : 'opacity-0 w-0'}>{d[labelKey]}</span>
             );
          })}
       </div>
    </div>
  );
};

const ModernBarChart = ({ data, dataKey, color = '#6C63FF', labelKey = 'name', valuePrefix = '' }: ChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  if (!data || data.length === 0) return null;
  const values = data.map(d => Number(d[dataKey]));
  const maxVal = Math.max(...values) || 1;

  return (
    <div className="w-full h-full flex flex-col justify-end relative">
        <div className="flex-1 flex items-end justify-between gap-1 relative z-10">
            {data.map((d, i) => {
                const val = Number(d[dataKey]);
                const height = Math.max((val / maxVal) * 100, 4); // Min height 4%
                const isActive = activeIndex === i;

                return (
                    <div 
                        key={i} 
                        className="flex-1 h-full flex flex-col justify-end group relative"
                        onMouseEnter={() => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onTouchStart={() => setActiveIndex(i)}
                    >
                        {/* Bar */}
                        <div 
                            className="w-full rounded-t-sm transition-all duration-300 relative"
                            style={{ 
                                height: `${height}%`, 
                                backgroundColor: isActive ? color : `${color}80`, // 50% opacity if not active
                                transform: isActive ? 'scaleY(1.02)' : 'scaleY(1)',
                                transformOrigin: 'bottom'
                            }}
                        >
                            {/* Top shine */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30 rounded-full" />
                        </div>
                        
                        {/* Tooltip */}
                        {isActive && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-dark-light/90 backdrop-blur border border-white/10 p-2 rounded-lg shadow-xl text-center min-w-[60px] z-20 pointer-events-none">
                                <div className="text-[9px] text-gray-400 font-bold">{d[labelKey]}</div>
                                <div className="text-xs font-black text-white" style={{color}}>
                                    {valuePrefix}{val}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
        
        {/* X Axis */}
        <div className="flex justify-between mt-2 text-[9px] text-gray-500 font-bold uppercase px-1">
          {data.map((d, i) => {
             const showLabel = i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;
             return (
                 <span key={i} className={showLabel ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden text-center'}>{d[labelKey]}</span>
             );
          })}
       </div>
    </div>
  )
}

// --- Main Component ---

export default function CreatorDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { groups } = useRealtimeGroups(undefined, user?.uid, false);
  const { withdrawals } = useRealtimeWithdrawals();
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  
  if (!profile || !profile.isCreator) return null; 
  
  // Stats Calculation
  const totalViews = groups.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = groups.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  
  // Memoized Data Generator
  const chartData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : 30;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseFactor = isWeekend ? 0.6 : 1.0;
      const pseudoRandom = Math.sin(date.getDate() * 12345) * 0.5 + 0.5;
      
      const avgViewsPerDay = totalViews / Math.max(days, 1);
      const dailyViews = Math.floor(avgViewsPerDay * baseFactor * (0.5 + pseudoRandom));
      const v = Math.max(0, dailyViews);
      const c = Math.floor(v * 0.08); 
      const r = (c * 0.05) + (v * 0.002);
      
      data.push({ name: dayName, views: v, clicks: c, revenue: r });
    }
    return data;
  }, [timeRange, totalViews]);

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
        </div>

        {/* Updated Revenue Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] p-8 bg-[#1A1A2E] border border-white/5 shadow-2xl relative group">
             {/* Glow effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-success/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-6 opacity-70">
                    <Wallet size={16} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-300 tracking-widest uppercase">Available Balance</span>
                </div>
                
                <h2 className="text-6xl sm:text-7xl font-black text-[#4CAF50] mb-10 tracking-tighter flex items-start justify-center gap-1 drop-shadow-lg">
                    <span className="text-3xl sm:text-4xl opacity-50 mt-2">$</span>
                    {(profile.balance || 0).toFixed(2)}
                </h2>
                
                <div className="w-full max-w-xs">
                    <Button 
                        size="lg"
                        disabled={profile.monetizationFrozen || (profile.balance < 1)}
                        onClick={() => navigate('/cashout')}
                        className="w-full bg-white text-dark hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all border-0 font-black h-16 text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 rounded-2xl"
                    >
                        <span>Cash Out Funds</span>
                        <div className="bg-dark text-white p-1.5 rounded-full">
                           <ArrowUpRight size={14} strokeWidth={4} />
                        </div>
                    </Button>
                </div>
                {profile.monetizationFrozen && (
                    <span className="text-[10px] text-error mt-6 flex items-center gap-1 bg-error/10 px-3 py-1.5 rounded-full border border-error/20 font-bold">
                        <Activity size={12} /> Monetization Frozen
                    </span>
                )}
            </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
            {[
                { icon: Eye, label: 'Views', value: formatCompactNumber(totalViews), color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                { icon: MousePointerClick, label: 'Clicks', value: formatCompactNumber(totalClicks), color: 'text-secondary', bg: 'bg-secondary/10', border: 'border-secondary/20' },
                { icon: TrendingUp, label: 'CTR', value: `${(totalClicks/Math.max(1, totalViews)*100).toFixed(1)}%`, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' }
            ].map((stat, i) => (
                <div key={i} className={`bg-dark-light p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-white/20 transition-all`}>
                    <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} mb-2 relative z-10 ring-1 ring-inset ${stat.border}`}><stat.icon size={18} /></div>
                    <div className="text-xl font-black text-white relative z-10">{stat.value}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase relative z-10">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* Analytics Section */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg text-white flex items-center gap-2"><Activity size={18} className="text-primary"/> Analytics</h3>
                <div className="flex bg-dark-light rounded-xl p-1 border border-white/5">
                    <button onClick={() => setTimeRange('7d')} className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold ${timeRange === '7d' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-500 hover:text-white'}`}>7 Days</button>
                    <button onClick={() => setTimeRange('30d')} className={`text-[10px] px-3 py-1.5 rounded-lg transition-all font-bold ${timeRange === '30d' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-500 hover:text-white'}`}>30 Days</button>
                </div>
            </div>

            {/* Revenue Area Chart */}
            <div className="bg-dark-light p-5 rounded-[2rem] border border-white/5 shadow-lg relative group hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-secondary/20 rounded-lg text-secondary ring-1 ring-secondary/30">
                            <DollarSign size={14} />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white block">Revenue</span>
                            <span className="text-[10px] text-gray-500">Estimated Earnings</span>
                        </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xl font-black text-secondary">${chartData.reduce((a,b) => a + b.revenue, 0).toFixed(2)}</span>
                    </div>
                </div>
                <div className="h-56 w-full -mx-2 px-2">
                    <ModernAreaChart data={chartData} dataKey="revenue" color="#FF6584" valuePrefix="$" />
                </div>
            </div>

            {/* Views Bar Chart */}
            <div className="bg-dark-light p-5 rounded-[2rem] border border-white/5 shadow-lg relative group hover:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-1.5 bg-primary/20 rounded-lg text-primary ring-1 ring-primary/30">
                        <Eye size={14} />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-white block">Traffic</span>
                        <span className="text-[10px] text-gray-500">Daily Unique Views</span>
                    </div>
                </div>
                <div className="h-48 w-full">
                    <ModernBarChart data={chartData} dataKey="views" color="#6C63FF" />
                </div>
            </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3 pt-2">
             <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-lg text-white">History</h3>
                <button onClick={() => navigate('/history')} className="text-xs text-primary font-bold hover:text-primary-light transition-colors">View All</button>
            </div>
            
            {userWithdrawals.length > 0 ? (
                <div className="bg-dark-light rounded-[1.5rem] border border-white/5 overflow-hidden">
                    {userWithdrawals.map((tx) => (
                        <div key={tx.id} className="p-4 border-b border-white/5 last:border-0 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${tx.status === 'paid' ? 'bg-success/10 text-success' : tx.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'}`}>
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