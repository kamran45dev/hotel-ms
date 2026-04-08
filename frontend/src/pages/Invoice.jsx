import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Printer, ArrowLeft, Hotel, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function Invoice() {
  const { stayId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/invoices/${stayId}`)
      .then(({ data }) => setInvoice(data.invoice))
      .catch(() => setError('Invoice not found'))
      .finally(() => setLoading(false));
  }, [stayId]);

  if (loading) return <div className="flex items-center justify-center h-full text-slate-500"><Loader2 className="animate-spin mr-2" size={18} /> Loading invoice...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;

  const { stay, nights, roomCharges, serviceCharges, totalAmount, invoiceNumber, hotel, generatedAt } = invoice;

  return (
    <div className="min-h-full bg-slate-950 p-6">
      {/* Controls - no print */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex-1" />
        <button onClick={() => window.print()} className="btn-primary">
          <Printer size={15} /> Print Invoice
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-2xl mx-auto bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-900 text-white p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-navy-500 to-gold-500 rounded-xl flex items-center justify-center">
                <Hotel size={20} className="text-white" />
              </div>
              <div>
                <div className="font-display text-xl font-bold">{hotel.name}</div>
                <div className="text-slate-400 text-xs">{hotel.address}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Invoice</div>
              <div className="text-xl font-mono font-bold text-gold-400">{invoiceNumber}</div>
              <div className="text-xs text-slate-500 mt-1">{format(new Date(generatedAt), 'MMM d, yyyy HH:mm')}</div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Guest & stay info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Bill To</div>
              <div className="font-semibold text-slate-900">{stay.guest.firstName} {stay.guest.lastName}</div>
              <div className="text-sm text-slate-500">{stay.guest.email}</div>
              <div className="text-sm text-slate-500">{stay.guest.phone}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stay Details</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Room</span>
                  <span className="font-medium">{stay.room?.roomNumber} ({stay.room?.type})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-In</span>
                  <span className="font-medium">{stay.actualCheckIn ? format(new Date(stay.actualCheckIn), 'MMM d, yyyy') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-Out</span>
                  <span className="font-medium">{stay.actualCheckOut ? format(new Date(stay.actualCheckOut), 'MMM d, yyyy') : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium">{nights} night{nights !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Ref</span>
                  <span className="font-mono text-xs">{stay.booking?.bookingRef}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Room charges */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Room Charges</div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Description</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Rate</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium">{stay.room?.type?.charAt(0).toUpperCase() + stay.room?.type?.slice(1)} Room — {stay.room?.roomNumber}</div>
                      <div className="text-xs text-slate-400">Floor {stay.room?.floor}</div>
                    </td>
                    <td className="px-4 py-3 text-right">{nights}</td>
                    <td className="px-4 py-3 text-right">${stay.roomRate?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">${roomCharges?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Services */}
          {stay.services?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Additional Services</div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Service</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Unit</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stay.services.map((s, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-slate-400 capitalize">{s.category}</div>
                        </td>
                        <td className="px-4 py-3 text-right">{s.quantity}</td>
                        <td className="px-4 py-3 text-right">${s.unitPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">${s.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Room Charges</span>
              <span className="font-mono">${roomCharges?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Service Charges</span>
              <span className="font-mono">${serviceCharges?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2 mt-2">
              <span>Total Amount</span>
              <span className="font-mono text-navy-700">${totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
            <div className="font-medium text-slate-600">{hotel.name}</div>
            <div>{hotel.phone} · {hotel.email}</div>
            <div className="mt-1">Thank you for staying with us. We hope to welcome you again.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
