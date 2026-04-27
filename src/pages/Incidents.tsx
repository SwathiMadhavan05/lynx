import { useMemo, useState } from 'react';
import { AlertTriangle, Layers3, Radio, ShieldCheck } from 'lucide-react';
import IncidentFeed from '../components/IncidentFeed';
import { useIncidents } from '../hooks/useIncidents';

const FLOOR_OPTIONS = ['All', '1', '2', '3', '4', '5'];
const STATUS_OPTIONS = ['all', 'active', 'acknowledged'] as const;

export default function IncidentsPage() {
  const { incidents, loading } = useIncidents();
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<(typeof STATUS_OPTIONS)[number]>('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesFloor = selectedFloor === 'All' || incident.floor === selectedFloor;
      const matchesStatus = selectedStatus === 'all' || incident.status === selectedStatus;
      return matchesFloor && matchesStatus;
    });
  }, [incidents, selectedFloor, selectedStatus]);

  const criticalAlerts = filteredIncidents.filter(
    (incident) => incident.type === 'dual_match' && incident.confidence >= 85
  ).length;

  const floorCoverage =
    selectedFloor === 'All'
      ? new Set(filteredIncidents.map((incident) => incident.floor)).size
      : Number(selectedFloor);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Incidents View</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Monitor the live incident queue, isolate floors, and clear active response work without
            leaving the investigation surface.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="glass-panel p-1 flex items-center gap-1">
            {FLOOR_OPTIONS.map((floor) => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  selectedFloor === floor
                    ? 'bg-alert-500 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {floor === 'All' ? 'All Floors' : `Floor ${floor}`}
              </button>
            ))}
          </div>

          <div className="glass-panel p-1 flex items-center gap-1">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-alert-500/10 p-3 text-alert-500">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live queue
              </p>
              <p className="text-2xl font-bold text-white">{filteredIncidents.length}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Open incidents matching your current filters.</p>
        </article>

        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <Radio size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Critical alerts
              </p>
              <p className="text-2xl font-bold text-white">{criticalAlerts}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Dual-match detections above 85% confidence in the filtered view.
          </p>
        </article>

        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Layers3 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Floor coverage
              </p>
              <p className="text-2xl font-bold text-white">{floorCoverage}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Floors represented in the active response queue right now.
          </p>
        </article>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Response Queue</h3>
          {!loading && filteredIncidents.length === 0 && (
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
              <ShieldCheck size={16} />
              No incidents in this slice
            </span>
          )}
        </div>
        <IncidentFeed incidents={filteredIncidents} loading={loading} />
      </section>
    </div>
  );
}
