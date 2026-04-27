import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Video, User, Phone, CheckCircle } from 'lucide-react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import type { Incident } from '../types/schema';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  incident: Incident;
}

export default function IncidentCard({ incident }: Props) {
  const { staffProfile } = useAuth();
  const [elapsed, setElapsed] = useState('');

  // Ticker for elapsed time
  useEffect(() => {
    const updateElapsed = () => {
      if (!incident.timestamp) return;
      
      let past;
      if (incident.timestamp.toDate) {
        past = incident.timestamp.toDate().getTime();
      } else if (typeof incident.timestamp === 'string') {
        past = new Date(incident.timestamp).getTime();
      } else {
        return;
      }

      const diff = Math.floor((Date.now() - past) / 1000);
      if (diff < 0) {
        setElapsed('just now');
        return;
      }
      const mins = Math.floor(diff / 60);
      const secs = diff % 60;
      setElapsed(`${mins}:${secs.toString().padStart(2, '0')} ago`);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [incident.timestamp]);

  const handleStatusChange = async (newStatus: 'acknowledged' | 'resolved') => {
    try {
      const incidentRef = doc(db, 'incidents', incident.id);
      await updateDoc(incidentRef, {
        status: newStatus,
        assignedStaff: staffProfile?.id || null
      });

      // Write audit log
      await addDoc(collection(db, 'audit_logs'), {
        incidentId: incident.id,
        action: `Status updated to ${newStatus}`,
        staffId: staffProfile?.id || 'system',
        staffName: staffProfile?.name || 'System Auto-Resolver',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating incident status:", error);
    }
  };

  const getBadgeStyle = () => {
    switch (incident.type) {
      case 'dual_match': return 'bg-alert-500 text-white';
      case 'lip_detection': return 'bg-orange-500 text-white';
      case 'gait_anomaly': return 'bg-amber-500 text-black';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getTypeLabel = () => {
    return incident.type.replace('_', ' ').toUpperCase();
  };

  const isCriticalDualMatch = incident.type === 'dual_match' && incident.confidence > 85;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`glass-panel p-5 relative overflow-hidden ${
        isCriticalDualMatch ? 'border-l-4 border-l-alert-500/80 shadow-[inset_4px_0_15px_rgba(229,57,53,0.2)]' : ''
      }`}
    >
      {/* Pulsing overlay for critical dual matches */}
      {isCriticalDualMatch && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-alert-500 animate-pulse"></div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-sm text-[10px] font-extrabold tracking-widest ${getBadgeStyle()}`}>
            {getTypeLabel()}
          </span>
          <span className="text-xs font-bold text-slate-300">
            {incident.confidence}% CONFIDENCE
          </span>
        </div>
        <div className="text-right">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            incident.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
          }`}>
            {incident.status}
          </span>
          <div className="text-xs font-mono text-slate-400 mt-1 font-semibold">{elapsed || '...'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="flex items-center gap-2 text-slate-300">
          <MapPin size={16} className="text-slate-500" />
          <span className="text-sm font-medium">Floor {incident.floor} — {incident.zone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Video size={16} className="text-slate-500" />
          <span className="text-sm font-medium">Cam {incident.cameraId}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button className="flex-1 glass-panel hover:bg-slate-700/50 py-2 text-sm font-bold text-white transition-colors flex items-center justify-center gap-2">
          <Video size={16} /> View Feed
        </button>

        {incident.status === 'active' && (
          <>
            {incident.type === 'dual_match' ? (
              <button 
                onClick={() => handleStatusChange('acknowledged')}
                className="flex-1 bg-alert-500 hover:bg-red-600 shadow-[0_0_15px_rgba(229,57,53,0.3)] py-2 rounded-lg text-sm font-bold tracking-wide text-white transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={16} /> Call 911
              </button>
            ) : (
              <button 
                onClick={() => handleStatusChange('acknowledged')}
                className="flex-1 bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)] py-2 rounded-lg text-sm font-bold tracking-wide text-white transition-colors flex items-center justify-center gap-2"
              >
                <User size={16} /> Dispatch Staff
              </button>
            )}
          </>
        )}

        {incident.status === 'acknowledged' && (
          <button 
            onClick={() => handleStatusChange('resolved')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(5,150,105,0.3)] py-2 rounded-lg text-sm font-bold tracking-wide text-white transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Resolve
          </button>
        )}
      </div>
    </motion.div>
  );
}
