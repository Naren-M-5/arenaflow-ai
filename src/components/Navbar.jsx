import { Link, useLocation } from 'react-router-dom';
import { Accessibility, Users, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ toggleAccessibility, accessibleMode }) {
  const location = useLocation();

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">AI</div>
            <span className="font-bold text-xl tracking-tight text-white">ArenaFlow</span>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link 
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                location.pathname === '/' ? 'bg-accent/20 text-accent' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              aria-label="Fan Mode"
            >
              <Users size={18} />
              <span className="hidden sm:inline">Fan Mode</span>
            </Link>
            
            <Link 
              to="/staff"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300 ${
                location.pathname === '/staff' ? 'bg-accent/20 text-accent' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              aria-label="Staff Mode"
            >
              <BarChart3 size={18} />
              <span className="hidden sm:inline">Staff Mode</span>
            </Link>

            <button 
              onClick={toggleAccessibility}
              className={`ml-2 p-2 rounded-full transition-colors ${
                accessibleMode ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
              aria-label="Toggle Accessibility Mode"
            >
              <Accessibility size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
