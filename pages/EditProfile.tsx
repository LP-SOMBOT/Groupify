import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../lib/db';
import { updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function EditProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.displayName || user?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    // Update Firebase Auth
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
    }

    // Update Realtime DB
    await updateUserProfile(user.uid, { bio, displayName: name });
    setLoading(false);
    navigate(-1);
  };

  return (
    <div className="pb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ChevronLeft />
            </button>
            <h1 className="text-xl font-bold">Edit Profile</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Display Name</label>
                <input 
                    className="w-full bg-dark-light border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none"
                    placeholder="Your Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
             </div>
             
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Bio</label>
                <textarea 
                    className="w-full bg-dark-light border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none h-32 resize-none"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                />
             </div>
             <Button fullWidth isLoading={loading}>Save Changes</Button>
        </form>
    </div>
  );
}