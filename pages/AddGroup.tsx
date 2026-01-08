import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createGroup } from '../lib/db';
import { CATEGORIES, Category } from '../lib/types';
import Button from '../components/ui/Button';
import { ChevronLeft, Hash, Link as LinkIcon, Layers, Info, ImagePlus, Users } from 'lucide-react';

export default function AddGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inviteLink: '',
    category: 'Technology' as Category,
    tags: '',
    memberCount: '',
    iconUrl: ''
  });

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
          alert("Image size should be less than 2MB");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, iconUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

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
        iconUrl: formData.iconUrl,
        memberCount: parseInt(formData.memberCount) || 1
      }, user.uid);
      
      alert("Group submitted! It will be visible after Admin approval.");
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
        
        {/* Image Upload */}
        <div className="flex justify-center">
            <label className="relative cursor-pointer group">
                <div className={`w-24 h-24 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden bg-dark-light ${!imagePreview ? 'hover:border-primary/50' : 'border-primary'}`}>
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <ImagePlus className="text-gray-400 group-hover:text-primary transition-colors" size={32} />
                    )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="text-center mt-2 text-xs text-gray-400">Add Group Icon</div>
            </label>
        </div>

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
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Total Members</label>
          <div className="relative">
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><Users size={18} /></div>
             <input
              required
              type="number"
              min="1"
              placeholder="e.g. 250"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600"
              value={formData.memberCount}
              onChange={e => setFormData({...formData, memberCount: e.target.value})}
            />
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-3">
            <Info className="text-primary shrink-0" size={20} />
            <p className="text-xs text-gray-300">
                <span className="font-bold text-white">Approval Required:</span> Your group will be submitted for review. It must be approved by an admin before it appears in Explore.
            </p>
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
            Submit for Review
          </Button>
        </div>
      </form>
    </div>
  );
}