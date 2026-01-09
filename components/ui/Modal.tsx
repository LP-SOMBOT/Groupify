import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  const [show, setShow] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = 'hidden';
      // Small delay to trigger CSS transition
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      const timer = setTimeout(() => {
        setShow(false);
        document.body.style.overflow = 'unset';
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!show) return null;

  return createPortal(
    <div className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300",
        animate ? "bg-black/80 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
    )}>
      <div 
        className={cn(
            "bg-dark-light border border-white/10 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] transition-all duration-300 transform",
            "rounded-t-3xl sm:rounded-2xl", // Bottom sheet on mobile, modal on desktop
            animate ? "translate-y-0 opacity-100 scale-100" : "translate-y-full sm:translate-y-10 opacity-0 sm:scale-95",
            className
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;