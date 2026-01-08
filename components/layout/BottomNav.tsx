import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Users, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function BottomNav() {
  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Explore', icon: Compass, path: '/explore' },
    { label: 'My Groups', icon: Users, path: '/my-groups' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 bg-dark/95 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center w-full h-full transition-all duration-300 relative",
              isActive ? "text-primary" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-1 rounded-xl transition-all duration-300",
                  isActive ? "-translate-y-1" : ""
                )}>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all duration-300 absolute bottom-1",
                  isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_10px_#6C63FF]"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}