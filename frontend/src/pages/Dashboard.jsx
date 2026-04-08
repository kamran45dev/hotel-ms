import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble, Users, Sparkles, Wrench, ArrowUpRight,
  CalendarCheck, CalendarX, TrendingUp, Clock, RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</div>
          <div className="text-3xl font-bold text-white font-mono">{value ?? '—'}</div>
          {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-400/20 text-blue-400' },
  checked_in: { label: 'Checked In', color: 'bg-emerald-400/20 text-emerald-400' },
  checked_out: { label: 'Checked Out', color: 'bg-slate-400/20 text-slate-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-400/20 text-red-400' },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = data?.stats;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button onClick={load} className="btn-secondary text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Rooms" value={stats?.totalRooms} icon={BedDouble} color="bg-navy-500/20 text-navy-400" sub="Active inventory" />
        <StatCard label="Available" value={stats?.available} icon={BedDouble} color="bg-emerald-500/20 text-emerald-400" sub={`${stats ? Math.round((stats.available / stats.totalRooms) * 100) : 0}% of total`} />
        <StatCard label="Occupied" value={stats?.occupied} icon={Users} color="bg-red-500/20 text-red-400" sub={`${stats?.occupancyRate ?? 0}% occupancy`} />
        <StatCard label="Cleaning" value={stats?.cleaning} icon={Sparkles} color="bg-yellow-500/20 text-yellow-400" sub="Awaiting housekeeping" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Maintenance" value={stats?.maintenance} icon={Wrench} color="bg-gray-500/20 text-gray-400" />
        <StatCard label="Today Check-ins" value={stats?.todayCheckIns} icon={CalendarCheck} color="bg-blue-500/20 text-blue-400" />
        <StatCard label="Today Check-outs" value={stats?.todayCheckOuts} icon={CalendarX} color="bg-orange-500/20 text-orange-400" />
        <StatCard label="Pending Cleaning" value={stats?.pendingHousekeeping} icon={Clock} color="bg-purple-500/20 text-purple-400" />
      </div>

      {/* Occupancy bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Room Status Overview</h2>
          <span className="text-xs text-slate-500">Live</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden bg-slate-800 gap-0.5">
          {stats && [
            { key: 'occupied', color: 'bg-red-500' },
            { key: 'cleaning', color: 'bg-yellow-500' },
            { key: 'maintenance', color: 'bg-slate-500' },
            { key: 'available', color: 'bg-emerald-500' },
          ].map(({ key, color }) => {
            const pct = stats.totalRooms > 0 ? (stats[key] / stats.totalRooms) * 100 : 0;
            return pct > 0 ? (
              <div key={key} className={`${color} transition-all`} style={{ width: `${pct}%` }} title={`${key}: ${stats[key]}`} />
            ) : null;
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {[
            { label: 'Available', color: 'bg-emerald-500', key: 'available' },
            { label: 'Occupied', color: 'bg-red-500', key: 'occupied' },
            { label: 'Cleaning', color: 'bg-yellow-500', key: 'cleaning' },
            { label: 'Maintenance', color: 'bg-slate-500', key: 'maintenance' },
          ].map(({ label, color, key }) => (
            <div key={key} className="flex items-center gap-2 text-xs text-slate-400">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {label} ({stats?.[key] ?? 0})
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Recent Bookings</h2>
          <button onClick={() => navigate('/bookings')} className="text-xs text-navy-400 hover:text-navy-300 flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        {loading ? (
          <div className="text-center text-slate-500 py-8 text-sm">Loading...</div>
        ) : data?.recentBookings?.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm">No bookings yet</div>
        ) : (
          <div className="space-y-2">
            {data?.recentBookings?.map(b => (
              <div key={b._id} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-600/20 flex items-center justify-center text-navy-400 text-xs font-bold">
                    {b.guest?.firstName?.charAt(0)}{b.guest?.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{b.guest?.firstName} {b.guest?.lastName}</div>
                    <div className="text-xs text-slate-500 font-mono">{b.bookingRef}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {b.room && (
                    <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      Rm {b.room.roomNumber}
                    </div>
                  )}
                  <span className={`badge ${statusConfig[b.status]?.color}`}>
                    {statusConfig[b.status]?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
