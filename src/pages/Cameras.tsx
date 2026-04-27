import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, Info, RadioTower, TriangleAlert, Video } from 'lucide-react';
import { useCameras } from '../hooks/useCameras';
import { useIncidents } from '../hooks/useIncidents';

const FLOOR_OPTIONS = ['All', '1', '2', '3', '4', '5'];

export default function CamerasPage() {
  const { cameras, loading, usingFallback } = useCameras();
  const { incidents } = useIncidents();
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');

  const filteredCameras = useMemo(() => {
    return cameras.filter((camera) => {
      const matchesFloor = selectedFloor === 'All' || camera.floor === selectedFloor;
      const matchesStatus = statusFilter === 'all' || camera.status === statusFilter;
      return matchesFloor && matchesStatus;
    });
  }, [cameras, selectedFloor, statusFilter]);

  const activeByCamera = useMemo(() => {
    return incidents.reduce<Record<string, number>>((acc, incident) => {
      acc[incident.cameraId] = (acc[incident.cameraId] || 0) + 1;
      return acc;
    }, {});
  }, [incidents]);

  const onlineCount = filteredCameras.filter((camera) => camera.status === 'online').length;
  const camerasWithAlerts = filteredCameras.filter((camera) => activeByCamera[camera.id] > 0).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Cameras View</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Review sensor coverage, identify offline optics quickly, and see which feeds are tied
            to the current incident stream.
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
            {['all', 'online', 'offline'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as 'all' | 'online' | 'offline')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                  statusFilter === status
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
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Online feeds
              </p>
              <p className="text-2xl font-bold text-white">
                {onlineCount}/{filteredCameras.length || 0}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Healthy cameras in the current filter set.</p>
        </article>

        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-alert-500/10 p-3 text-alert-500">
              <TriangleAlert size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Feeds with incidents
              </p>
              <p className="text-2xl font-bold text-white">{camerasWithAlerts}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">
            Cameras currently associated with open incident activity.
          </p>
        </article>

        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <RadioTower size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Coverage footprint
              </p>
              <p className="text-2xl font-bold text-white">
                {new Set(filteredCameras.map((camera) => camera.zone)).size}
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Distinct zones currently covered by visible feeds.</p>
        </article>
      </section>

      {usingFallback && (
        <section className="glass-panel border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Info size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Showing demo camera inventory</p>
              <p className="mt-1 text-sm text-slate-400">
                The Firestore `cameras` collection is empty or unavailable, so this page is using
                the built-in demo camera set to keep the dashboard usable.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-panel animate-pulse p-6">
              <div className="mb-4 h-5 w-40 rounded bg-slate-700" />
              <div className="mb-3 h-4 w-24 rounded bg-slate-800" />
              <div className="h-24 rounded-xl bg-slate-900/70" />
            </div>
          ))}

        {!loading &&
          filteredCameras.map((camera) => {
            const incidentCount = activeByCamera[camera.id] || 0;
            const isOnline = camera.status === 'online';

            return (
              <article
                key={camera.id}
                className="glass-panel-hover overflow-hidden p-6 transition-colors"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-900/80 p-3 text-slate-300">
                        <Camera size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{camera.label}</h3>
                        <p className="text-sm text-slate-400">
                          {camera.id} • Floor {camera.floor} • {camera.zone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      isOnline
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isOnline ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}
                    />
                    {camera.status}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700/60 bg-navy-900/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Incident load
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">{incidentCount}</p>
                  </div>

                  <div className="rounded-xl border border-slate-700/60 bg-navy-900/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Stream state
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-300">
                      {camera.streamUrl ? 'External stream linked' : 'Awaiting stream endpoint'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-700/60 bg-[#0b1120] p-6 text-center">
                  <Video className="mx-auto mb-3 text-slate-600" size={28} />
                  <p className="text-sm font-semibold text-slate-300">
                    {isOnline ? 'Feed available for playback hook-up' : 'Camera is offline'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {camera.streamUrl
                      ? 'A live source URL is configured for this device.'
                      : 'Add a stream URL to enable the View Feed action.'}
                  </p>
                </div>
              </article>
            );
          })}

        {!loading && filteredCameras.length === 0 && (
          <div className="glass-panel col-span-full p-12 text-center">
            <p className="text-lg font-bold text-white">No cameras match this filter</p>
            <p className="mt-2 text-slate-400">
              Try a different floor or include offline devices to broaden the result set.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
