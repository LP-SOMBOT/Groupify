import React, { useState } from 'react';
import { updateGroupVerification, deleteGroup, createNotification } from '../lib/firestore';
import { useAdminRealtimeGroups } from '../hooks/useRealtime';
import { Group } from '../lib/types';
import Button from '../components/ui/Button';
import { Shield, Trash2, CheckCircle, RefreshCw, LogOut, Search, BellRing, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const { groups, loading } = useAdminRealtimeGroups();
    const [filter, setFilter] = useState('');
    const [view, setView] = useState<'groups' | 'notify'>('groups');
    const navigate = useNavigate();

    // Notification Form
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

    const handleToggleVerify = async (group: Group) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm(`Change verification status for "${group.name}"?`)) return;
        
        try {
            await updateGroupVerification(group.id, !group.isVerified);
        } catch (error) {
            console.error(error);
            alert("Failed to update status");
        }
    }

    const handleDelete = async (id: string) => {
        // eslint-disable-next-line no-restricted-globals
        if (!confirm('Are you sure you want to PERMANENTLY delete this group?')) return;
        
        try {
            await deleteGroup(id);
        } catch (error) {
            console.error(error);
            alert("Failed to delete group");
        }
    }

    const handleSendNotification = async (e: React.FormEvent) => {
      e.preventDefault();
      // eslint-disable-next-line no-restricted-globals
      if (!confirm('Broadcast this notification to ALL users?')) return;
      
      try {
        await createNotification(notifTitle, notifMsg, notifType);
        alert('Notification sent!');
        setNotifTitle('');
        setNotifMsg('');
      } catch (e) {
        console.error(e);
        alert('Failed to send');
      }
    };

    const filteredGroups = groups.filter(g => 
        g.name.toLowerCase().includes(filter.toLowerCase()) || 
        g.id.includes(filter)
    );

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
                            className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest text-lg focus:border-error outline-none transition-colors text-white"
                            autoFocus
                        />
                        <Button fullWidth variant="danger" type="submit" className="h-12 shadow-none">
                            Access Control
                        </Button>
                    </form>
                    <button onClick={() => navigate('/')} className="w-full mt-6 text-xs text-gray-500 hover:text-white transition-colors">
                        ← Back to App
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-dark pb-20 font-sans text-gray-100">
            {/* Header */}
            <div className="bg-dark-light border-b border-white/5 p-4 sticky top-0 z-20 flex justify-between items-center shadow-md">
                <h1 className="font-bold text-lg flex items-center gap-2 text-error">
                    <Shield size={20} fill="currentColor" className="text-error/20" />
                    <span className="tracking-tight">Super Admin</span>
                </h1>
                <div className="flex gap-2">
                     <div className="p-2">
                        <RefreshCw size={20} className={loading ? "animate-spin text-gray-400" : "text-gray-400"} />
                     </div>
                     <button onClick={() => setIsAuthenticated(false)} className="p-2 hover:bg-white/10 rounded-lg text-error transition-colors" title="Logout">
                        <LogOut size={20} />
                     </button>
                </div>
            </div>

            <div className="p-4 space-y-6 max-w-2xl mx-auto">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-dark-light p-4 rounded-2xl border border-white/5 text-center shadow-lg">
                        <div className="text-2xl font-bold mb-1">{groups.length}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total</div>
                    </div>
                    <div className="bg-dark-light p-4 rounded-2xl border border-white/5 text-center shadow-lg">
                        <div className="text-2xl font-bold text-verified mb-1">{groups.filter(g => g.isVerified).length}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Verified</div>
                    </div>
                    <div className="bg-dark-light p-4 rounded-2xl border border-white/5 text-center shadow-lg">
                         <div className="text-2xl font-bold text-warning mb-1">{groups.filter(g => !g.isVerified).length}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Pending</div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex p-1 bg-dark-light rounded-xl border border-white/5">
                  <button 
                    onClick={() => setView('groups')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'groups' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Manage Groups
                  </button>
                  <button 
                    onClick={() => setView('notify')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'notify' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    Broadcast System
                  </button>
                </div>

                {view === 'groups' ? (
                  <>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search groups..." 
                            className="w-full bg-dark-light border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary/50 text-white placeholder:text-gray-600"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                        {loading && groups.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">Loading data...</div>
                        ) : filteredGroups.map(group => (
                            <div key={group.id} className="bg-dark-light p-3 rounded-2xl border border-white/5 flex items-center gap-3 hover:border-white/10 transition-colors">
                                <img 
                                    src={group.iconUrl} 
                                    className="w-12 h-12 rounded-xl bg-gray-800 object-cover border border-white/5" 
                                    alt=""
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <h3 className="font-bold text-sm text-white truncate">{group.name}</h3>
                                        {group.isVerified && <CheckCircle size={14} className="text-verified fill-verified/10" />}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <span className="truncate max-w-[100px]">ID: {group.id}</span>
                                        <span className={group.accessType === 'Paid' ? 'text-success font-bold' : ''}>{group.accessType || 'Free'}</span>
                                        <span>•</span>
                                        <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleVerify(group)}
                                        title={group.isVerified ? "Revoke Verification" : "Verify Group"}
                                        className={`p-2 rounded-xl transition-all ${
                                            group.isVerified 
                                            ? 'text-verified bg-verified/10 hover:bg-verified/20' 
                                            : 'text-gray-600 bg-white/5 hover:bg-white/10 hover:text-gray-300'
                                        }`}
                                    >
                                        {group.isVerified ? <CheckCircle size={20} /> : <CheckCircle size={20} className="opacity-50" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(group.id)}
                                        title="Delete Group"
                                        className="p-2 rounded-xl text-error bg-error/10 hover:bg-error/20 transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {filteredGroups.length === 0 && !loading && (
                            <div className="text-center p-8 text-gray-600 text-sm">
                                No groups found.
                            </div>
                        )}
                    </div>
                  </>
                ) : (
                  <div className="bg-dark-light p-6 rounded-2xl border border-white/5 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <BellRing size={24} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold">Broadcast Notification</h2>
                        <p className="text-xs text-gray-400">Send alerts to all users instantly.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleSendNotification} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                        <input
                          required
                          className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm focus:border-primary focus:outline-none"
                          placeholder="e.g. System Maintenance"
                          value={notifTitle}
                          onChange={e => setNotifTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Message</label>
                        <textarea
                          required
                          rows={3}
                          className="w-full bg-dark border border-white/10 rounded-xl p-3 text-sm focus:border-primary focus:outline-none resize-none"
                          placeholder="What do you want to tell everyone?"
                          value={notifMsg}
                          onChange={e => setNotifMsg(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['system', 'update', 'alert'].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setNotifType(t as any)}
                              className={`py-2 rounded-lg text-xs font-bold capitalize border ${notifType === t ? 'bg-primary border-primary' : 'bg-dark border-white/10 text-gray-400'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button fullWidth size="lg" className="mt-4 gap-2">
                         <Send size={18} /> Send Broadcast
                      </Button>
                    </form>
                  </div>
                )}
            </div>
        </div>
    )
}