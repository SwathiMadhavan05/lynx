import { Bell, Database, Shield, SlidersHorizontal } from 'lucide-react';

export default function SettingsPage() {
  const panels = [
    {
      icon: Bell,
      title: 'Notification Readiness',
      body: 'Push notifications are managed through Firebase Cloud Messaging and are registered when staff log in.',
    },
    {
      icon: Shield,
      title: 'Response Controls',
      body: 'Incident actions, acknowledgements, and resolves are written into Firestore audit logs for traceability.',
    },
    {
      icon: Database,
      title: 'Live Data Sources',
      body: 'Dashboard, incidents, cameras, and staff sections all subscribe directly to Firestore collections in real time.',
    },
    {
      icon: SlidersHorizontal,
      title: 'Demo Operations',
      body: 'Demo Mode can be toggled from the top bar to simulate alerts without waiting for live events.',
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          System controls and operational notes now have a real landing page instead of a dead
          route.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {panels.map((panel) => (
          <article key={panel.title} className="glass-panel-hover p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-900/80 p-3 text-slate-300">
                <panel.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">{panel.title}</h3>
            </div>
            <p className="text-sm leading-6 text-slate-400">{panel.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
