import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Plus, Search, X, Loader2, CalendarDays, User,
  BedDouble, Phone, Mail, ChevronDown, RefreshCw
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-400/10' },
  checked_in: { label: 'Checked In', color: 'text-emerald-400 bg-emerald-400/10' },
  checked_out: { label: 'Checked Out', color: 'text-slate-400 bg-slate-400/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-400/10' },
  no_show: { label: 'No Show', color: 'text-orange-400 bg-orange-400/10' },
};

const roomTypes = ['standard', 'deluxe', 'suite', 'executive', 'presidential'];

function BookingModal({ booking, onClose, onSuccess }) {
  const isEdit = !!booking;
  const [form, setForm] = useState(booking ? {
    firstName: booking.guest.firstName,
    lastName: booking.guest.lastName,
    email: booking.guest.email,
    phone: booking.guest.phone,
    idType: booking.guest.idType || 'passport',
    idNumber: booking.guest.idNumber || '',
    nationality: booking.guest.nationality || '',
    checkInDate: format(new Date(booking.checkInDate), 'yyyy-MM-dd'),
    checkOutDate: format(new Date(booking.checkOutDate), 'yyyy-MM-dd'),
    roomType: booking.roomType || 'standard',
    adults: booking.adults || 1,
    children: booking.children || 0,
    source: booking.source || 'walk_in',
    specialRequests: booking.specialRequests || '',
    notes: booking.notes || '',
  } : {
    firstName: '', lastName: '', email: '', phone: '',
    idType: 'passport', idNumber: '', nationality: '',
    checkInDate: format(new Date(), 'yyyy-MM-dd'),
    checkOutDate: '',
    roomType: 'standard', adults: 1, children: 0,
    source: 'walk_in', specialRequests: '', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        guest: {
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone,
          idType: form.idType, idNumber: form.idNumber,
          nationality: form.nationality,
        },
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        roomType: form.roomType,
        adults: form.adults,
        children: form.children,
        source: form.source,
        specialRequests: form.specialRequests,
        notes: form.notes,
      };

      if (isEdit) {
        await api.put(`/bookings/${booking._id}`, payload);
        toast.success('Booking updated');
      } else {
        await api.post('/bookings', payload);
        toast.success('Booking created');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="font-semibold text-white text-lg">{isEdit ? 'Edit Booking' : 'New Booking'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Guest Information</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First Name *</label><input className="input" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
              <div><label className="label">Last Name *</label><input className="input" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
              <div><label className="label">Email *</label><input type="email" className="input" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div><label className="label">Phone *</label><input className="input" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              <div><label className="label">Nationality</label><input className="input" value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} /></div>
              <div>
                <label className="label">ID Type</label>
                <select className="input" value={form.idType} onChange={e => setForm({...form, idType: e.target.value})}>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                </select>
              </div>
              <div className="col-span-2"><label className="label">ID Number</label><input className="input" value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} /></div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Stay Details</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Check-In *</label><input type="date" className="input" required value={form.checkInDate} onChange={e => setForm({...form, checkInDate: e.target.value})} /></div>
              <div><label className="label">Check-Out *</label><input type="date" className="input" required value={form.checkOutDate} min={form.checkInDate} onChange={e => setForm({...form, checkOutDate: e.target.value})} /></div>
              <div>
                <label className="label">Room Type</label>
                <select className="input" value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})}>
                  {roomTypes.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Source</label>
                <select className="input" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                  <option value="walk_in">Walk-In</option>
                  <option value="phone">Phone</option>
                  <option value="online">Online</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <div><label className="label">Adults</label><input type="number" min="1" className="input" value={form.adults} onChange={e => setForm({...form, adults: parseInt(e.target.value)})} /></div>
              <div><label className="label">Children</label><input type="number" min="0" className="input" value={form.children} onChange={e => setForm({...form, children: parseInt(e.target.value)})} /></div>
              <div className="col-span-2"><label className="label">Special Requests</label><textarea className="input resize-none" rows={2} value={form.specialRequests} onChange={e => setForm({...form, specialRequests: e.target.value})} /></div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isEdit ? 'Update' : 'Create'} Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editBooking, setEditBooking] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search) params.append('search', search);
      const { data } = await api.get(`/bookings?${params}`);
      setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold text-white">Bookings</h1>
          <p className="text-slate-400 text-sm">{bookings.length} records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary"><RefreshCw size={14} /></button>
          <button onClick={() => { setEditBooking(null); setShowModal(true); }} className="btn-primary">
            <Plus size={15} /> New Booking
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="input pl-8 text-sm" placeholder="Search guest, ref..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn-secondary">Search</button>
        </form>
        <select className="input text-sm w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Ref', 'Guest', 'Room Type', 'Check-In', 'Check-Out', 'Room', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">Loading...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-500">No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-navy-400">{b.bookingRef}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{b.guest.firstName} {b.guest.lastName}</div>
                    <div className="text-xs text-slate-500">{b.guest.email}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-300">{b.roomType || '—'}</td>
                  <td className="px-4 py-3 text-slate-300">{format(new Date(b.checkInDate), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-slate-300">{format(new Date(b.checkOutDate), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{b.room?.roomNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusConfig[b.status]?.color}`}>{statusConfig[b.status]?.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {b.status === 'confirmed' && (
                        <>
                          <button onClick={() => { setEditBooking(b); setShowModal(true); }} className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors">Edit</button>
                          <button onClick={() => handleCancel(b._id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-400/10 transition-colors">Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <BookingModal
          booking={editBooking}
          onClose={() => { setShowModal(false); setEditBooking(null); }}
          onSuccess={load}
        />
      )}
    </div>
  );
}
