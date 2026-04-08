import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Hotel, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
  };

  const quickLogin = (role) => {
    const creds = {
      admin: { email: 'admin@hotel.com', password: 'admin123' },
      receptionist: { email: 'receptionist@hotel.com', password: 'recept123' },
      housekeeping: { email: 'housekeeping@hotel.com', password: 'house123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-navy-950 via-slate-900 to-slate-950 border-r border-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-navy-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gold-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-navy-500 to-gold-500 rounded-xl flex items-center justify-center">
              <Hotel size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-white">Grand Azure</span>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
            Exceptional<br />
            <span className="text-gold-400">Hospitality</span><br />
            Managed.
          </h1>
          <p className="text-slate-400 text-lg max-w-sm">
            Unified staff management for 150+ rooms. Real-time visibility. Seamless operations.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Rooms', value: '150+' },
            { label: 'Staff Users', value: '24' },
            { label: 'Uptime', value: '99.9%' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="text-2xl font-bold text-white font-mono">{value}</div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div className="flex-1 lg:max-w-md flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-navy-500 to-gold-500 rounded-xl flex items-center justify-center">
              <Hotel size={18} className="text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-white">Grand Azure</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-1">Staff Login</h2>
            <p className="text-slate-400 text-sm">Access your hotel management dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="staff@grandazure.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-600 hover:bg-navy-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          {/* Quick login */}
          <div className="mt-6">
            <div className="text-xs text-slate-500 text-center mb-3">Quick demo access</div>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'receptionist', 'housekeeping'].map(role => (
                <button
                  key={role}
                  onClick={() => quickLogin(role)}
                  className="text-xs py-2 px-2 rounded-lg border border-slate-700 hover:border-navy-500 text-slate-400 hover:text-navy-400 transition-all capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
