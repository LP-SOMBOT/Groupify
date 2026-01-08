import React from 'react';
import { Group } from '../../lib/types';
import { Users, CheckCircle, ExternalLink, MousePointerClick, Eye } from 'lucide-react';
import { formatCompactNumber } from '../../lib/utils';
import Button from '../ui/Button';
import { trackGroupClick } from '../../lib/db';

interface GroupCardProps {
  group: Group;
  showStats?: boolean;
}

const GroupCard: React.FC<GroupCardProps> = ({ group, showStats }) => {
  
  const handleJoin = async () => {
    // Optimistic tracking
    trackGroupClick(group.id).catch(console.error);
    window.open(group.inviteLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-dark-light rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-all active:scale-[0.99] flex gap-4 relative overflow-hidden">
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
          <div className="flex items-center gap-1 mb-1 pr-6">
            <h3 className="font-bold text-base text-white truncate">{group.name}</h3>
            {group.isVerified && (
              <CheckCircle size={14} className="text-verified shrink-0" fill="currentColor" color="white" />
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
            {group.description}
          </p>
          <div className="flex flex-wrap gap-1">
            {group.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-gray-400 border border-white/5">
                #{tag}
              </span>
            ))}
          </div>
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
           <Button 
            size="sm" 
            className="h-7 text-xs px-3 rounded-lg gap-1" 
            onClick={handleJoin}
           >
             Join <ExternalLink size={10} />
           </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;