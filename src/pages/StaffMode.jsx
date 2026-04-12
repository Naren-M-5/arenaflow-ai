import { useState, useEffect } from 'react';
import { Users, Activity, Clock, Map } from 'lucide-react';
import AlertCard from '../components/AlertCard';
import { dbService } from '../lib/firebase';
import { getAlertAction } from '../lib/gemini';

export default function StaffMode() {
  const [data, setData] = useState({ queues: {}, zones: {} });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const unsubscribe = dbService.subscribe((snapshot) => {
      setData(snapshot);
      processAlerts(snapshot.zones);
    });
    return () => unsubscribe();
  }, []);

  const processAlerts = async (zones) => {
    const highDensityZones = Object.values(zones).filter(z => z.density >= 85);
    
    // For a real app we'd keep track of actions we've already generated
    // Here we'll map them carefully to avoid excessive API calls
    const newAlerts = await Promise.all(highDensityZones.map(async (zone) => {
      // Simulate retrieving or generating an action
      // To prevent massive API spam on every 8s simulation tick in this mock,
      // we'll use a mocked immediate response or the gemini helper
      // Using context to avoid real AI spam in demo:
      const action = await getAlertAction(zone);
      return { ...zone, suggestion: action };
    }));
    
    setAlerts(newAlerts);
  };

  const handleDispatch = (zoneId) => {
    // In a real app we'd update Firebase to dismiss the alert or change status
    setAlerts(prev => prev.filter(a => a.id !== zoneId));
  };

  // Metrics calculation
  const totalZones = Object.values(data.zones);
  const totalFans = totalZones.reduce((acc, z) => acc + (z.density * 50), 0); // Mock calc
  const activeAlertsCount = alerts.length;
  
  const allQueues = Object.values(data.queues);
  const avgWait = allQueues.length ? Math.round(allQueues.reduce((acc, q) => acc + q.waitTime, 0) / allQueues.length) : 0;
  
  const busiestZone = totalZones.length ? totalZones.reduce((max, z) => z.density > max.density ? z : max, totalZones[0]) : null;

  // Heatmap coloring helper
  const getFillColor = (zoneId) => {
    const zone = data.zones[zoneId];
    if (!zone) return '#475569'; // slate-600
    if (zone.density < 50) return '#10b981'; // emerald-500
    if (zone.density < 80) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Command Center</h1>
        <div className="flex items-center gap-2">
           <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-300">Live Connection</span>
        </div>
      </div>

      {/* Dispatched Alerts */}
      {alerts.length > 0 && (
        <section>
           <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
             Action Required
           </h2>
           <div className="space-y-3">
             {alerts.map(alert => (
               <AlertCard 
                 key={alert.id} 
                 zone={alert} 
                 suggestion={alert.suggestion}
                 onDispatch={handleDispatch}
               />
             ))}
           </div>
        </section>
      )}

      {/* Metrics Panel */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Users size={18} />
            <h3 className="font-semibold text-sm">Estimated Fans</h3>
          </div>
          <p className="text-3xl font-bold text-white">{totalFans.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Activity size={18} />
            <h3 className="font-semibold text-sm">Active Alerts</h3>
          </div>
          <p className={`text-3xl font-bold ${activeAlertsCount > 0 ? 'text-red-400' : 'text-white'}`}>
            {activeAlertsCount}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Clock size={18} />
            <h3 className="font-semibold text-sm">Avg Wait Time</h3>
          </div>
          <p className="text-3xl font-bold text-white">{avgWait} <span className="text-lg text-slate-400 font-normal">min</span></p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <Map size={18} />
            <h3 className="font-semibold text-sm">Busiest Zone</h3>
          </div>
          <p className="text-2xl font-bold text-white truncate" title={busiestZone?.name}>
            {busiestZone?.name || 'N/A'}
          </p>
          <p className="text-sm font-medium text-slate-400 mt-1">{busiestZone?.density || 0}% Capacity</p>
        </div>
      </section>

      {/* Live Crowd Heatmap */}
      <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl p-6">
         <h2 className="text-xl font-bold mb-6">Stadium Heatmap</h2>
         
         <div className="relative w-full max-w-4xl mx-auto border-2 border-slate-700 rounded-full p-8 bg-slate-900/50 aspect-video flex items-center justify-center">
            <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-2xl">
              {/* Outer Stadium */}
              <ellipse cx="400" cy="200" rx="380" ry="180" fill="#1e293b" stroke="#334155" strokeWidth="4" />
              
              {/* Pitch */}
              <rect x="250" y="100" width="300" height="200" fill="#064e3b" rx="10" stroke="#fff" strokeWidth="2" opacity="0.8" />
              <circle cx="400" cy="200" r="40" fill="none" stroke="#fff" strokeWidth="2" opacity="0.8" />
              <line x1="400" y1="100" x2="400" y2="300" stroke="#fff" strokeWidth="2" opacity="0.8" />

              {/* Zones */}
              <g className="transition-all duration-1000 ease-in-out">
                {/* North Stand */}
                <path d="M 250 80 Q 400 0 550 80 L 480 100 Q 400 60 320 100 Z" fill={getFillColor('northStand')} opacity="0.8" />
                <text x="400" y="50" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">North Stand ({data.zones.northStand?.density || 0}%)</text>
                
                {/* South Stand */}
                <path d="M 250 320 Q 400 400 550 320 L 480 300 Q 400 340 320 300 Z" fill={getFillColor('southStand')} opacity="0.8" />
                <text x="400" y="350" fill="#fff" fontSize="16" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle">South Stand ({data.zones.southStand?.density || 0}%)</text>
                
                {/* West Block */}
                <path d="M 100 200 Q 100 100 230 80 L 250 120 Q 150 150 150 200 Q 150 250 250 280 L 230 320 Q 100 300 100 200 Z" fill={getFillColor('westBlock')} opacity="0.8" />
                <text x="160" y="200" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform="rotate(-90 160,200)">West ({data.zones.westBlock?.density || 0}%)</text>

                {/* East Block */}
                <path d="M 700 200 Q 700 100 570 80 L 550 120 Q 650 150 650 200 Q 650 250 550 280 L 570 320 Q 700 300 700 200 Z" fill={getFillColor('eastBlock')} opacity="0.8" />
                <text x="640" y="200" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle" transform="rotate(90 640,200)">East ({data.zones.eastBlock?.density || 0}%)</text>
              </g>

              {/* Gates labels purely for visual context */}
              <circle cx="200" cy="50" r="15" fill="#3b82f6" />
              <text x="200" y="55" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">A</text>
              <circle cx="600" cy="50" r="15" fill="#3b82f6" />
              <text x="600" y="55" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">B</text>
              <circle cx="750" cy="200" r="15" fill="#3b82f6" />
              <text x="750" y="205" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">C</text>
              <circle cx="600" cy="350" r="15" fill="#3b82f6" />
              <text x="600" y="355" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">D</text>
              <circle cx="200" cy="350" r="15" fill="#3b82f6" />
              <text x="200" y="355" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">E</text>
              <circle cx="50" cy="200" r="15" fill="#3b82f6" />
              <text x="50" y="205" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">F</text>
            </svg>
         </div>
         
         {/* Legend */}
         <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-700">
           <div className="flex items-center gap-2">
             <div className="w-4 h-4 rounded bg-emerald-500"></div>
             <span className="text-sm text-slate-300">Optimal (&lt;50%)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-4 h-4 rounded bg-amber-500"></div>
             <span className="text-sm text-slate-300">Busy (50-80%)</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-4 h-4 rounded bg-red-500"></div>
             <span className="text-sm text-slate-300">Capacity Alert (&gt;80%)</span>
           </div>
         </div>
      </section>
    </div>
  );
}
