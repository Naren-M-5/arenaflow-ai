import { AlertTriangle, Power } from 'lucide-react';
import { useState } from 'react';

export default function AlertCard({ zone, suggestion, onDispatch }) {
  const [handling, setHandling] = useState(false);

  const handleDispatch = () => {
    setHandling(true);
    setTimeout(() => {
      onDispatch(zone.id);
    }, 800);
  };

  return (
    <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 fade-in">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-red-500/20 rounded-full text-red-500 mt-1 sm:mt-0">
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-red-400">{zone.name} At Capacity</h3>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {zone.density}%
            </span>
          </div>
          <p className="text-slate-200 mt-1">
            <span className="font-semibold text-accent">AI Suggestion: </span>
            {suggestion || 'Loading suggestion...'}
          </p>
        </div>
      </div>
      <button 
        onClick={handleDispatch}
        disabled={handling}
        className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all min-w-[140px] justify-center ${
          handling ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
        }`}
      >
        <Power size={18} />
        {handling ? 'Dispatching...' : 'Dispatch Staff'}
      </button>
    </div>
  );
}
