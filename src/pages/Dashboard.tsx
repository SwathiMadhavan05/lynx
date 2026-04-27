import { useState } from 'react';
import { Layers, Camera } from 'lucide-react';
import IncidentFeed from '../components/IncidentFeed';
import FloorMap from '../components/FloorMap';
import StatsBar from '../components/StatsBar';
import { useIncidents } from '../hooks/useIncidents';

export default function Dashboard() {
  const [selectedFloor, setSelectedFloor] = useState('1');
  const { incidents, loading } = useIncidents();

  // Unified memory filtering: Ensure both feed and map sync to exactly the target floor
  const filteredIncidents = incidents.filter(inc => inc.floor === selectedFloor);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
          <p className="text-slate-400 mt-1">Global statistics and localized intelligence mapping.</p>
        </div>
        <div className="flex gap-4 items-center">
          
          {/* Universal Floor Selector Filter */}
          <div className="glass-panel flex items-center p-1 rounded-lg border-slate-700 bg-navy-900/50 shadow-inner">
            <span className="text-slate-400 px-3 text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 border-r border-slate-700/50 mr-1">
              <Layers size={14} /> Focus Floor
            </span>
            {[1, 2, 3, 4, 5].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFloor(f.toString())}
                className={`w-9 h-9 flex flex-col items-center justify-center rounded-md font-bold transition-all mx-0.5 ${
                  selectedFloor === f.toString()
                    ? 'bg-alert-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="glass-panel px-4 py-2.5 flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-white animate-pulse shadow-[0_0_15px_rgba(229,57,53,0.2)] border-alert-500/30">
            <span className="w-2h h-2 rounded-full bg-alert-500"></span>
            Streaming
          </span>
        </div>
      </header>

      {/* Global Analytics Engine */}
      <StatsBar />

      {/* Global Interactive SVG Plane */}
      <FloorMap incidents={filteredIncidents} floor={selectedFloor} />

      {/* Feed Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Active Alerts - Prominent Live Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6 tracking-wide">
            Intelligence Feed — Floor {selectedFloor}
          </h3>
          <IncidentFeed incidents={filteredIncidents} loading={loading} />
        </div>

        {/* Live Camera Thumbnails */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Active Tracking Feeds</h3>
          
          <div className="glass-panel flex flex-col overflow-hidden relative group cursor-pointer border-slate-700/50 transition-colors hover:border-slate-500 text-center items-center justify-center py-12">
            <Camera className="text-slate-600 mb-2" size={32} />
            <h4 className="text-slate-300 font-bold uppercase tracking-wider text-sm mb-1">Select Active Pin</h4>
            <p className="text-slate-500 text-xs px-8">Engage with a live incident on the floor map to automatically fetch remote optical streams.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
