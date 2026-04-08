import { format } from 'date-fns';
import { User, Calendar } from 'lucide-react';

const statusConfig = {
  available: {
    bg: 'bg-emerald-950/60 hover:bg-emerald-950/80',
    border: 'border-emerald-800/50 hover:border-emerald-600',
    badge: 'bg-emerald-500',
    label: 'Available',
    dot: 'bg-emerald-400',
  },
  occupied: {
    bg: 'bg-red-950/60 hover:bg-red-950/80',
    border: 'border-red-800/50 hover:border-red-600',
    badge: 'bg-red-500',
    label: 'Occupied',
    dot: 'bg-red-400',
  },
  cleaning: {
    bg: 'bg-yellow-950/60 hover:bg-yellow-950/80',
    border: 'border-yellow-800/50 hover:border-yellow-600',
    badge: 'bg-yellow-500',
    label: 'Cleaning',
    dot: 'bg-yellow-400',
  },
  maintenance: {
    bg: 'bg-slate-900/80 hover:bg-slate-800/80',
    border: 'border-slate-700 hover:border-slate-600',
    badge: 'bg-slate-500',
    label: 'Maint.',
    dot: 'bg-slate-400',
  },
  reserved: {
    bg: 'bg-blue-950/60 hover:bg-blue-950/80',
    border: 'border-blue-800/50 hover:border-blue-600',
    badge: 'bg-blue-500',
    label: 'Reserved',
    dot: 'bg-blue-400',
  },
};

const typeLabels = {
  standard: 'STD',
  deluxe: 'DLX',
  suite: 'STE',
  executive: 'EXE',
  presidential: 'PRE',
};

export default function RoomCard({ room, onClick }) {
  const cfg = statusConfig[room.status] || statusConfig.available;

  return (
    <button
      onClick={() => onClick(room)}
      className={`relative flex flex-col p-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-left group
        ${cfg.bg} ${cfg.border}`}
      style={{ minHeight: '90px' }}
    >
      {/* Status dot */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${cfg.dot} ${room.status === 'available' ? 'animate-pulse' : ''}`} />

      {/* Room number */}
      <div className="text-base font-bold text-white font-mono leading-none">{room.roomNumber}</div>

      {/* Type badge */}
      <div className="text-xs text-slate-400 font-medium mt-0.5">{typeLabels[room.type] || room.type}</div>

      {/* Guest info if occupied */}
      {(room.status === 'occupied' || room.status === 'reserved') && room.guestName && (
        <div className="mt-auto pt-1.5 space-y-0.5">
          <div className="flex items-center gap-1 text-xs text-slate-300 truncate">
            <User size={9} className="flex-shrink-0 opacity-60" />
            <span className="truncate">{room.guestName.split(' ')[0]}</span>
          </div>
          {room.checkOutDate && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={9} className="flex-shrink-0 opacity-60" />
              <span>{format(new Date(room.checkOutDate), 'MMM d')}</span>
            </div>
          )}
        </div>
      )}

      {/* Status label for non-occupied */}
      {room.status !== 'occupied' && room.status !== 'reserved' && (
        <div className="mt-auto pt-1.5">
          <div className="text-xs opacity-60">{cfg.label}</div>
        </div>
      )}
    </button>
  );
}
