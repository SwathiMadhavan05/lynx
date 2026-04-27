import { motion } from 'framer-motion';
import type { Incident } from '../types/schema';
import { ShieldAlert } from 'lucide-react';

interface Props {
  incidents: Incident[];
  floor: string;
}

export default function FloorMap({ incidents, floor }: Props) {
  // Mapping zones to SVG logic based on standard layout constraints
  const getZoneCoordinates = (zone: string) => {
    // Rooms: e.g., "Room 302" -> match "02"
    const roomMatch = zone.match(/Room \d(\d\d)/);
    if (roomMatch) {
      const rm = parseInt(roomMatch[1], 10);
      return {
        x: rm === 1 || rm === 4 ? 200 : rm === 2 || rm === 5 ? 400 : 600,
        y: rm <= 3 ? 115 : 285
      };
    }
    if (zone.includes('Corridor A')) return { x: 200, y: 200 };
    if (zone.includes('Corridor B')) return { x: 600, y: 200 };
    if (zone.includes('Left Stair')) return { x: 75, y: 200 };
    if (zone.includes('Right Stair')) return { x: 725, y: 200 };
    if (zone.includes('Elevator')) return { x: 400, y: 200 };
    
    // Default fallback to center of the hall
    return { x: 400, y: 200 };
  };

  const handlePinClick = (id: string) => {
    const el = document.getElementById(`incident-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight flash
      el.classList.add('ring-2', 'ring-alert-500', 'ring-offset-2', 'ring-offset-navy-900', 'rounded-xl');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-alert-500', 'ring-offset-2', 'ring-offset-navy-900', 'rounded-xl');
      }, 2000);
    }
  };

  // Fixed camera positions for the layout
  const cameras = [
    { id: 'C1', x: 75, y: 160 },   // Left Stair entry
    { id: 'C2', x: 200, y: 180 },  // Left Corridor
    { id: 'C3', x: 400, y: 180 },  // Elevator Area
    { id: 'C4', x: 600, y: 180 },  // Right Corridor
    { id: 'C5', x: 725, y: 160 },  // Right Stair entry
    { id: 'C6', x: 200, y: 115 },  // Room 1 Cluster
    { id: 'C7', x: 600, y: 285 },  // Room 6 Cluster
  ];

  return (
    <div className="glass-panel p-6 border-slate-700/50 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Floor {floor} Live Map</h3>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 bg-navy-900 px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-alert-500 animate-pulse border-2 border-alert-500/30"></span>
            Alert
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            Cam Online
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <span className="w-3 h-3 rounded-full bg-slate-500"></span>
            Cam Offline
          </div>
        </div>
      </div>

      {/* Interactive SVG Floor Plan */}
      <div className="relative w-full max-w-4xl mx-auto border border-slate-800 rounded-xl overflow-hidden bg-navy-900 shadow-inner">
        <svg viewBox="0 0 800 400" className="w-full h-auto text-slate-600 block">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Central Corridor */}
          <rect x="100" y="180" width="600" height="40" fill="#111827" stroke="currentColor" strokeWidth="2" />
          
          {/* Stairwells */}
          <rect x="50" y="160" width="50" height="80" fill="#0f172a" stroke="currentColor" strokeWidth="2" />
          <text x="75" y="225" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 uppercase tracking-widest">Stair</text>
          
          <rect x="700" y="160" width="50" height="80" fill="#0f172a" stroke="currentColor" strokeWidth="2" />
          <text x="725" y="225" textAnchor="middle" className="text-[10px] font-bold fill-slate-500 uppercase tracking-widest">Stair</text>

          {/* Elevator */}
          <rect x="350" y="180" width="100" height="40" fill="#1e293b" stroke="currentColor" strokeWidth="2" />
          <text x="400" y="204" textAnchor="middle" className="text-[10px] font-bold fill-slate-400 tracking-widest">ELEVATOR</text>

          {/* Top Rooms (101-103 corresponding to Floor string) */}
          <rect x="100" y="50" width="200" height="130" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <text x="120" y="70" className="text-[14px] font-bold fill-slate-500">{floor}01</text>

          <rect x="300" y="50" width="200" height="130" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <text x="320" y="70" className="text-[14px] font-bold fill-slate-500">{floor}02</text>

          <rect x="500" y="50" width="200" height="130" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <text x="520" y="70" className="text-[14px] font-bold fill-slate-500">{floor}03</text>

          {/* Bottom Rooms (104-106 corresponding to Floor string) */}
          <rect x="100" y="220" width="200" height="130" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <text x="120" y="340" className="text-[14px] font-bold fill-slate-500">{floor}04</text>

          <rect x="300" y="220" width="200" height="130" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <text x="320" y="340" className="text-[14px] font-bold fill-slate-500">{floor}05</text>

          <rect x="500" y="220" width="200" height="130" fill="transparent" stroke="currentColor" strokeWidth="2" />
          <text x="520" y="340" className="text-[14px] font-bold fill-slate-500">{floor}06</text>

          {/* Render Cameras */}
          {cameras.map(cam => (
            <g key={cam.id}>
              <circle cx={cam.x} cy={cam.y} r="4" className="fill-emerald-500" />
              {/* Fake pulse effect on primary cameras */}
              {['C3', 'C6', 'C7'].includes(cam.id) && (
                <motion.circle 
                  cx={cam.x} cy={cam.y} r="4" 
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 3 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  stroke="#10b981" strokeWidth="2" fill="none"
                />
              )}
            </g>
          ))}

          {/* Render Active Incident Pins overlayed dynamically! */}
          {incidents.map(inc => {
            const coords = getZoneCoordinates(inc.zone);
            return (
              <g 
                key={inc.id} 
                className="cursor-pointer group relative"
                onClick={() => handlePinClick(inc.id)}
              >
                {/* Core Pin */}
                <circle cx={coords.x} cy={coords.y} r="12" className="fill-alert-500 shadow-xl" />
                
                {/* Radiating Pulse Alarm */}
                <motion.circle 
                  cx={coords.x} cy={coords.y} r="12"
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 4 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  className="fill-alert-500/50"
                />
                
                {/* Embedded Lucide Alert Icon via Foreign Object */}
                <foreignObject x={coords.x - 8} y={coords.y - 8} width="16" height="16" className="pointer-events-none">
                  <ShieldAlert className="text-white w-4 h-4" />
                </foreignObject>

                {/* SVG Native Tooltip Rendering via G element hovering */}
                {/* A bit of complex SVG rendering to draw a custom tooltip box purely in SVG upon group hover */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect 
                    x={coords.x - 80} y={coords.y - 75} 
                    width="160" height="60" rx="8" 
                    className="fill-navy-900 stroke-alert-500 shadow-2xl" strokeWidth="2" 
                  />
                  <polygon 
                    points={`${coords.x - 10},${coords.y - 15} ${coords.x + 10},${coords.y - 15} ${coords.x},${coords.y - 5}`} 
                    className="fill-navy-900 stroke-alert-500" strokeWidth="2" 
                  />
                  <rect x={coords.x-9} y={coords.y-20} width="18" height="10" className="fill-navy-900 border-none" />
                  
                  <text x={coords.x} y={coords.y - 55} textAnchor="middle" className="text-[10px] font-bold fill-white uppercase tracking-wider">
                    {inc.type.replace('_', ' ')}
                  </text>
                  <text x={coords.x} y={coords.y - 40} textAnchor="middle" className="text-[9px] font-semibold fill-alert-500">
                    {inc.confidence}% CONFIDENCE
                  </text>
                  <text x={coords.x} y={coords.y - 25} textAnchor="middle" className="text-[8px] font-medium fill-slate-400">
                    {inc.zone} • CLICK TO VIEW
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
