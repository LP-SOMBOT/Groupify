import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRealtimeGroups } from '../hooks/useRealtime';
import GroupCard from '../components/groups/GroupCard';
import { Flame, TrendingUp, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { groups: featuredGroups, loading } = useRealtimeGroups();

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome / Hero */}
      <section className="mt-2">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Hello, {user?.displayName?.split(' ')[0] || 'Guest'} 👋
        </h1>
        <p className="text-sm text-gray-400">Discover the best communities today.</p>
        
        <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-primary to-primary-light relative overflow-hidden shadow-lg shadow-primary/20">
           <div className="relative z-10">
             <h2 className="text-white font-bold text-lg mb-1">Share Your Group</h2>
             <p className="text-white/80 text-xs mb-3 max-w-[70%]">Grow your community by listing it on ConnectSphere.</p>
             <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white text-primary hover:bg-gray-100 font-bold border-0"
                onClick={() => navigate('/add-group')}
             >
               <Plus size={16} className="mr-1" /> Add Group
             </Button>
           </div>
           {/* Decorative circles */}
           <div className="absolute -right-4 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
           <div className="absolute right-10 top-0 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
             <div className="p-1.5 bg-secondary/10 rounded-lg text-secondary">
               <Flame size={18} />
             </div>
             <h2 className="font-bold text-lg">Trending Now</h2>
          </div>
          <button onClick={() => navigate('/explore')} className="text-xs text-primary font-medium">View All</button>
        </div>
        
        {loading ? (
           <div className="space-y-3">
             {[1,2,3].map(i => <div key={i} className="h-24 bg-dark-light rounded-2xl animate-pulse" />)}
           </div>
        ) : featuredGroups.length > 0 ? (
          <div className="space-y-3">
            {featuredGroups.slice(0, 5).map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm bg-dark-light rounded-xl border border-white/5">
            No groups found. Be the first to add one!
          </div>
        )}
      </section>
      
      {/* Recommended Section */}
      {featuredGroups.length > 5 && (
        <section className="pb-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-success/10 rounded-lg text-success">
                 <TrendingUp size={18} />
               </div>
               <h2 className="font-bold text-lg">New & Rising</h2>
            </div>
          </div>
          
           <div className="space-y-3">
            {featuredGroups.slice(5, 8).map(group => (
              <GroupCard key={`rising-${group.id}`} group={group} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}