import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { CATEGORIES } from '../lib/types';
import { fetchGroups } from '../lib/firestore';
import GroupCard from '../components/groups/GroupCard';
import { cn } from '../lib/utils';
import { Group } from '../lib/types';

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchGroups(activeCategory);
      setGroups(data);
      setLoading(false);
    }
    load();
  }, [activeCategory]);

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="sticky top-0 bg-dark z-30 pb-2 pt-1">
        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search groups, interests..."
            className="w-full bg-dark-light border border-white/5 rounded-xl h-12 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-lg text-gray-400">
            <Filter size={18} />
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => setActiveCategory('All')}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border transition-all",
              activeCategory === 'All'
                ? "bg-primary border-primary text-white"
                : "bg-transparent border-white/10 text-gray-400 hover:border-white/30"
            )}
          >
            All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border transition-all",
                activeCategory === cat
                  ? "bg-primary border-primary text-white"
                  : "bg-transparent border-white/10 text-gray-400 hover:border-white/30"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3 pb-6 min-h-[50vh]">
        {loading ? (
           [1,2,3,4].map(i => <div key={i} className="h-24 bg-dark-light rounded-2xl animate-pulse" />)
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-gray-500">
             <p>No groups found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}