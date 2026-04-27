import { useMemo, useState } from 'react';
import { BadgeCheck, Briefcase, Info, Shield, UserRound, Users } from 'lucide-react';
import { useIncidents } from '../hooks/useIncidents';
import { useStaffDirectory } from '../hooks/useStaffDirectory';

const FLOOR_OPTIONS = ['All', '1', '2', '3', '4', '5'];

export default function StaffPage() {
  const { staff, loading, usingFallback } = useStaffDirectory();
  const { incidents } = useIncidents();
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [dutyFilter, setDutyFilter] = useState<'all' | 'on' | 'off'>('all');

  const assignments = useMemo(() => {
    return incidents.reduce<Record<string, number>>((acc, incident) => {
      if (incident.assignedStaff) {
        acc[incident.assignedStaff] = (acc[incident.assignedStaff] || 0) + 1;
      }
      return acc;
    }, {});
  }, [incidents]);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesFloor =
        selectedFloor === 'All' || member.floor === 'All' || member.floor === selectedFloor;
      const matchesDuty =
        dutyFilter === 'all' ||
        (dutyFilter === 'on' && member.isOnDuty) ||
        (dutyFilter === 'off' && !member.isOnDuty);

      return matchesFloor && matchesDuty;
    });
  }, [staff, selectedFloor, dutyFilter]);

  const onDutyCount = filteredStaff.filter((member) => member.isOnDuty).length;
  const engagedResponders = filteredStaff.filter((member) => (assignments[member.id] || 0) > 0).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Staff Directory</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Track duty coverage, see who is engaged on active incidents, and keep floor staffing
            visible from the same operational console.
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
            {[
              { key: 'all', label: 'All Staff' },
              { key: 'on', label: 'On Duty' },
              { key: 'off', label: 'Off Duty' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setDutyFilter(filter.key as 'all' | 'on' | 'off')}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  dutyFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Staff in view
              </p>
              <p className="text-2xl font-bold text-white">{filteredStaff.length}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">People matching your current floor and duty filter.</p>
        </article>

        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <BadgeCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                On duty
              </p>
              <p className="text-2xl font-bold text-white">{onDutyCount}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Responders currently marked available for dispatch.</p>
        </article>

        <article className="glass-panel-hover p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-alert-500/10 p-3 text-alert-500">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active assignments
              </p>
              <p className="text-2xl font-bold text-white">{engagedResponders}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400">Team members currently attached to live incidents.</p>
        </article>
      </section>

      {usingFallback && (
        <section className="glass-panel border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <Info size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Showing demo staff directory</p>
              <p className="mt-1 text-sm text-slate-400">
                The Firestore `staff` collection is empty or unavailable, so this page is using
                a built-in demo roster to keep the workflow visible.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-panel animate-pulse p-6">
              <div className="mb-4 h-5 w-36 rounded bg-slate-700" />
              <div className="mb-2 h-4 w-24 rounded bg-slate-800" />
              <div className="h-16 rounded-xl bg-slate-900/70" />
            </div>
          ))}

        {!loading &&
          filteredStaff.map((member) => {
            const openAssignments = assignments[member.id] || 0;

            return (
              <article key={member.id} className="glass-panel-hover p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-slate-900/80 p-4 text-slate-300">
                      <UserRound size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{member.name}</h3>
                      <p className="text-sm capitalize text-slate-400">
                        {member.role} • Floor {member.floor}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                      member.isOnDuty
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-slate-500/15 text-slate-300'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        member.isOnDuty ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}
                    />
                    {member.isOnDuty ? 'On duty' : 'Off duty'}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700/60 bg-navy-900/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Live assignments
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">{openAssignments}</p>
                  </div>

                  <div className="rounded-xl border border-slate-700/60 bg-navy-900/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Contact record
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-300">
                      {member.email || 'No email listed in staff profile'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
                  <Briefcase size={16} className="text-slate-500" />
                  {openAssignments > 0
                    ? 'Currently engaged in active response workflow.'
                    : 'Standing by for new dispatch activity.'}
                </div>
              </article>
            );
          })}

        {!loading && filteredStaff.length === 0 && (
          <div className="glass-panel col-span-full p-12 text-center">
            <p className="text-lg font-bold text-white">No staff match this filter</p>
            <p className="mt-2 text-slate-400">
              Broaden the floor scope or switch back to all duty states to restore visibility.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
