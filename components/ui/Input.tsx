import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, error, icon, className, ...props }) => {
  return (
    <div className="space-y-1">
      {label && <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{label} {props.required && <span className="text-error">*</span>}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</div>}
        <input 
          className={cn(
            "w-full bg-dark-light border rounded-xl h-12 text-sm focus:outline-none focus:ring-1 transition-all text-white placeholder:text-gray-600",
            icon ? "pl-10 pr-4" : "px-4",
            error ? "border-error focus:border-error focus:ring-error" : "border-white/10 focus:border-primary/50 focus:ring-primary/50",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1 text-[10px] text-error ml-1 animate-pulse">
          <AlertCircle size={10} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;