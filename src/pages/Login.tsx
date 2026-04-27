import { ShieldAlert, LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';

export default function Login() {
  const [email, setEmail] = useState('staff@lynx.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Where did they want to go before they were redirected here?
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error(err);
      setError('Invalid staff credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-alert-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-md p-10 relative z-10 shadow-2xl shadow-black/50">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-5xl font-bold text-white tracking-widest uppercase">LYNX</h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-[0.2em] font-semibold text-center">
            Silent Crisis Detection
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="bg-alert-500/10 border border-alert-500/20 text-alert-500 px-4 py-3 rounded-lg flex items-center gap-3">
            <ShieldAlert size={20} className="shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider">
              Staff access only. Unauthorized usage is strictly prohibited.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 bg-navy-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-alert-500/50 focus:border-alert-500 transition-all font-medium"
                placeholder="Staff Email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-navy-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-alert-500/50 focus:border-alert-500 transition-all font-medium"
                placeholder="Password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-alert-500 hover:bg-red-600 disabled:opacity-70 disabled:hover:bg-alert-500 text-white font-bold py-3.5 px-4 rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(229,57,53,0.3)] hover:shadow-[0_0_20px_rgba(229,57,53,0.5)] transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogIn size={18} />
            )}
            {loading ? 'Authenticating...' : 'Sign In To Database'}
          </button>
        </form>
      </div>
    </div>
  );
}
