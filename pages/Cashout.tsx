import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ChevronLeft, Wallet, History, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentMethod } from '../lib/types';
import { requestWithdrawal } from '../lib/db';

export default function Cashout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('EVC Plus');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');

  if (!user || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > profile.balance) {
        alert("Insufficient balance.");
        setLoading(false);
        return;
    }

    if (profile.paymentPin && profile.paymentPin !== pin) {
        alert("Invalid PIN.");
        setLoading(false);
        return;
    }

    try {
        await requestWithdrawal(user.uid, user.displayName || 'User', withdrawAmount, method, number);
        alert("Withdrawal requested successfully.");
        navigate('/dashboard');
    } catch (e) {
        alert("Error requesting withdrawal.");
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
            <h1 className="text-xl font-bold">Cash Out</h1>
        </div>

        <div className="bg-dark-light rounded-2xl p-6 border border-white/5 mb-6">
            <div className="text-gray-400 text-xs font-bold uppercase mb-1">Current Balance</div>
            <div className="text-3xl font-bold text-white">${profile.balance.toFixed(2)}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                    {['EVC Plus', 'Zaad', 'Sahal'].map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMethod(m as PaymentMethod)}
                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${method === m ? 'bg-primary border-primary text-white' : 'bg-dark border-white/10 text-gray-400'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Mobile Number</label>
                <input 
                    required
                    type="tel"
                    className="w-full bg-dark border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none"
                    placeholder="e.g. 61xxxxxxx"
                    value={number}
                    onChange={e => setNumber(e.target.value)}
                />
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Amount ($)</label>
                <input 
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full bg-dark border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Security PIN</label>
                <input 
                    required
                    type="password"
                    maxLength={4}
                    className="w-full bg-dark border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none tracking-widest text-center"
                    placeholder="****"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                />
                {!profile.paymentPin && <p className="text-[10px] text-warning mt-1">Note: You haven't set a PIN yet. Please set one in Settings, or use '0000' if this is a demo.</p>}
             </div>

             <Button fullWidth size="lg" isLoading={loading} className="mt-4">
                Confirm Withdrawal
             </Button>
        </form>
    </div>
  );
}