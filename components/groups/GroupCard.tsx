import React, { useEffect, useState } from 'react';
import { Group } from '../../lib/types';
import { Users, CheckCircle, ExternalLink, MousePointerClick, Eye, Clock, Edit, Trash, AlertOctagon } from 'lucide-react';
import { formatCompactNumber, getNameInitials } from '../../lib/utils';
import Button from '../ui/Button';
import { trackGroupClick, trackGroupView, deleteGroup } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';

interface GroupCardProps {
  group: Group;
  showStats?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, showStats }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.uid === group.createdBy;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    trackGroupView(group.id, group.createdBy, user?.uid);
  }, [group.id, group.createdBy, user?.uid]);

  const handleJoin = async () => {
    trackGroupClick(group.id, group.createdBy, user?.uid).catch(console.error);
    window.open(group.inviteLink, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
      await deleteGroup(group.id);
      setShowDeleteModal(false);
  }

  const getStatusBadge = () => {
    if (group.isGuidelineViolation) return <span className="text-error bg-error/10 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><AlertOctagon size={10} /> Violation</span>;
    if (group.status === 'pending') return <span className="text-warning bg-warning/10 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Clock size={10} /> Pending</span>;
    if (group.status === 'rejected') return <span className="text-error bg-error/10 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>;
    return null;
  };

  return (
    <>
    <div className={`bg-dark-light rounded-2xl p-4 border transition-all active:scale-[0.99] flex gap-4 relative overflow-hidden ${group.isGuidelineViolation ? 'border-error/50 bg-error/5' : 'border-white/5 hover:border-primary/30'}`}>
      <div className="relative shrink-0 flex flex-col items-center gap-2">
        <img 
          src={group.iconUrl || 'https://picsum.photos/100'} 
          alt={group.name} 
          className="w-16 h-16 rounded-xl object-cover bg-gray-800"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${group.name}&background=2A2A3E&color=fff`;
          }}
        />
        {/* Creator Profile */}
        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full max-w-[80px]">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[8px] font-bold text-white shrink-0">
               {getNameInitials(group.creatorName || 'User')}
            </div>
            <span className="text-[9px] text-gray-400 truncate w-full">{group.creatorName?.split(' ')[0] || 'User'}</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 pr-2 min-w-0">
               <h3 className="font-bold text-base text-white truncate">{group.name}</h3>
               {group.isVerified && (
                  <CheckCircle size={14} className="text-verified shrink-0" fill="currentColor" color="white" />
               )}
            </div>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
            {group.description}
          </p>
          
          <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
             <span className="flex items-center gap-1"><Users size={10} /> {formatCompactNumber(group.memberCount)}</span>
             <span>•</span>
             <span>{group.category}</span>
          </div>
        </div>
        
        <div className="flex justify-end mt-auto items-center gap-3">
           {showStats && (
             <div className="flex items-center gap-3 mr-auto">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Eye size={12} /> {formatCompactNumber(group.views || 0)}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <MousePointerClick size={12} /> {formatCompactNumber(group.clicks || 0)}
                </div>
             </div>
           )}

           {isOwner && group.status === 'approved' ? (
               <div className="flex gap-2">
                   <button onClick={() => navigate(`/edit-group/${group.id}`)} className="p-1.5 bg-white/10 rounded-lg text-gray-300"><Edit size={14}/></button>
                   <button onClick={() => setShowDeleteModal(true)} className="p-1.5 bg-error/10 text-error rounded-lg"><Trash size={14}/></button>
               </div>
           ) : (
                <Button 
                    size="sm" 
                    className="h-7 text-xs px-3 rounded-lg gap-1" 
                    onClick={handleJoin}
                    disabled={group.isGuidelineViolation} 
                >
                    Join <ExternalLink size={10} />
                </Button>
           )}
        </div>
      </div>
    </div>

    <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Group">
        <div className="space-y-4">
            <p className="text-sm text-gray-400">
                Are you sure you want to delete <span className="text-white font-bold">{group.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
                <Button fullWidth variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                <Button fullWidth variant="danger" onClick={handleDelete}>Confirm Delete</Button>
            </div>
        </div>
    </Modal>
    </>
  );
};

export default GroupCard;