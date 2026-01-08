import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

const MAX_WIDTH = 768; // Tablet/Mobile breakpoint

const MobileGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= MAX_WIDTH);
    };
    
    // Check initially
    checkWidth();

    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!isMobile) {
    return (
      <div className="fixed inset-0 bg-dark flex flex-col items-center justify-center p-8 text-center z-50">
        <div className="bg-dark-light p-8 rounded-2xl shadow-2xl border border-primary/20 max-w-md w-full flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary animate-pulse">
            <Smartphone size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Mobile Experience Only</h1>
          <p className="text-gray-400 mb-6">
            ConnectSphere is designed exclusively for mobile devices. Please open this link on your phone or resize your browser to a mobile width to continue.
          </p>
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-primary to-secondary w-1/2 animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileGuard;