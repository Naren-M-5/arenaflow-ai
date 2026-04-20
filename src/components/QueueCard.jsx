import { Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { memo } from 'react';

const QueueCard = memo(function QueueCard({ name, waitTime, status, type }) {
  // Determine color theme based on status
  let theme = {
    bg: 'bg-slate-800',
    bar: 'bg-emerald-500',
    text: 'text-emerald-400',
    icon: <CheckCircle size={16} />
  };

  if (status === 'Busy') {
    theme = {
      bg: 'bg-slate-800',
      bar: 'bg-amber-500',
      text: 'text-amber-400',
      icon: <Info size={16} />
    };
  } else if (status === 'Avoid') {
    theme = {
      bg: 'bg-red-900/20 border-red-800',
      bar: 'bg-red-500',
      text: 'text-red-400',
      icon: <AlertTriangle size={16} />
    };
  }

  // Calculate percentage for progress bar (max 60 mins)
  const percent = Math.min((waitTime / 60) * 100, 100);

  return (
    <div className={`p-4 rounded-xl border border-slate-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${theme.bg}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-slate-100">{name}</h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-900 shadow-inner ${theme.text}`}>
          {theme.icon}
          <span>{status}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Clock size={18} className="text-slate-400" />
        <span className="text-2xl font-bold font-mono">
          {waitTime} <span className="text-sm font-normal text-slate-400">min</span>
        </span>
      </div>
      
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-2.5 rounded-full ${theme.bar} transition-all duration-500 cursor-default`} 
          style={{ width: `${percent}%` }}
          aria-label={`${waitTime} minutes wait time`}
        ></div>
      </div>
    </div>
  );
});

export default QueueCard;
