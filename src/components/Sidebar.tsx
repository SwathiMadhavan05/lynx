import { Camera, ShieldAlert, Users, LayoutDashboard, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShieldAlert, label: 'Incidents', path: '/incidents' },
    { icon: Camera, label: 'Cameras', path: '/cameras' },
    { icon: Users, label: 'Staff', path: '/staff' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 glass-panel border-l-0 border-t-0 border-b-0 rounded-none h-[calc(100vh-4rem)] sticky top-16 flex flex-col pt-6">
      <nav className="flex-1 px-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                isActive 
                  ? 'bg-alert-500/10 text-alert-500' 
                  : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
