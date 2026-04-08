import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, BedDouble, User, Calendar, Phone, Mail, CreditCard,
  Plus, Trash2, Loader2, CheckCircle, FileText, Wrench,
  ArrowRight, Sparkles, LogIn, LogOut, Clock, Star
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const typeColors = {
  standard: 'text-slate-300 bg-slate-700',
  deluxe: 'text-blue-300 bg-blue-900/50',
  suite: 'text-purple-300 bg-purple-900/50',
  executive: 'text-gold-300 bg-amber-900/50',
  presidential: 'text-gold-400 bg-amber-800/50',
};

// ── Sub-components ──────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div>
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm text-slate-200 font-medium">{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{children}</div>;
}

// ── Check-in form ────────────────────────────────────────────────
function CheckInForm({ room, onSuccess, onCancel }) {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Walk-in fields
  const [walkIn, setWalkIn] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    checkInDate: format(new Date(), 'yyyy-MM-dd'),
    checkOutDate: '', roomType: room.type, adults: 1, children: 0,
    source: 'walk_in'
  });

  useEffect(() => {
    api.get('/bookings?status=confirmed').then(({ data }) => {
      setBookings(data.bookings.filter(b => !b.room || b.room._id === room._id || !b.room._id));
    }).finally(() => setLoadingBookings(false));
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      if (walkIn) {
        // Create booking first then check in
        const { data: bData } = await api.post('/bookings', {
          guest: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
          checkInDate: form.checkInDate,
          checkOutDate: form.checkOutDate,
          roomType: form.roomType,
          adults: form.adults,
          children: form.children,
          source: 'walk_in'
        });
        await api.post(`/bookings/${bData.booking._id}/checkin`, { roomId: room._id });
        toast.success('Walk-in check-in successful!');
      } else {
        await api.post(`/bookings/${selectedBooking}/checkin`, { roomId: room._id });
        toast.success('Check-in successful!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle>Check-In to Room {room.roomNumber}</SectionTitle>

      <div className="flex gap-2">
        <button onClick={() => setWalkIn(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${!walkIn ? 'bg-navy-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
          Existing Booking
        </button>
        <button onClick={() => setWalkIn(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${walkIn ? 'bg-navy-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
          Walk-In
        </button>
      </div>

      {!walkIn ? (
        <div>
          {loadingBookings ? <div className="text-center text-slate-500 text-sm py-4">Loading bookings...</div> : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bookings.length === 0 && <div className="text-slate-500 text-sm text-center py-4">No confirmed bookings available</div>}
              {bookings.map(b => (
                <button
                  key={b._id}
                  onClick={() => setSelectedBooking(b._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedBooking === b._id ? 'border-navy-500 bg-navy-900/30' : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}
                >
                  <div className="text-sm font-medium text-white">{b.guest.firstName} {b.guest.lastName}</div>
                  <div className="text-xs text-slate-400 font-mono">{b.bookingRef}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {format(new Date(b.checkInDate), 'MMM d')} → {format(new Date(b.checkOutDate), 'MMM d, yyyy')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
            <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
          </div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Check-In</label><input type="date" className="input" value={form.checkInDate} onChange={e => setForm({...form, checkInDate: e.target.value})} /></div>
            <div><label className="label">Check-Out</label><input type="date" className="input" value={form.checkOutDate} onChange={e => setForm({...form, checkOutDate: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Adults</label><input type="number" min="1" className="input" value={form.adults} onChange={e => setForm({...form, adults: parseInt(e.target.value)})} /></div>
            <div><label className="label">Children</label><input type="number" min="0" className="input" value={form.children} onChange={e => setForm({...form, children: parseInt(e.target.value)})} /></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button
          onClick={handleCheckIn}
          disabled={loading || (!walkIn && !selectedBooking) || (walkIn && (!form.firstName || !form.checkOutDate))}
          className="btn-success flex-1"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
          Check In
        </button>
      </div>
    </div>
  );
}

// ── Add Service form ─────────────────────────────────────────────
function AddServiceForm({ stayId, onSuccess, onCancel }) {
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState({ name: '', category: 'food', quantity: 1, unitPrice: 0, notes: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/services/catalog').then(({ data }) => setCatalog(data.catalog));
  }, []);

  const selectCatalog = (item) => setForm({ ...form, name: item.name, category: item.category, unitPrice: item.unitPrice });

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post(`/stays/${stayId}/services`, form);
      toast.success('Service added');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionTitle>Add Service</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
        {catalog.map(item => (
          <button
            key={item.name}
            onClick={() => selectCatalog(item)}
            className={`text-left px-2.5 py-2 rounded-lg border text-xs transition-all ${form.name === item.name ? 'border-navy-500 bg-navy-900/30 text-white' : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'}`}
          >
            <div className="font-medium truncate">{item.name}</div>
            <div className="text-slate-500">${item.unitPrice}</div>
          </button>
        ))}
      </div>

      <div className="space-y-2 pt-1">
        <div><label className="label">Service Name</label><input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Qty</label><input type="number" min="1" className="input" value={form.quantity} onChange={e => setForm({...form, quantity: parseInt(e.target.value)})} /></div>
          <div><label className="label">Unit Price ($)</label><input type="number" min="0" step="0.01" className="input" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: parseFloat(e.target.value)})} /></div>
        </div>
        <div className="text-sm text-slate-400">Total: <span className="text-white font-mono">${(form.quantity * form.unitPrice).toFixed(2)}</span></div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
        <button onClick={handleAdd} disabled={loading || !form.name || form.unitPrice <= 0} className="btn-primary flex-1">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main Drawer ──────────────────────────────────────────────────
export default function RightDrawerPanel({ room, onClose, onRefresh }) {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null); // 'checkin' | 'service' | 'checkout'
  const [checkingOut, setCheckingOut] = useState(false);
  const [markingAvailable, setMarkingAvailable] = useState(false);

  const loadDetail = async () => {
    if (!room) return;
    setLoading(true);
    try {
      if (room.stay?._id) {
        const { data } = await api.get(`/stays/${room.stay._id}`);
        setDetail(data.stay);
      } else if (room.activeBooking?._id) {
        const { data } = await api.get(`/bookings/${room.activeBooking._id}`);
        setDetail(data.booking);
      } else {
        setDetail(null);
      }
    } catch (err) {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDetail(); setAction(null); }, [room?._id]);

  const handleCheckout = async () => {
    if (!room?.activeBooking?._id && !detail?.booking?._id) return;
    setCheckingOut(true);
    try {
      const bookingId = room.activeBooking?._id || detail?.booking?._id;
      const { data } = await api.post(`/bookings/${bookingId}/checkout`);
      toast.success('Checked out successfully');
      const stayId = data.stay?._id;
      onRefresh();
      if (stayId) navigate(`/invoice/${stayId}`);
      else onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleMarkAvailable = async () => {
    setMarkingAvailable(true);
    try {
      await api.put(`/rooms/${room._id}/status`, { status: 'available' });
      toast.success('Room marked as available');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error('Failed to update room status');
    } finally {
      setMarkingAvailable(false);
    }
  };

  if (!room) return null;

  const stay = room.status === 'occupied' ? detail : null;
  const booking = detail;

  const statusColors = {
    available: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    occupied: 'text-red-400 bg-red-400/10 border-red-400/20',
    cleaning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    maintenance: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
    reserved: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 drawer-overlay" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-900 border-l border-slate-800 z-50 flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <BedDouble size={18} className="text-slate-300" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-mono">ROOM</div>
              <div className="text-xl font-bold text-white font-mono">{room.roomNumber}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge border capitalize ${statusColors[room.status]}`}>
              {room.status}
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Room Info */}
          <div>
            <SectionTitle>Room Details</SectionTitle>
            <div className="space-y-3">
              <InfoRow icon={BedDouble} label="Room Type" value={<span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${typeColors[room.type]}`}>{room.type}</span>} />
              <InfoRow icon={Star} label="Amenities" value={room.amenities?.slice(0, 4).join(' · ') || '—'} />
              <InfoRow icon={BedDouble} label="Bed Type" value={<span className="capitalize">{room.bedType}</span>} />
              <InfoRow icon={User} label="Capacity" value={`${room.capacity} guests`} />
              <InfoRow icon={CreditCard} label="Rate" value={`$${room.pricePerNight}/night`} />
            </div>
          </div>

          {/* Current stay / booking details */}
          {loading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 size={16} className="animate-spin mr-2" /> Loading...
            </div>
          ) : null}

          {/* OCCUPIED — stay details */}
          {room.status === 'occupied' && !loading && (
            <>
              {action === 'service' ? (
                <AddServiceForm stayId={detail?._id} onSuccess={() => { setAction(null); loadDetail(); onRefresh(); }} onCancel={() => setAction(null)} />
              ) : (
                <>
                  <div>
                    <SectionTitle>Guest</SectionTitle>
                    <div className="space-y-3">
                      <InfoRow icon={User} label="Name" value={`${room.guestName}`} />
                      <InfoRow icon={Mail} label="Email" value={detail?.guest?.email} />
                      <InfoRow icon={Phone} label="Phone" value={detail?.guest?.phone} />
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Stay</SectionTitle>
                    <div className="space-y-3">
                      <InfoRow icon={LogIn} label="Checked In" value={detail?.actualCheckIn ? format(new Date(detail.actualCheckIn), 'MMM d, yyyy HH:mm') : '—'} />
                      <InfoRow icon={LogOut} label="Due Check-Out" value={detail?.plannedCheckOut ? format(new Date(detail.plannedCheckOut), 'MMM d, yyyy') : '—'} />
                      <InfoRow icon={Clock} label="Nights" value={
                        detail?.actualCheckIn && detail?.plannedCheckOut
                          ? `${differenceInDays(new Date(detail.plannedCheckOut), new Date(detail.actualCheckIn))} nights`
                          : '—'
                      } />
                      <InfoRow icon={CreditCard} label="Room Rate" value={`$${detail?.roomRate}/night`} />
                    </div>
                  </div>

                  {/* Services */}
                  {detail?.services?.length > 0 && (
                    <div>
                      <SectionTitle>Services Used</SectionTitle>
                      <div className="space-y-1.5">
                        {detail.services.map(s => (
                          <div key={s._id} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                            <div>
                              <div className="text-sm text-slate-200">{s.name}</div>
                              <div className="text-xs text-slate-500">x{s.quantity} × ${s.unitPrice}</div>
                            </div>
                            <div className="text-sm font-mono text-white">${s.total.toFixed(2)}</div>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 text-sm font-semibold text-white">
                          <span className="text-slate-400">Service Total</span>
                          <span className="font-mono">${detail.services.reduce((s, x) => s + x.total, 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* AVAILABLE — nothing to show */}
          {room.status === 'available' && !loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={22} className="text-emerald-400" />
              </div>
              <div className="text-slate-300 font-medium">Room is Available</div>
              <div className="text-slate-500 text-sm mt-1">Ready to check in a guest</div>
            </div>
          )}

          {/* CLEANING */}
          {room.status === 'cleaning' && !loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={22} className="text-yellow-400" />
              </div>
              <div className="text-slate-300 font-medium">Being Cleaned</div>
              <div className="text-slate-500 text-sm mt-1">Housekeeping in progress</div>
            </div>
          )}

          {/* MAINTENANCE */}
          {room.status === 'maintenance' && !loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-3">
                <Wrench size={22} className="text-slate-400" />
              </div>
              <div className="text-slate-300 font-medium">Under Maintenance</div>
              <div className="text-slate-500 text-sm mt-1">Room temporarily unavailable</div>
            </div>
          )}

          {/* RESERVED — confirmed booking */}
          {room.status === 'reserved' && !loading && action !== 'checkin' && (
            <div>
              <SectionTitle>Reserved Guest</SectionTitle>
              <div className="space-y-3">
                <InfoRow icon={User} label="Name" value={room.guestName} />
                <InfoRow icon={Calendar} label="Check-In" value={room.activeBooking?.checkInDate ? format(new Date(room.activeBooking.checkInDate), 'MMM d, yyyy') : '—'} />
                <InfoRow icon={Calendar} label="Check-Out" value={room.checkOutDate ? format(new Date(room.checkOutDate), 'MMM d, yyyy') : '—'} />
              </div>
            </div>
          )}

          {/* Check-in form */}
          {action === 'checkin' && (
            <CheckInForm room={room} onSuccess={() => { setAction(null); onRefresh(); onClose(); }} onCancel={() => setAction(null)} />
          )}
        </div>

        {/* Footer actions */}
        {action === null && (
          <div className="p-5 border-t border-slate-800 space-y-2">
            {room.status === 'available' && can('admin', 'receptionist') && (
              <button onClick={() => setAction('checkin')} className="btn-success w-full justify-center">
                <LogIn size={15} /> Check In Guest
              </button>
            )}

            {room.status === 'reserved' && can('admin', 'receptionist') && (
              <button onClick={() => setAction('checkin')} className="btn-success w-full justify-center">
                <LogIn size={15} /> Check In Guest
              </button>
            )}

            {room.status === 'occupied' && can('admin', 'receptionist') && (
              <>
                <button onClick={() => setAction('service')} className="btn-secondary w-full justify-center">
                  <Plus size={15} /> Add Service
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="btn-danger w-full justify-center"
                >
                  {checkingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                  Check Out & Invoice
                </button>
              </>
            )}

            {room.status === 'maintenance' && can('admin', 'receptionist') && (
              <button onClick={handleMarkAvailable} disabled={markingAvailable} className="btn-success w-full justify-center">
                {markingAvailable ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Mark as Available
              </button>
            )}

            {room.status === 'cleaning' && can('admin') && (
              <button onClick={handleMarkAvailable} disabled={markingAvailable} className="btn-success w-full justify-center">
                {markingAvailable ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Mark as Available
              </button>
            )}

            {/* Always show maintenance toggle for admin */}
            {room.status === 'available' && can('admin') && (
              <button onClick={() => api.put(`/rooms/${room._id}/status`, { status: 'maintenance' }).then(() => { toast.success('Room set to maintenance'); onRefresh(); onClose(); })} className="btn-secondary w-full justify-center text-slate-400">
                <Wrench size={14} /> Set Maintenance
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
