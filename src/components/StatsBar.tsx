import { AlertTriangle, Users, Camera, CheckCircle } from 'lucide-react';
import { useGlobalMetrics } from '../hooks/useGlobalMetrics';

export default function StatsBar() {
  const { activeHighAlerts, staffResponding, resolvedToday, camerasOnline, totalCameras } = useGlobalMetrics();

  const stats = [
    { 
      label: 'Active High Alerts', 
      value: activeHighAlerts.toString(), 
      icon: AlertTriangle, 
      color: 'text-alert-500', 
      bg: 'bg-alert-500/10' 
    },
    { 
      label: 'Staff Responding', 
      value: staffResponding.toString(), 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Cameras Online', 
      value: `${camerasOnline}/${totalCameras}`, 
      icon: Camera, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Resolved Today', 
      value: resolvedToday.toString(), 
      icon: CheckCircle, 
      color: 'text-slate-400', 
      bg: 'bg-slate-500/10' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-2">
      {stats.map((stat, idx) => (
        <div key={idx} className="glass-panel-hover p-5">
          <div className="flex items-center gap-5">
            <div className={`p-3.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-400 mb-0.5 tracking-wider uppercase truncate">{stat.label}</p>
              <p className="text-2xl font-bold text-white leading-none">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
