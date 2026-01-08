import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../lib/db';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
        await updateUserProfile(user.uid, { paymentPin: pin });
        showToast('Security PIN saved successfully', 'success');
        navigate(-1);
    } catch (e) {
        showToast('Failed to save PIN', 'error');
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
            <h1 className="text-xl font-bold">Settings</h1>
        </div>

        <form onSubmit={handleSave} className="bg-dark-light p-6 rounded-2xl border border-white/5 space-y-4">
            <h2 className="font-bold flex items-center gap-2 text-white"><Lock size={18} className="text-primary"/> Payment Security</h2>
            <p className="text-xs text-gray-400">Set a 4-digit PIN for withdrawals. You will need this to cash out your earnings.</p>
            
            <input 
                type="password"
                maxLength={4}
                required
                className="w-full bg-dark border border-white/10 rounded-xl p-3 text-center tracking-widest text-lg focus:border-primary focus:outline-none text-white"
                placeholder="****"
                value={pin}
                onChange={e => setPin(e.target.value)}
            />
            
            <Button fullWidth isLoading={loading}>Save PIN</Button>
        </form>
    </div>
  );
}