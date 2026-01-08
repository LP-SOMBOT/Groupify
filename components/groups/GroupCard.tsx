import React, { useEffect } from 'react';
import { Group } from '../../lib/types';
import { Users, CheckCircle, ExternalLink, MousePointerClick, Eye, Clock, Edit, Trash, AlertOctagon } from 'lucide-react';
import { formatCompactNumber } from '../../lib/utils';
import Button from '../ui/Button';
import { trackGroupClick, trackGroupView, deleteGroup } from '../../lib/db';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GroupCardProps {
  group: Group;
  showStats?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, showStats }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.uid === group.createdBy;

  useEffect(() => {
    trackGroupView(group.id, group.createdBy, user?.uid);
  }, [group.id, group.createdBy, user?.uid]);

  const handleJoin = async () => {
    trackGroupClick(group.id, group.createdBy, user?.uid).catch(console.error);
    window.open(group.inviteLink, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
      if(confirm('Are you sure you want to delete your group?')) {
          await deleteGroup(group.id);
      }
  }

  const getStatusBadge = () => {
    if (group.isGuidelineViolation) return <span className="text-error bg-error/10 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><AlertOctagon size={10} /> Violation</span>;
    if (group.status === 'pending') return <span className="text-warning bg-warning/10 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1"><Clock size={10} /> Pending</span>;
    if (group.status === 'rejected') return <span className="text-error bg-error/10 px-2 py-0.5 rounded text-[10px] font-bold">Rejected</span>;
    return null;
  };

  return (
    <div className={`bg-dark-light rounded-2xl p-4 border transition-all active:scale-[0.99] flex gap-4 relative overflow-hidden ${group.isGuidelineViolation ? 'border-error/50 bg-error/5' : 'border-white/5 hover:border-primary/30'}`}>
      <div className="relative shrink-0">
        <img 
          src={group.iconUrl || 'https://picsum.photos/100'} 
          alt={group.name} 
          className="w-20 h-20 rounded-xl object-cover bg-gray-800"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${group.name}&background=2A2A3E&color=fff`;
          }}
        />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-dark-light px-2 py-0.5 rounded-full border border-white/10 text-[10px] font-bold text-gray-300 flex items-center gap-1 shadow-sm whitespace-nowrap">
          <Users size={10} />
          {formatCompactNumber(group.memberCount)}
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
        </div>
        
        <div className="flex justify-end mt-2 items-center gap-3">
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
                   <button onClick={handleDelete} className="p-1.5 bg-error/10 text-error rounded-lg"><Trash size={14}/></button>
               </div>
           ) : (
                <Button 
                    size="sm" 
                    className="h-7 text-xs px-3 rounded-lg gap-1" 
                    onClick={handleJoin}
                    disabled={group.isGuidelineViolation} // Disable join if violation
                >
                    Join <ExternalLink size={10} />
                </Button>
           )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;