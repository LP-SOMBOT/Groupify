import React, { useState } from 'react';
import { 
    updateGroupStatus, 
    deleteGroup, 
    createBroadcastNotification, 
    adminAdjustBalance, 
    adminUpdateUser,
    processWithdrawal,
    updateGroup
} from '../lib/db';
import { useAdminRealtimeGroups, useRealtimeUsers, useRealtimeWithdrawals } from '../hooks/useRealtime';
import { Group, UserProfile, WithdrawalRequest } from '../lib/types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Shield, Trash2, CheckCircle, RefreshCw, LogOut, Search, BellRing, Send, User, XCircle, DollarSign, Wallet, Eye, MousePointerClick, AlertTriangle, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const { groups } = useAdminRealtimeGroups();
    const { users } = useRealtimeUsers();
    const { withdrawals } = useRealtimeWithdrawals();

    const [filter, setFilter] = useState('');
    const [view, setView] = useState<'groups' | 'users' | 'withdrawals' | 'notify'>('groups');
    const navigate = useNavigate();

    // -- Modals State --
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [groupTab, setGroupTab] = useState<'details' | 'actions'>('details');

    // -- Action States --
    const [balanceAdj, setBalanceAdj] = useState('');
    const [editViews, setEditViews] = useState('');
    const [editClicks, setEditClicks] = useState('');
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMsg, setNotifMsg] = useState('');
    const [notifType, setNotifType] = useState<'system' | 'update' | 'alert'>('system');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '1234') {
            setIsAuthenticated(true);
        } else {
            alert('Invalid PIN');
            setPin('');
        }
    }

    // --- User Actions ---
    const handleUserAction = async (uid: string, action: 'ban' | 'freeze' | 'beta') => {
        if (!selectedUser) return;
        if(action === 'ban') await adminUpdateUser(uid, { isBanned: !selectedUser.isBanned });
        if(action === 'freeze') await adminUpdateUser(uid, { monetizationFrozen: !selectedUser.monetizationFrozen });
        if(action === 'beta') await adminUpdateUser(uid, { isBetaTester: !selectedUser.isBetaTester });
        // Close modal to refresh or let realtime handle it? Realtime will update `selectedUser` if we refetch or use effect, 
        // but simplest is to close or rely on parent updates. Ideally `users` prop updates.
    }

    const handleAddMoney = async () => {
        if (!selectedUser) return;
        const amount = parseFloat(balanceAdj);
        if(isNaN(amount)) return;
        await adminAdjustBalance(selectedUser.uid, amount);
        setBalanceAdj('');
        alert('Balance updated');
    }

    // --- Group Actions ---
    const handleGroupStatus = async (group: Group, status: 'approved' | 'rejected') => {
        if (!confirm(`${status === 'approved' ? 'Approve' : 'Reject'} "${group.name}"?`)) return;
        await updateGroupStatus(group.id, status, group.createdBy, group.name);
    }

    const handleUpdateGroupStats = async () => {
        if (!selectedGroup) return;
        const v = parseInt(editViews);
        const c = parseInt(editClicks);
        if (!isNaN(v) || !isNaN(c)) {
            const updates: any = {};
            if(!isNaN(v)) updates.views = v;
            if(!isNaN(c)) updates.clicks = c;
            await updateGroup(selectedGroup.id, updates);
            alert('Stats updated');
        }
    }

    const handleToggleViolation = async () => {
        if (!selectedGroup) return;
        await updateGroup(selectedGroup.id, { isGuidelineViolation: !selectedGroup.isGuidelineViolation });
        alert(`Group ${!selectedGroup.isGuidelineViolation ? 'marked as violation' : 'restored'}.`);
    }

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;
        if (!confirm("Permanently delete this group?")) return;
        await deleteGroup(selectedGroup.id);
        setSelectedGroup(null);
    }

    // --- Withdrawal Actions ---
    const handleWithdrawal = async (req: WithdrawalRequest, action: 'paid' | 'rejected') => {
        if(!confirm(`Mark as ${action}?`)) return;
        await processWithdrawal(req.id, action, req.userId, req.amount);
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xs bg-dark-light p-8 rounded-2xl border border-white/5 shadow-2xl">
                    <h1 className="text-xl font-bold text-center mb-6">Restricted Area</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter PIN"
                            className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest text-lg text-white"
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

                {/* --- Groups View --- */}
                {view === 'groups' && (
                    <div className="space-y-3">
                        <input type="text" placeholder="Search groups..." className="w-full bg-dark-light border border-white/5 rounded-xl p-3 text-sm" value={filter} onChange={e => setFilter(e.target.value)} />
                        {groups.filter(g => g.name.toLowerCase().includes(filter.toLowerCase())).map(group => (
                            <div key={group.id} className="bg-dark-light p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={group.iconUrl} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                        <div className="font-bold text-sm">{group.name}</div>
                                        <div className="text-[10px] text-gray-400">{group.status} {group.isGuidelineViolation && <span className="text-error font-bold">(VIOLATION)</span>}</div>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => {
                                    setSelectedGroup(group);
                                    setEditViews(group.views.toString());
                                    setEditClicks(group.clicks.toString());
                                    setGroupTab('details');
                                }}>View</Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- Users View --- */}
                {view === 'users' && (
                    <div className="space-y-3">
                        {users.map(u => (
                            <div key={u.uid} className="bg-dark-light p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm">{u.displayName}</div>
                                    <div className="text-[10px] text-gray-400">{u.email}</div>
                                </div>
                                <Button size="sm" onClick={() => setSelectedUser(u)}>View</Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- Withdrawals View --- */}
                {view === 'withdrawals' && (
                    <div className="space-y-3">
                        {withdrawals.filter(w => w.status === 'pending').map(w => (
                            <div key={w.id} className="bg-dark-light p-4 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-sm">{w.userName}</span>
                                    <span className="text-success font-bold text-lg">${w.amount}</span>
                                </div>
                                <div className="text-xs text-gray-400 mb-4 bg-dark p-2 rounded">
                                    <div>Method: {w.method}</div>
                                    <div>Number: {w.accountNumber}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => handleWithdrawal(w, 'paid')} className="bg-success hover:bg-success/90">Mark Paid</Button>
                                    <Button onClick={() => handleWithdrawal(w, 'rejected')} variant="danger">Reject</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                 {/* --- Notify View --- */}
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

            {/* --- USER MODAL --- */}
            <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Management">
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                             <img src={selectedUser.photoURL || ''} className="w-16 h-16 rounded-full" />
                             <div>
                                 <h3 className="font-bold text-lg">{selectedUser.displayName}</h3>
                                 <p className="text-xs text-gray-400">{selectedUser.email}</p>
                                 <div className="flex gap-2 mt-1">
                                     <span className={`text-[10px] px-2 py-0.5 rounded ${selectedUser.isBanned ? 'bg-error text-white' : 'bg-success text-white'}`}>
                                         {selectedUser.isBanned ? 'BANNED' : 'ACTIVE'}
                                     </span>
                                     {selectedUser.isBetaTester && <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-white">BETA</span>}
                                 </div>
                             </div>
                        </div>

                        <div className="bg-dark p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Financials</h4>
                            <div className="text-2xl font-bold mb-3">${selectedUser.balance?.toFixed(2)}</div>
                            <div className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="+/- Amount" 
                                    className="bg-dark-light rounded px-2 text-sm w-full"
                                    value={balanceAdj}
                                    onChange={e => setBalanceAdj(e.target.value)}
                                />
                                <Button size="sm" onClick={handleAddMoney}>Update</Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <h4 className="text-xs font-bold text-gray-400 uppercase">Actions</h4>
                             <div className="grid grid-cols-2 gap-2">
                                 <Button variant="secondary" size="sm" onClick={() => handleUserAction(selectedUser.uid, 'beta')}>
                                     {selectedUser.isBetaTester ? 'Revoke Beta' : 'Grant Beta'}
                                 </Button>
                                 <Button variant="secondary" size="sm" onClick={() => handleUserAction(selectedUser.uid, 'freeze')}>
                                     {selectedUser.monetizationFrozen ? 'Unfreeze Mon.' : 'Freeze Mon.'}
                                 </Button>
                                 <Button variant="danger" size="sm" className="col-span-2" onClick={() => handleUserAction(selectedUser.uid, 'ban')}>
                                     {selectedUser.isBanned ? 'Unban User' : 'Ban User'}
                                 </Button>
                             </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- GROUP MODAL --- */}
            <Modal isOpen={!!selectedGroup} onClose={() => setSelectedGroup(null)} title="Group Management">
                {selectedGroup && (
                    <div>
                        <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                            <button onClick={() => setGroupTab('details')} className={`px-4 py-1 text-sm font-bold ${groupTab === 'details' ? 'text-primary' : 'text-gray-400'}`}>Details</button>
                            <button onClick={() => setGroupTab('actions')} className={`px-4 py-1 text-sm font-bold ${groupTab === 'actions' ? 'text-primary' : 'text-gray-400'}`}>Actions</button>
                        </div>

                        {groupTab === 'details' ? (
                             <div className="space-y-4">
                                 <img src={selectedGroup.iconUrl} className="w-full h-32 object-cover rounded-xl bg-gray-800" />
                                 <div>
                                     <h3 className="font-bold text-lg">{selectedGroup.name}</h3>
                                     <p className="text-sm text-gray-400">{selectedGroup.description}</p>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2 text-sm">
                                     <div className="bg-dark p-2 rounded">Members: {selectedGroup.memberCount}</div>
                                     <div className="bg-dark p-2 rounded">Category: {selectedGroup.category}</div>
                                     <div className="bg-dark p-2 rounded">Views: {selectedGroup.views}</div>
                                     <div className="bg-dark p-2 rounded">Clicks: {selectedGroup.clicks}</div>
                                 </div>
                             </div>
                        ) : (
                             <div className="space-y-4">
                                  <div className="bg-dark p-4 rounded-xl border border-white/5">
                                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Adjust Stats</h4>
                                      <div className="grid grid-cols-2 gap-2">
                                          <div>
                                              <label className="text-[10px] text-gray-500">Views</label>
                                              <input className="w-full bg-dark-light rounded p-2 text-sm" type="number" value={editViews} onChange={e => setEditViews(e.target.value)} />
                                          </div>
                                          <div>
                                              <label className="text-[10px] text-gray-500">Clicks</label>
                                              <input className="w-full bg-dark-light rounded p-2 text-sm" type="number" value={editClicks} onChange={e => setEditClicks(e.target.value)} />
                                          </div>
                                      </div>
                                      <Button size="sm" className="mt-2 w-full" onClick={handleUpdateGroupStats}>Update Stats</Button>
                                  </div>

                                  <div className="space-y-2">
                                      {selectedGroup.status === 'pending' && (
                                          <div className="flex gap-2">
                                              <Button fullWidth onClick={() => handleGroupStatus(selectedGroup, 'approved')} className="bg-success text-white">Approve</Button>
                                              <Button fullWidth onClick={() => handleGroupStatus(selectedGroup, 'rejected')} className="bg-error text-white">Reject</Button>
                                          </div>
                                      )}
                                      
                                      <Button fullWidth variant="secondary" onClick={handleToggleViolation} className="border border-warning text-warning bg-warning/10">
                                          {selectedGroup.isGuidelineViolation ? 'Remove Violation Mark' : 'Mark Guideline Violation'}
                                      </Button>
                                      
                                      <Button fullWidth variant="danger" onClick={handleDeleteGroup}>
                                          <Trash2 size={16} className="mr-2" /> Permanently Delete
                                      </Button>
                                  </div>
                             </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}