import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { ChevronLeft, Wallet, History, AlertCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PaymentMethod } from '../lib/types';
import { requestWithdrawal } from '../lib/db';
import { usePaymentMethods } from '../hooks/useRealtime';
import { useToast } from '../context/ToastContext';

export default function Cashout() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { methods, loading: methodsLoading } = usePaymentMethods(); // New Hook usage
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<string>('');
  const [number, setNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');

  if (!user || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > (profile.balance || 0)) {
        showToast("Insufficient balance.", "error");
        setLoading(false);
        return;
    }

    if (withdrawAmount < 1) {
        showToast("Minimum withdrawal is $1.00", "error");
        setLoading(false);
        return;
    }

    if (profile.paymentPin && profile.paymentPin !== pin) {
        showToast("Invalid PIN.", "error");
        setLoading(false);
        return;
    }
    
    if (!method) {
        showToast("Please select a withdrawal method", "error");
        setLoading(false);
        return;
    }

    try {
        await requestWithdrawal(user.uid, user.displayName || 'User', withdrawAmount, method, number);
        showToast("Withdrawal requested successfully!", "success");
        navigate('/dashboard');
    } catch (e) {
        showToast("Error processing request.", "error");
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

        <div className="bg-gradient-to-r from-dark-light to-dark rounded-2xl p-6 border border-white/5 mb-6 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 p-4"><Wallet size={64}/></div>
            <div className="text-gray-400 text-xs font-bold uppercase mb-1">Current Balance</div>
            <div className="text-3xl font-bold text-white">${(profile.balance || 0).toFixed(2)}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Withdrawal Method</label>
                {methodsLoading ? (
                    <div className="p-4 border border-white/10 rounded-xl text-center text-sm text-gray-500">
                        Loading methods...
                    </div>
                ) : methods.length === 0 ? (
                    <div className="p-4 border border-white/10 rounded-xl text-center text-sm text-gray-500">
                        No withdrawal methods available.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {methods.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setMethod(m.name)}
                                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${method === m.name ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-dark-light border-white/5 text-gray-400 hover:bg-white/5'}`}
                            >
                                <div className="font-bold text-xs">{m.name}</div>
                                <div className="text-[10px] opacity-70 truncate">{m.provider}</div>
                                {method === m.name && <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full m-1 animate-pulse"></div>}
                            </button>
                        ))}
                    </div>
                )}
             </div>

             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Account Number</label>
                <input 
                    required
                    type="tel"
                    className="w-full bg-dark-light border border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none text-white transition-all"
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
                    className="w-full bg-dark-light border border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none text-white transition-all"
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
                    className="w-full bg-dark-light border border-white/10 rounded-xl p-4 focus:border-primary focus:outline-none tracking-widest text-center text-white"
                    placeholder="****"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                />
                {!profile.paymentPin && (
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-warning bg-warning/10 p-2 rounded-lg">
                        <AlertCircle size={12} />
                        You haven't set a PIN. Please go to Settings.
                    </div>
                )}
             </div>

             <Button fullWidth size="lg" isLoading={loading} className="mt-4 shadow-xl">
                Confirm Withdrawal
             </Button>
        </form>
    </div>
  );
}