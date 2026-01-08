import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-dark/80 backdrop-blur-md border-b border-white/5 px-4 h-14 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
          C
        </div>
        <span className="font-bold text-lg tracking-tight text-white">ConnectSphere</span>
      </Link>
      
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <Link to="/notifications" className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border border-dark"></span>
        </Link>
      </div>
    </header>
  );
}