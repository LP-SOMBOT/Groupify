import React, { useState } from 'react';
import { 
    updateGroupStatus, 
    deleteGroup, 
    createBroadcastNotification, 
    adminAdjustBalance, 
    adminUpdateUser,
    processWithdrawal,
    updateGroup,
    addPaymentMethod,
    removePaymentMethod
} from '../lib/db';
import { useAdminRealtimeGroups, useRealtimeUsers, useRealtimeWithdrawals, usePaymentMethods } from '../hooks/useRealtime';
import { Group, UserProfile, WithdrawalRequest, PaymentMethodConfig } from '../lib/types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Shield, Trash2, LogOut, BellRing, User, DollarSign, Wallet, Eye, MousePointerClick, LayoutDashboard, Users as UsersIcon, Layers, CreditCard, Menu, X, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { formatCompactNumber } from '../lib/utils';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const { groups } = useAdminRealtimeGroups();
    const { users } = useRealtimeUsers();
    const { withdrawals } = useRealtimeWithdrawals();
    const { methods: paymentMethods } = usePaymentMethods();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'groups' | 'payments' | 'withdrawals' | 'broadcast'>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    // Modals State
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Action State
    const [balanceAdj, setBalanceAdj] = useState('');
    const [editViews, setEditViews] = useState('');
    const [editClicks, setEditClicks] = useState('');
    
    // Payment Form
    const [payName, setPayName] = useState('');
    const [payProv, setPayProv] = useState('');
    const [payInstr, setPayInstr] = useState('');

    // Broadcast Form
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMsg, setNotifMsg] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === '1234') {
            setIsAuthenticated(true);
        } else {
            showToast('Invalid PIN', 'error');
            setPin('');
        }
    }

    // --- Stats Calculation ---
    const totalRevenue = users.reduce((acc, u) => acc + (u.balance || 0), 0);
    const totalViews = groups.reduce((acc, g) => acc + (g.views || 0), 0);
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

    // --- Actions ---

    const handleUserAction = async (uid: string, action: 'ban' | 'freeze' | 'beta') => {
        if (!selectedUser) return;
        if(action === 'ban') await adminUpdateUser(uid, { isBanned: !selectedUser.isBanned });
        if(action === 'freeze') await adminUpdateUser(uid, { monetizationFrozen: !selectedUser.monetizationFrozen });
        if(action === 'beta') await adminUpdateUser(uid, { isBetaTester: !selectedUser.isBetaTester });
        showToast('User status updated', 'success');
        setSelectedUser(null);
    }

    const handleAddMoney = async () => {
        if (!selectedUser) return;
        const amount = parseFloat(balanceAdj);
        if(isNaN(amount)) return;
        await adminAdjustBalance(selectedUser.uid, amount);
        setBalanceAdj('');
        showToast('Balance updated', 'success');
        setSelectedUser(null);
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
            showToast('Stats updated & Revenue recalculated', 'success');
            setSelectedGroup(null);
        }
    }

    const handleAddPaymentMethod = async (e: React.FormEvent) => {
        e.preventDefault();
        await addPaymentMethod(payName, payProv, payInstr);
        setPayName(''); setPayProv(''); setPayInstr('');
        showToast('Withdrawal method added', 'success');
    }

    const handleDeletePaymentMethod = async (id: string) => {
        if(confirm('Delete this withdrawal method?')) {
            await removePaymentMethod(id);
            showToast('Method deleted', 'success');
        }
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xs bg-dark-light p-8 rounded-2xl border border-white/5 shadow-2xl">
                    <h1 className="text-xl font-bold text-center mb-6">Admin Panel</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="PIN" className="text-center tracking-widest text-lg" autoFocus />
                        <Button fullWidth variant="danger" type="submit">Access</Button>
                    </form>
                    <button onClick={() => navigate('/')} className="w-full mt-6 text-xs text-gray-500 hover:text-white">Exit</button>
                </div>
            </div>
        )
    }

    const SidebarItem = ({ id, icon: Icon, label }: any) => (
        <button 
            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTab === id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/5'}`}
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-dark font-sans text-gray-100 flex relative overflow-hidden">
            
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-light border-r border-white/5 p-4 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
                <div className="flex items-center justify-between mb-8 px-2">
                    <h1 className="font-bold text-xl flex items-center gap-2 text-error">
                        <Shield size={24} /> Admin
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400"><X size={24}/></button>
                </div>
                
                <nav className="space-y-1">
                    <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem id="users" icon={UsersIcon} label="Users Management" />
                    <SidebarItem id="groups" icon={Layers} label="Groups Management" />
                    <SidebarItem id="withdrawals" icon={Wallet} label="Withdrawals" />
                    <SidebarItem id="payments" icon={Landmark} label="Withdrawal Methods" />
                    <SidebarItem id="broadcast" icon={BellRing} label="Broadcast" />
                </nav>

                <div className="absolute bottom-4 left-4 right-4">
                    <Button variant="ghost" fullWidth onClick={() => setIsAuthenticated(false)} className="text-error hover:bg-error/10">
                        <LogOut size={18} className="mr-2" /> Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 border-b border-white/5 flex items-center px-4 justify-between bg-dark/50 backdrop-blur-md md:justify-end">
                    <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-400"><Menu/></button>
                    <div className="text-xs font-bold text-gray-500">v3.1.0</div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    
                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-dark-light p-4 rounded-2xl border border-white/5">
                                    <div className="text-gray-400 text-xs font-bold uppercase">Total Users</div>
                                    <div className="text-2xl font-bold mt-1">{users.length}</div>
                                </div>
                                <div className="bg-dark-light p-4 rounded-2xl border border-white/5">
                                    <div className="text-gray-400 text-xs font-bold uppercase">Total Groups</div>
                                    <div className="text-2xl font-bold mt-1">{groups.length}</div>
                                </div>
                                <div className="bg-dark-light p-4 rounded-2xl border border-white/5">
                                    <div className="text-gray-400 text-xs font-bold uppercase">Total Views</div>
                                    <div className="text-2xl font-bold mt-1">{formatCompactNumber(totalViews)}</div>
                                </div>
                                <div className="bg-dark-light p-4 rounded-2xl border border-white/5">
                                    <div className="text-gray-400 text-xs font-bold uppercase">Pending Withdrawals</div>
                                    <div className="text-2xl font-bold text-warning mt-1">{pendingWithdrawals}</div>
                                </div>
                            </div>

                            <div className="bg-dark-light rounded-2xl border border-white/5 p-6">
                                <h3 className="font-bold mb-4">Recent Users</h3>
                                <div className="space-y-3">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u.uid} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">{u.displayName?.charAt(0)}</div>
                                                <div>
                                                    <div className="font-bold text-sm">{u.displayName}</div>
                                                    <div className="text-[10px] text-gray-400">{u.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono">${(u.balance || 0).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">User Management</h2>
                            {users.map(u => (
                                <div key={u.uid} className="bg-dark-light p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
                                            {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold">{u.displayName?.charAt(0)}</div>}
                                        </div>
                                        <div>
                                            <div className="font-bold">{u.displayName}</div>
                                            <div className="text-xs text-gray-400">{u.email}</div>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => setSelectedUser(u)}>Manage</Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* GROUPS */}
                    {activeTab === 'groups' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Group Management</h2>
                            {groups.map(g => (
                                <div key={g.id} className="bg-dark-light p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <img src={g.iconUrl} className="w-10 h-10 rounded-lg bg-gray-800 object-cover"/>
                                        <div>
                                            <div className="font-bold text-sm">{g.name}</div>
                                            <div className="text-[10px] text-gray-400 flex gap-2">
                                                <span className="flex items-center gap-1"><Eye size={10}/> {g.views || 0}</span>
                                                <span className="flex items-center gap-1"><MousePointerClick size={10}/> {g.clicks || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => {
                                        setSelectedGroup(g);
                                        setEditViews((g.views || 0).toString());
                                        setEditClicks((g.clicks || 0).toString());
                                    }}>Edit</Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* WITHDRAWAL METHODS (Formerly Payments) */}
                    {activeTab === 'payments' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Withdrawal Methods</h2>
                            <p className="text-gray-400 text-sm">Define the payout options available to users in their cashout screen.</p>
                            
                            <div className="grid gap-4 md:grid-cols-2">
                                {paymentMethods.map(m => (
                                    <div key={m.id} className="bg-dark-light p-4 rounded-xl border border-white/5 relative group">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Landmark size={16} className="text-primary"/>
                                            <div className="font-bold">{m.name}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 font-mono bg-white/5 p-1 rounded w-fit mb-2">{m.provider}</div>
                                        <div className="text-xs text-gray-300 italic">"{m.instruction}"</div>
                                        <button onClick={() => handleDeletePaymentMethod(m.id)} className="absolute top-2 right-2 p-2 text-error opacity-0 group-hover:opacity-100 transition-opacity bg-dark-light rounded-full border border-white/10 shadow-lg"><Trash2 size={16}/></button>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleAddPaymentMethod} className="bg-dark-light p-6 rounded-xl border border-white/5 space-y-3 max-w-md">
                                <h3 className="font-bold">Add New Method</h3>
                                <Input placeholder="Display Name (e.g. EVC Plus)" value={payName} onChange={e => setPayName(e.target.value)} required />
                                <Input placeholder="Provider Code (e.g. EVC, ZAAD)" value={payProv} onChange={e => setPayProv(e.target.value)} required />
                                <Input placeholder="User Instructions (e.g. Send to *770*...)" value={payInstr} onChange={e => setPayInstr(e.target.value)} required />
                                <Button type="submit">Add Withdrawal Method</Button>
                            </form>
                        </div>
                    )}
                     
                     {/* BROADCAST */}
                     {activeTab === 'broadcast' && (
                         <div className="max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Send Broadcast</h2>
                            <div className="bg-dark-light p-6 rounded-xl border border-white/5 space-y-4">
                                <Input placeholder="Title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} />
                                <textarea className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm" rows={4} placeholder="Message" value={notifMsg} onChange={e => setNotifMsg(e.target.value)} />
                                <Button fullWidth onClick={async () => {
                                    await createBroadcastNotification(notifTitle, notifMsg, 'system');
                                    showToast('Broadcast Sent', 'success');
                                    setNotifTitle('');
                                    setNotifMsg('');
                                }}>Send</Button>
                            </div>
                         </div>
                     )}

                </main>
            </div>

            {/* MODALS */}
            <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Manage User">
                {selectedUser && (
                    <div className="space-y-4">
                         <div className="text-center">
                            <div className="text-2xl font-bold">${(selectedUser.balance || 0).toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Current Balance</div>
                         </div>
                         <div className="flex gap-2">
                             <Input type="number" placeholder="Adjust Amount" value={balanceAdj} onChange={e => setBalanceAdj(e.target.value)} />
                             <Button onClick={handleAddMoney}>Adjust</Button>
                         </div>
                         <hr className="border-white/5" />
                         <div className="grid grid-cols-2 gap-2">
                             <Button variant="secondary" onClick={() => handleUserAction(selectedUser.uid, 'beta')}>
                                 {selectedUser.isBetaTester ? 'Revoke Beta' : 'Grant Beta'}
                             </Button>
                             <Button variant="secondary" onClick={() => handleUserAction(selectedUser.uid, 'freeze')}>
                                 {selectedUser.monetizationFrozen ? 'Unfreeze' : 'Freeze'}
                             </Button>
                             <Button variant="danger" className="col-span-2" onClick={() => handleUserAction(selectedUser.uid, 'ban')}>
                                 {selectedUser.isBanned ? 'Unban' : 'Ban Access'}
                             </Button>
                         </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={!!selectedGroup} onClose={() => setSelectedGroup(null)} title="Edit Group Stats">
                {selectedGroup && (
                    <div className="space-y-4">
                        <p className="text-xs text-gray-400">Editing views/clicks will automatically recalculate user revenue based on the monetization rate.</p>
                        <Input label="Views" type="number" value={editViews} onChange={e => setEditViews(e.target.value)} />
                        <Input label="Clicks" type="number" value={editClicks} onChange={e => setEditClicks(e.target.value)} />
                        <Button fullWidth onClick={handleUpdateGroupStats}>Update & Recalculate</Button>
                        <Button fullWidth variant="danger" onClick={async () => {
                            if(confirm("Delete?")) {
                                await deleteGroup(selectedGroup.id);
                                setSelectedGroup(null);
                                showToast('Deleted', 'success');
                            }
                        }}>Delete Group</Button>
                    </div>
                )}
            </Modal>

        </div>
    )
}