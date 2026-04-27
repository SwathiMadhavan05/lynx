import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { AuditLog } from '../types/schema';
import { X, Download, Clock, User, CheckCircle, ShieldAlert, Activity } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'today' | '7days' | 'all';

export default function AuditLogDrawer({ isOpen, onClose }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<FilterTab>('today');

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      setLogs(data);
    });

    return () => unsub();
  }, [isOpen]);

  const getFilteredLogs = () => {
    if (filter === 'all') return logs;
    
    const now = new Date();
    const cutoff = new Date();
    
    if (filter === 'today') {
      cutoff.setHours(0,0,0,0);
    } else if (filter === '7days') {
      cutoff.setDate(now.getDate() - 7);
    }

    return logs.filter(log => {
      if (!log.timestamp) return true;
      const ms = log.timestamp.toMillis ? log.timestamp.toMillis() : new Date(log.timestamp).getTime();
      return ms >= cutoff.getTime();
    });
  };

  const filteredLogs = getFilteredLogs();

  const exportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'Staff Name', 'Action', 'Incident ID'];
    const rows = filteredLogs.map(log => {
      const dateString = log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString();
      return `"${dateString}","${log.staffName || log.staffId}","${log.action}","${log.incidentId}"`;
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lynx-audit-${filter}-${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLogIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('resolved')) return <CheckCircle size={16} className="text-emerald-500" />;
    if (act.includes('acknowledged') || act.includes('dispatch')) return <User size={16} className="text-blue-500" />;
    if (act.includes('escalate') || act.includes('911')) return <ShieldAlert size={16} className="text-alert-500" />;
    return <Activity size={16} className="text-slate-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[450px] max-w-[90vw] glass-panel rounded-none border-y-0 border-r-0 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center bg-navy-900">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-alert-500" />
                Audit Logs
              </h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Close Drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-navy-900/50">
              <div className="flex gap-2 bg-navy-800 p-1 rounded-lg">
                <button 
                  onClick={() => setFilter('today')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === 'today' ? 'bg-alert-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setFilter('7days')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === '7days' ? 'bg-alert-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  7 Days
                </button>
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${filter === 'all' ? 'bg-alert-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All Time
                </button>
              </div>

              <button 
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider text-white transition-colors"
              >
                <Download size={14} /> Export CSV
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-slate-500 font-medium py-10 text-sm">
                  No records found for this period.
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className="bg-navy-900/80 border border-slate-700/50 rounded-xl p-4 flex gap-4 transition-colors hover:border-slate-500/50">
                    <div className="mt-1">
                      {getLogIcon(log.action)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{log.action}</p>
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        <span>{log.staffName || log.staffId}</span>
                        <span>•</span>
                        <span>ID: {log.incidentId.substring(0, 8)}...</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 font-mono">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
