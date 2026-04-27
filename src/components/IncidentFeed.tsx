import type { Incident } from '../types/schema';
import IncidentCard from './IncidentCard';
import { ShieldCheck } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface Props {
  incidents: Incident[];
  loading: boolean;
}

export default function IncidentFeed({ incidents, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel p-5 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-24 h-6 bg-slate-700 rounded-sm"></div>
                <div className="w-20 h-4 bg-slate-800 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-slate-800 rounded"></div>
            </div>
            <div className="grid grid-cols-2 gap-4 my-4">
              <div className="w-32 h-4 bg-slate-800 rounded"></div>
              <div className="w-24 h-4 bg-slate-800 rounded"></div>
            </div>
            <div className="flex gap-3 mt-5">
              <div className="h-9 flex-1 bg-slate-700/50 rounded-lg"></div>
              <div className="h-9 flex-1 bg-slate-700/50 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="glass-panel border-emerald-500/20 bg-emerald-500/5 p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">All clear — no active incidents</h3>
        <p className="text-slate-400 max-w-sm">
          System is actively scanning all zones on this floor. Live feeds and behavioral analysis indicate zero distress flags.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {incidents.map(incident => (
          <div id={`incident-${incident.id}`} key={incident.id} className="scroll-mt-24 transition-colors duration-500">
            <IncidentCard incident={incident} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
