import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../lib/db';

export default function Settings() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    await updateUserProfile(user.uid, { paymentPin: pin });
    setLoading(false);
    alert('PIN Saved');
    navigate(-1);
  };

  return (
    <div className="pb-10 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
            <ChevronLeft />
            </button>
            <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <form onSubmit={handleSave} className="bg-dark-light p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="font-bold flex items-center gap-2"><Lock size={18} /> Payment Security</h2>
            <p className="text-xs text-gray-400">Set a 4-digit PIN for withdrawals.</p>
            
            <input 
                type="password"
                maxLength={4}
                required
                className="w-full bg-dark border border-white/10 rounded-xl p-3 text-center tracking-widest text-lg focus:border-primary focus:outline-none"
                placeholder="****"
                value={pin}
                onChange={e => setPin(e.target.value)}
            />
            
            <Button fullWidth isLoading={loading}>Save PIN</Button>
        </form>
    </div>
  );
}