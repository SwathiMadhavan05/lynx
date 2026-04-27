import { useState, useEffect } from 'react';
import { Eye, LogOut, Beaker, Zap, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { cvSimulator } from '../services/SimulationEngine';
import AuditLogDrawer from './AuditLogDrawer';

export default function TopNav() {
  const { staffProfile } = useAuth();
  const navigate = useNavigate();
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Sync simulator lifecycle with the UI toggle
  useEffect(() => {
    if (isDemoActive) {
      cvSimulator.start();
    } else {
      cvSimulator.stop();
    }

    // Cleanup: Halt simulator if the component unmounts preventing ghosting
    return () => cvSimulator.stop();
  }, [isDemoActive]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const forceDemoTrigger = () => {
    cvSimulator.forceDispatchWarning();
  };

  return (
    <>
      <header className="h-16 w-full glass-panel rounded-none border-t-0 border-x-0 border-slate-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Left: Logo and Icon */}
        <div className="flex items-center gap-2">
          <Eye className="text-alert-500" size={24} />
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase mt-0.5">LYNX</h1>
        </div>

        {/* Center: Live Status Indicator */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-3 pointer-events-none">
          <div className="glass-panel px-4 py-1.5 flex items-center gap-2 text-sm font-bold tracking-wider rounded-full bg-[#111827]/80">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span className="text-emerald-400 mt-0.5">LIVE</span>
          </div>

          {/* Demo Mode Visualization Controls */}
          {isDemoActive && (
            <div className="glass-panel px-4 py-1.5 flex items-center gap-2 text-sm font-bold tracking-wider rounded-full bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse"></span>
              <span className="text-amber-500 mt-0.5">DEMO</span>
            </div>
          )}
        </div>

        {/* Right: Controls & Profile */}
        <div className="flex items-center gap-5">
          
          {/* Toggle & Trigger Modules */}
          <div className="flex items-center gap-3 bg-navy-800 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-inner">
            {isDemoActive && (
              <button 
                onClick={forceDemoTrigger}
                className="py-1 px-3 bg-alert-500 hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1 shadow-[0_0_10px_rgba(229,57,53,0.4)] transition-all transform hover:-translate-y-0.5"
              >
                <Zap size={12} /> Trigger Alert Now
              </button>
            )}

            <div className="flex items-center gap-2 pr-1">
              <Beaker size={14} className={isDemoActive ? 'text-amber-500' : 'text-slate-500'} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Demo Mode</span>
              <button 
                onClick={() => setIsDemoActive(!isDemoActive)}
                className={`w-10 h-5 rounded-full relative transition-colors duration-300 ml-1 shadow-inner ${isDemoActive ? 'bg-amber-500' : 'bg-slate-600'}`}
              >
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${isDemoActive ? 'left-[22px]' : 'left-[3px]'}`} />
              </button>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-700/50"></div>
          
          <button
            onClick={() => setIsAuditOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-navy-800 hover:bg-navy-700 border border-slate-700/50 rounded-lg text-[10px] font-bold tracking-widest uppercase text-slate-300 hover:text-white transition-colors shadow-sm"
          >
            <FileText size={14} className="text-slate-400" />
            Audit Log
          </button>

          <div className="w-px h-8 bg-slate-700/50"></div>

          {/* User Info */}
          {staffProfile && (
            <div className="text-right flex flex-col justify-center select-none">
              <span className="text-sm font-bold text-white capitalize leading-tight">
                {staffProfile.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {staffProfile.role}
              </span>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      
      {/* Drawer mounted outside the flex flow but controlled by TopNav state */}
      <AuditLogDrawer isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
    </>
  );
}
