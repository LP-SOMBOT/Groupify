import React, { useState } from 'react';
import { 
    updateGroupStatus, 
    deleteGroup, 
    createBroadcastNotification, 
    adminAdjustBalance, 
    adminUpdateUser,
    processWithdrawal
} from '../lib/db';
import { useAdminRealtimeGroups, useRealtimeUsers, useRealtimeWithdrawals } from '../hooks/useRealtime';
import { Group, UserProfile, WithdrawalRequest } from '../lib/types';
import Button from '../components/ui/Button';
import { Shield, Trash2, CheckCircle, RefreshCw, LogOut, Search, BellRing, Send, User, XCircle, DollarSign, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const { groups, loading: groupsLoading } = useAdminRealtimeGroups();
    const { users } = useRealtimeUsers();
    const { withdrawals } = useRealtimeWithdrawals();

    const [filter, setFilter] = useState('');
    const [view, setView] = useState<'groups' | 'users' | 'withdrawals' | 'notify'>('groups');
    const navigate = useNavigate();

    // Notification Form
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMsg, setNotifMsg] = useState('');
    const [notifType, setNotifType] = useState<'system' | 'update' | 'alert'>('system');

    // User Edit State
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [balanceAdj, setBalanceAdj] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '1234') {
            setIsAuthenticated(true);
        } else {
            alert('Invalid PIN');
            setPin('');
        }
    }

    // --- Actions ---

    const handleGroupStatus = async (group: Group, status: 'approved' | 'rejected') => {
        if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} "${group.name}"?`)) return;
        try {
            await updateGroupStatus(group.id, status, group.createdBy, group.name);
        } catch (error) {
            console.error(error);
            alert("Action failed");
        }
    }

    const handleUserAction = async (uid: string, action: 'ban' | 'freeze') => {
        const user = users.find(u => u.uid === uid);
        if (!user) return;
        if(action === 'ban') await adminUpdateUser(uid, { isBanned: !user.isBanned });
        if(action === 'freeze') await adminUpdateUser(uid, { monetizationFrozen: !user.monetizationFrozen });
    }

    const handleAddMoney = async (uid: string) => {
        const amount = parseFloat(balanceAdj);
        if(isNaN(amount)) return;
        await adminAdjustBalance(uid, amount);
        setBalanceAdj('');
        setEditingUser(null);
    }

    const handleWithdrawal = async (req: WithdrawalRequest, action: 'paid' | 'rejected') => {
        if(!confirm(`Mark as ${action}?`)) return;
        await processWithdrawal(req.id, action, req.userId, req.amount);
    }

    // --- Renders ---

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xs bg-dark-light p-8 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="flex justify-center mb-6 text-error animate-pulse">
                        <Shield size={48} />
                    </div>
                    <h1 className="text-xl font-bold text-center mb-2">Restricted Area</h1>
                    <p className="text-gray-500 text-center text-xs mb-6">Super Admin Access Only</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest text-lg focus:border-error outline-none text-white"
                            autoFocus
                        />
                        <Button fullWidth variant="danger" type="submit">Access Control</Button>
                    </form>
                    <button onClick={() => navigate('/')} className="w-full mt-6 text-xs text-gray-500 hover:text-white">← Back to App</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark pb-20 font-sans text-gray-100">
            <div className="bg-dark-light border-b border-white/5 p-4 sticky top-0 z-20 flex justify-between items-center shadow-md">
                <h1 className="font-bold text-lg flex items-center gap-2 text-error">
                    <Shield size={20} fill="currentColor" className="text-error/20" /> Super Admin
                </h1>
                <button onClick={() => setIsAuthenticated(false)} className="p-2 text-error"><LogOut size={20} /></button>
            </div>

            <div className="p-4 space-y-6 max-w-2xl mx-auto">
                {/* Tabs */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-dark-light rounded-xl border border-white/5">
                  {['groups', 'users', 'withdrawals', 'notify'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setView(t as any)}
                        className={`py-2 text-[10px] font-bold uppercase rounded-lg transition-all ${view === t ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        {t}
                      </button>
                  ))}
                </div>

                {view === 'groups' && (
                    <div className="space-y-3">
                        <input type="text" placeholder="Search..." className="w-full bg-dark-light border border-white/5 rounded-xl p-3 text-sm" value={filter} onChange={e => setFilter(e.target.value)} />
                        {groups.filter(g => g.name.toLowerCase().includes(filter.toLowerCase())).map(group => (
                            <div key={group.id} className="bg-dark-light p-3 rounded-2xl border border-white/5 flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <img src={group.iconUrl} className="w-10 h-10 rounded-lg object-cover" />
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{group.name}</div>
                                        <div className="text-[10px] text-gray-400">Status: <span className={group.status === 'pending' ? 'text-warning' : group.status === 'approved' ? 'text-success' : 'text-error'}>{group.status}</span></div>
                                    </div>
                                    <div className="flex gap-2">
                                        {group.status === 'pending' && (
                                            <>
                                                <button onClick={() => handleGroupStatus(group, 'approved')} className="p-2 bg-success/10 text-success rounded-lg"><CheckCircle size={18} /></button>
                                                <button onClick={() => handleGroupStatus(group, 'rejected')} className="p-2 bg-error/10 text-error rounded-lg"><XCircle size={18} /></button>
                                            </>
                                        )}
                                        <button onClick={() => window.open(group.inviteLink)} className="p-2 bg-white/5 text-white rounded-lg text-xs">View</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'users' && (
                    <div className="space-y-3">
                        {users.map(u => (
                            <div key={u.uid} className="bg-dark-light p-3 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="font-bold text-sm">{u.displayName}</div>
                                        <div className="text-[10px] text-gray-400">{u.email}</div>
                                        <div className="text-xs font-bold text-success mt-1">Bal: ${u.balance?.toFixed(2)}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleUserAction(u.uid, 'ban')} className={`px-2 py-1 rounded text-[10px] font-bold ${u.isBanned ? 'bg-error text-white' : 'bg-white/5 text-gray-400'}`}>{u.isBanned ? 'Unban' : 'Ban'}</button>
                                        <button onClick={() => handleUserAction(u.uid, 'freeze')} className={`px-2 py-1 rounded text-[10px] font-bold ${u.monetizationFrozen ? 'bg-warning text-black' : 'bg-white/5 text-gray-400'}`}>Freeze</button>
                                        <button onClick={() => setEditingUser(editingUser === u.uid ? null : u.uid)} className="px-2 py-1 bg-primary/20 text-primary rounded text-[10px] font-bold">$$</button>
                                    </div>
                                </div>
                                {editingUser === u.uid && (
                                    <div className="flex gap-2 mt-2">
                                        <input type="number" placeholder="+/- Amount" className="w-full bg-dark rounded p-2 text-xs" value={balanceAdj} onChange={e => setBalanceAdj(e.target.value)} />
                                        <Button size="sm" onClick={() => handleAddMoney(u.uid)}>Apply</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {view === 'withdrawals' && (
                    <div className="space-y-3">
                        {withdrawals.filter(w => w.status === 'pending').length === 0 && <p className="text-center text-gray-500 text-sm">No pending requests.</p>}
                        {withdrawals.filter(w => w.status === 'pending').map(w => (
                            <div key={w.id} className="bg-dark-light p-4 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">{w.userName}</span>
                                    <span className="text-success font-bold text-lg">${w.amount}</span>
                                </div>
                                <div className="text-xs text-gray-400 mb-4 bg-dark p-2 rounded">
                                    <div>Method: <span className="text-white">{w.method}</span></div>
                                    <div>Number: <span className="text-white font-mono">{w.accountNumber}</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => handleWithdrawal(w, 'paid')} className="bg-success hover:bg-success/90">Mark Paid</Button>
                                    <Button onClick={() => handleWithdrawal(w, 'rejected')} variant="danger">Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'notify' && (
                    <div className="bg-dark-light p-6 rounded-2xl border border-white/5">
                         <h2 className="text-lg font-bold mb-4">Broadcast</h2>
                         <div className="space-y-4">
                            <input className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm" placeholder="Title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
                            <textarea className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm" placeholder="Message" value={notifMsg} onChange={e => setNotifMsg(e.target.value)} />
                            <Button fullWidth onClick={(e) => {
                                e.preventDefault();
                                createBroadcastNotification(notifTitle, notifMsg, notifType);
                                alert('Sent');
                                setNotifTitle('');
                                setNotifMsg('');
                            }}>Send Broadcast</Button>
                         </div>
                    </div>
                )}
            </div>
        </div>
    )
}