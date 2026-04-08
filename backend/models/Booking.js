const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  idType: { type: String, enum: ['passport', 'national_id', 'drivers_license'], default: 'passport' },
  idNumber: { type: String, default: '' },
  nationality: { type: String, default: '' },
  address: { type: String, default: '' }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, unique: true },
  guest: { type: guestSchema, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null }, // assigned at check-in
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'],
    default: 'confirmed'
  },
  roomType: { type: String, enum: ['standard', 'deluxe', 'suite', 'executive', 'presidential'] },
  specialRequests: { type: String, default: '' },
  source: { type: String, enum: ['walk_in', 'phone', 'online', 'agency'], default: 'walk_in' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
}, { timestamps: true });

// Auto-generate booking reference
bookingSchema.pre('save', async function(next) {
  if (!this.bookingRef) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingRef = `BK${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
