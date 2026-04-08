import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sparkles, CheckCircle, Clock, Loader2, RefreshCw, Play } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const priorityColors = {
  low: 'text-slate-400 bg-slate-400/10',
  normal: 'text-blue-400 bg-blue-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  urgent: 'text-red-400 bg-red-400/10',
};

const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  in_progress: 'text-blue-400 bg-blue-400/10',
  completed: 'text-emerald-400 bg-emerald-400/10',
};

const typeLabels = {
  checkout_clean: 'Checkout Clean',
  daily_clean: 'Daily Clean',
  inspection: 'Inspection',
  deep_clean: 'Deep Clean',
};

export default function Housekeeping() {
  const { can } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [completing, setCompleting] = useState({});
  const [starting, setStarting] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/housekeeping${params}`);
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStart = async (taskId) => {
    setStarting(prev => ({ ...prev, [taskId]: true }));
    try {
      await api.put(`/housekeeping/${taskId}/start`);
      toast.success('Task started');
      load();
    } catch (err) {
      toast.error('Failed to start task');
    } finally {
      setStarting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleComplete = async (taskId) => {
    setCompleting(prev => ({ ...prev, [taskId]: true }));
    try {
      await api.put(`/housekeeping/${taskId}/complete`);
      toast.success('Task completed — room set to available');
      load();
    } catch (err) {
      toast.error('Failed to complete task');
    } finally {
      setCompleting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-white">Housekeeping</h1>
          <p className="text-slate-400 text-sm">Room cleaning task management</p>
        </div>
        <button onClick={load} className="btn-secondary"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-400 bg-yellow-400/10' },
          { label: 'In Progress', value: inProgress, icon: Sparkles, color: 'text-blue-400 bg-blue-400/10' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'in_progress', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize
              ${statusFilter === s ? 'bg-navy-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task cards */}
      {loading ? (
        <div className="text-center text-slate-500 py-12">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <div className="text-white font-medium">All clear!</div>
          <div className="text-slate-500 text-sm mt-1">No housekeeping tasks at the moment</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div key={task._id} className="card p-4 space-y-3">
              {/* Room + type */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-bold text-white font-mono">
                    Room {task.room?.roomNumber}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">{task.room?.type} · Floor {task.room?.floor}</div>
                </div>
                <span className={`badge capitalize ${statusColors[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              {/* Task meta */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {typeLabels[task.type] || task.type}
                </span>
                <span className={`badge capitalize ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>

              {/* Assigned to */}
              {task.assignedTo && (
                <div className="text-xs text-slate-500">
                  Assigned to: <span className="text-slate-300">{task.assignedTo.name}</span>
                </div>
              )}

              {/* Created */}
              <div className="text-xs text-slate-600">
                Created {format(new Date(task.createdAt), 'MMM d, HH:mm')}
              </div>

              {/* Checklist preview */}
              {task.checklistItems?.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800">
                  {task.checklistItems.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`} />
                      {item.label}
                    </div>
                  ))}
                  {task.checklistItems.length > 3 && (
                    <div className="text-xs text-slate-600">+{task.checklistItems.length - 3} more items</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleStart(task._id)}
                    disabled={starting[task._id]}
                    className="btn-secondary flex-1 justify-center text-sm py-2"
                  >
                    {starting[task._id] ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    Start
                  </button>
                )}
                {(task.status === 'pending' || task.status === 'in_progress') && (
                  <button
                    onClick={() => handleComplete(task._id)}
                    disabled={completing[task._id]}
                    className="btn-success flex-1 justify-center text-sm py-2"
                  >
                    {completing[task._id] ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    Complete
                  </button>
                )}
                {task.status === 'completed' && (
                  <div className="flex-1 text-center text-xs text-emerald-400 py-2">
                    ✓ Completed {task.completedAt ? format(new Date(task.completedAt), 'HH:mm') : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
