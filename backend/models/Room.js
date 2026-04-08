const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true },
  floor: { type: Number, required: true },
  type: {
    type: String,
    enum: ['standard', 'deluxe', 'suite', 'executive', 'presidential'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'cleaning', 'maintenance', 'reserved'],
    default: 'available'
  },
  pricePerNight: { type: Number, required: true },
  capacity: { type: Number, default: 2 },
  amenities: [{ type: String }],
  description: { type: String, default: '' },
  bedType: { type: String, enum: ['single', 'double', 'twin', 'king', 'queen'], default: 'double' },
  area: { type: Number, default: 30 }, // sq meters
  view: { type: String, enum: ['city', 'garden', 'pool', 'ocean', 'none'], default: 'none' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
