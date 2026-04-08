import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { RefreshCw, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../utils/api';
import RoomCard from '../components/RoomCard';
import RightDrawerPanel from '../components/RightDrawerPanel';

const STATUS_FILTERS = ['all', 'available', 'occupied', 'cleaning', 'maintenance', 'reserved'];
const TYPE_FILTERS = ['all', 'standard', 'deluxe', 'suite', 'executive', 'presidential'];

const statusCounts = (rooms) => {
  const counts = { all: rooms.length, available: 0, occupied: 0, cleaning: 0, maintenance: 0, reserved: 0 };
  rooms.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
  return counts;
};

const filterColors = {
  all: 'border-slate-600 text-slate-300',
  available: 'border-emerald-600/60 text-emerald-400',
  occupied: 'border-red-600/60 text-red-400',
  cleaning: 'border-yellow-600/60 text-yellow-400',
  maintenance: 'border-slate-600 text-slate-400',
  reserved: 'border-blue-600/60 text-blue-400',
};

export default function RoomBoard() {
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [collapsedFloors, setCollapsedFloors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/rooms/board?date=${date}`);
      setRooms(data.rooms);
      setFloors(data.floors);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  const filteredFloors = Object.entries(floors).reduce((acc, [floor, floorRooms]) => {
    const filtered = floorRooms.filter(room => {
      if (statusFilter !== 'all' && room.status !== statusFilter) return false;
      if (typeFilter !== 'all' && room.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return room.roomNumber.includes(q) ||
          room.guestName?.toLowerCase().includes(q) ||
          room.type.includes(q);
      }
      return true;
    });
    if (filtered.length > 0) acc[floor] = filtered;
    return acc;
  }, {});

  const counts = statusCounts(rooms);

  const toggleFloor = (floor) => setCollapsedFloors(prev => ({ ...prev, [floor]: !prev[floor] }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-5 py-3 space-y-3">
        {/* Row 1: Title + date + refresh */}
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-display font-semibold text-white leading-none">Room Board</h1>
            <p className="text-xs text-slate-500 mt-0.5">Live occupancy overview</p>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <input
              type="date"
              className="input text-sm py-1.5 w-40"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <button onClick={load} disabled={loading} className="btn-secondary py-1.5 text-sm">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            {lastUpdated && (
              <span className="text-xs text-slate-600 hidden sm:block">
                Updated {format(lastUpdated, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Status filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all capitalize
                ${statusFilter === s
                  ? `${filterColors[s]} bg-slate-800`
                  : 'border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
                }`}
            >
              {s}
              {s !== 'all' && <span className="font-mono">{counts[s]}</span>}
              {s === 'all' && <span className="font-mono">{counts.all}</span>}
            </button>
          ))}

          <div className="border-l border-slate-700 pl-2 ml-1 flex items-center gap-2">
            <select
              className="input text-xs py-1.5 w-32"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
            >
              {TYPE_FILTERS.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
            </select>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="input pl-7 text-xs py-1.5 w-36"
                placeholder="Search room..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Room grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && Object.keys(floors).length === 0 ? (
          <div className="text-center text-slate-500 py-20 text-sm">Loading room board...</div>
        ) : Object.keys(filteredFloors).length === 0 ? (
          <div className="text-center text-slate-500 py-20 text-sm">No rooms match your filters</div>
        ) : (
          Object.entries(filteredFloors)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([floor, floorRooms]) => {
              const isCollapsed = collapsedFloors[floor];
              const floorCounts = statusCounts(floorRooms);
              return (
                <div key={floor} className="card overflow-hidden">
                  {/* Floor header */}
                  <button
                    onClick={() => toggleFloor(floor)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Floor</span>
                      <span className="text-lg font-bold text-white font-mono">{floor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {floorCounts.available > 0 && <span className="text-emerald-400">{floorCounts.available} avail</span>}
                      {floorCounts.occupied > 0 && <span className="text-red-400">{floorCounts.occupied} occ</span>}
                      {floorCounts.cleaning > 0 && <span className="text-yellow-400">{floorCounts.cleaning} clean</span>}
                      {floorCounts.maintenance > 0 && <span className="text-slate-400">{floorCounts.maintenance} maint</span>}
                    </div>
                    <div className="ml-auto text-slate-500">
                      {isCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                    </div>
                  </button>

                  {/* Rooms grid */}
                  {!isCollapsed && (
                    <div className="p-3 room-grid">
                      {floorRooms.map(room => (
                        <RoomCard
                          key={room._id}
                          room={room}
                          onClick={setSelectedRoom}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Right Drawer */}
      {selectedRoom && (
        <RightDrawerPanel
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onRefresh={() => {
            load();
            setSelectedRoom(null);
          }}
        />
      )}
    </div>
  );
}
