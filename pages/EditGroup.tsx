import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateGroup } from '../lib/db';
import { CATEGORIES, Category } from '../lib/types';
import Button from '../components/ui/Button';
import { ChevronLeft, Hash, Link as LinkIcon, Layers, Info, ImagePlus, Users } from 'lucide-react';
import { useRealtimeGroups } from '../hooks/useRealtime';

export default function EditGroup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { groups } = useRealtimeGroups(undefined, user?.uid, false); // Fetch my groups
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

  useEffect(() => {
      if (groups.length > 0 && id) {
          const group = groups.find(g => g.id === id);
          if (group) {
              setFormData({
                  name: group.name,
                  description: group.description,
                  inviteLink: group.inviteLink,
                  category: group.category as Category,
                  tags: group.tags.join(', '),
                  memberCount: group.memberCount.toString(),
                  iconUrl: group.iconUrl || ''
              });
              setImagePreview(group.iconUrl || null);
          }
      }
  }, [groups, id]);

  if (!user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
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
    if(!id) return;

    setLoading(true);
    try {
      await updateGroup(id, {
        name: formData.name,
        description: formData.description,
        inviteLink: formData.inviteLink,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        iconUrl: formData.iconUrl,
        memberCount: parseInt(formData.memberCount) || 1
      });
      
      alert("Group updated!");
      navigate('/my-groups');
    } catch (error) {
      console.error(error);
      alert('Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-10 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
          <ChevronLeft />
        </button>
        <h1 className="text-xl font-bold">Edit Group</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
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
            </label>
        </div>

        {/* Basic Info */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Group Name</label>
          <input
              required
              type="text"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-primary/50 text-white"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
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
          <input
              required
              type="number"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-primary/50 text-white"
              value={formData.memberCount}
              onChange={e => setFormData({...formData, memberCount: e.target.value})}
            />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Invite Link</label>
          <input
              required
              type="url"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-primary/50 text-white"
              value={formData.inviteLink}
              onChange={e => setFormData({...formData, inviteLink: e.target.value})}
            />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Tags</label>
          <input
              type="text"
              className="w-full bg-dark-light border border-white/10 rounded-xl h-12 px-4 text-sm focus:outline-none focus:border-primary/50 text-white"
              value={formData.tags}
              onChange={e => setFormData({...formData, tags: e.target.value})}
            />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Description</label>
          <textarea
            required
            rows={4}
            className="w-full bg-dark-light border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary/50 text-white resize-none"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" fullWidth size="lg" isLoading={loading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}