import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Layers, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserGroups } from '../lib/firestore';
import { Group } from '../lib/types';
import GroupCard from '../components/groups/GroupCard';

export default function MyGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await fetchUserGroups(user.uid);
        setGroups(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // Loading State
  if (loading) {
      return (
          <div className="flex justify-center pt-20">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      )
  }

  // Empty State
  if (groups.length === 0) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-dark-light rounded-full flex items-center justify-center mb-6 relative">
          <Layers size={32} className="text-gray-500" />
          <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1.5 border-2 border-dark">
            <PlusCircle size={16} className="text-white" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">No Groups Yet</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-xs">
          You haven't listed any WhatsApp groups yet. Share your community with the world!
        </p>
        
        <Button className="w-full max-w-xs gap-2" onClick={() => navigate('/add-group')}>
          <PlusCircle size={18} />
          Create Listing
        </Button>
      </div>
    );
  }

  // List State
  return (
      <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-lg">My Listings</h2>
              <Button size="sm" onClick={() => navigate('/add-group')}>
                  <PlusCircle size={16} className="mr-1"/> Add New
              </Button>
          </div>
          <div className="space-y-3">
              {groups.map(group => (
                  <GroupCard key={group.id} group={group} />
              ))}
          </div>
      </div>
  )
}