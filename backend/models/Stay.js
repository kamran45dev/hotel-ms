const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['food', 'laundry', 'spa', 'transport', 'minibar', 'other'], default: 'other' },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, { _id: true });

const staySchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guest: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  actualCheckIn: { type: Date },
  actualCheckOut: { type: Date },
  plannedCheckIn: { type: Date, required: true },
  plannedCheckOut: { type: Date, required: true },
  services: [serviceSchema],
  status: {
    type: String,
    enum: ['active', 'checked_out'],
    default: 'active'
  },
  roomRate: { type: Number, required: true },
  totalNights: { type: Number },
  roomCharges: { type: Number },
  serviceCharges: { type: Number },
  totalAmount: { type: Number },
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkedOutBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Stay', staySchema);
