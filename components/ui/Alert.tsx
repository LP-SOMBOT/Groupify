import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 rounded-xl p-4 shadow-2xl flex items-center gap-3 animate-slide-in ${
      type === 'success' ? 'bg-success text-white' : 'bg-error text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={16} /></button>
    </div>
  );
};

export default Alert;