import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createGroup } from '../lib/firestore';
import { CATEGORIES, Category } from '../lib/types';
import Button from '../components/ui/Button';
import { ChevronLeft, Hash, Link as LinkIcon, Layers, DollarSign, Lock, Globe } from 'lucide-react';

export default function AddGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inviteLink: '',
    category: 'Technology' as Category,
    tags: '',
    accessType: 'Free' as 'Free' | 'Paid',
    price: ''
  });

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.inviteLink.includes('chat.whatsapp.com')) {
        alert('Please provide a valid WhatsApp invite link');
        setLoading(false);
        return;
      }

      await createGroup({
        name: formData.name,
        description: formData.description,
        inviteLink: formData.inviteLink,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        accessType: formData.accessType,
        price: formData.accessType === 'Paid' ? parseFloat(formData.price) : 0
      }, user.uid);
      
      navigate('/my-groups');
    } catch (error) {
      console.error(error);
      alert('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-bold">Add New Group</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Basic Info */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Group Name</label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Layers size={18} /></div>
             <input
              required
              type="text"
              placeholder="e.g. React Developers"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                type="button"
                key={cat}
                onClick={() => setFormData({...formData, category: cat})}
                className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                  formData.category === cat 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-dark-light border-white/5 text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Monetization Section */}
        <div className="bg-dark-light/50 p-4 rounded-xl border border-white/5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <DollarSign size={16} className="text-success" /> Monetization
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, accessType: 'Free'})}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        formData.accessType === 'Free' 
                        ? 'bg-primary/20 border-primary text-white' 
                        : 'bg-dark border-white/10 text-gray-400'
                    }`}
                >
                    <Globe size={20} />
                    <span className="text-xs font-bold">Free Access</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, accessType: 'Paid'})}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        formData.accessType === 'Paid' 
                        ? 'bg-success/20 border-success text-white' 
                        : 'bg-dark border-white/10 text-gray-400'
                    }`}
                >
                    <Lock size={20} />
                    <span className="text-xs font-bold">Paid Entry</span>
                </button>
            </div>

            {formData.accessType === 'Paid' && (
                 <div className="space-y-1 animate-fade-in">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Entry Price (USD)</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-success font-bold">$</div>
                        <input
                            required
                            type="number"
                            min="1"
                            placeholder="5.00"
                            className="w-full bg-dark border border-white/10 rounded-xl h-12 pl-8 pr-4 text-sm focus:outline-none focus:border-success/50 text-white placeholder:text-gray-600"
                            value={formData.price}
                            onChange={e => setFormData({...formData, price: e.target.value})}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 ml-1">ConnectSphere takes a 5% platform fee.</p>
                </div>
            )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Invite Link</label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={18} /></div>
             <input
              required
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600"
              value={formData.inviteLink}
              onChange={e => setFormData({...formData, inviteLink: e.target.value})}
            />
          </div>
          <p className="text-[10px] text-gray-500 ml-1">Must be a valid WhatsApp invite URL.</p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tags</label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Hash size={18} /></div>
             <input
              type="text"
              placeholder="tech, coding, community (comma separated)"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Description</label>
          <textarea
            required
            rows={4}
            placeholder="Tell people what your group is about..."
            className="w-full bg-dark-light border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600 resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" fullWidth size="lg" isLoading={loading}>
            Create Group
          </Button>
        </div>
      </form>
    </div>
  );
}