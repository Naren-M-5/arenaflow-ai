import { useState, useEffect } from 'react';
import { MapPin, Navigation, Sparkles, Loader2, Volume2 } from 'lucide-react';
import QueueCard from '../components/QueueCard';
import AIChatbox from '../components/AIChatbox';
import { dbService } from '../lib/firebase';
import { getRoutingRecommendation, getVenueTip } from '../lib/gemini';

export default function FanMode({ accessibleMode }) {
  const [data, setData] = useState({ queues: {}, zones: {} });
  const [gate, setGate] = useState('Gate A');
  const [section, setSection] = useState('Section 101');
  const [route, setRoute] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [tip, setTip] = useState('Loading smart tip...');

  useEffect(() => {
    const unsubscribe = dbService.subscribe((snapshot) => {
      setData(snapshot);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Generate tip only once when data becomes available to save API quota
    const fetchTip = async () => {
      if (Object.keys(data.queues).length > 0 && tip === 'Loading smart tip...') {
        const venueTip = await getVenueTip(data);
        setTip(venueTip);
      }
    };
    
    fetchTip();
  }, [data, tip]);

  const handleRouteSearch = async (e) => {
    e.preventDefault();
    
    const cleanSection = section.trim();
    if (!cleanSection || !gate) return;
    
    setIsRouting(true);
    
    const gateZoneKey = Object.keys(data.zones).find(k => data.zones[k].name === gate);
    const gateData = gateZoneKey ? data.zones[gateZoneKey] : null;
    
    const recommendation = await getRoutingRecommendation(gate, cleanSection, {
      selectedGate: gateData,
      allZones: data.zones
    });
    
    setRoute(recommendation);
    setIsRouting(false);

    if (accessibleMode && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(recommendation);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  const playVoiceTip = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(tip);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in">
      {/* Smart Entry Assistant */}
      <section className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Navigation className="text-accent" />
              AI Smart Entry Assistant
            </h2>
            <p className="text-slate-400 mt-1">Get the fastest route to your seat</p>
          </div>
          <Sparkles className="text-accent/50 hidden sm:block w-12 h-12" />
        </div>
        
        <div className="p-6">
          <form onSubmit={handleRouteSearch} className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-1">Entry Gate</label>
              <select 
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Select Entry Gate"
              >
                <option>Gate A</option>
                <option>Gate B</option>
                <option>Gate C</option>
                <option>Gate D</option>
                <option>Gate E</option>
                <option>Gate F</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-400 mb-1">Seat Section</label>
              <input 
                type="text" 
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. Section 12"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Enter Seat Section"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={isRouting}
                className="w-full sm:w-auto bg-accent hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isRouting ? (
                  <><Loader2 className="animate-spin" /> Routing...</>
                ) : 'Find Route'}
              </button>
            </div>
          </form>

          {route && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 flex items-start gap-4 fade-in">
              <div className="p-2 bg-blue-500/20 rounded-full text-blue-400 shrink-0">
                <MapPin />
              </div>
              <div>
                <h3 className="font-bold text-blue-300 mb-2">Recommended Route</h3>
                <p className="text-slate-200 leading-relaxed">{route}</p>
                {accessibleMode && (
                  <span className="inline-block mt-3 text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                    Wheelchair Accessible Route Highlighted
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Live Queue Predictor */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Live Queue Predictor
          </h2>
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live Updates
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {Object.values(data.queues).map((queue) => (
            <QueueCard 
              key={queue.id}
              name={queue.name}
              waitTime={queue.waitTime}
              status={queue.status}
              type={queue.type}
            />
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Sparkles className="text-indigo-400 shrink-0" />
            <p className="text-indigo-200"><span className="font-bold text-indigo-300">AI Tip:</span> {tip}</p>
          </div>
          {accessibleMode && (
            <button onClick={playVoiceTip} className="p-2 hover:bg-indigo-500/20 rounded-full transition-colors text-indigo-300" aria-label="Play AI Tip Audio">
              <Volume2 size={24} />
            </button>
          )}
        </div>
      </section>

      {/* Concierge */}
      <section>
        <AIChatbox context={data} />
      </section>
    </div>
  );
}
