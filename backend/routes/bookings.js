const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Stay = require('../models/Stay');
const HousekeepingTask = require('../models/HousekeepingTask');
const { protect, authorize } = require('../middleware/auth');

// Check room availability for date range
async function checkRoomAvailability(roomId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    room: roomId,
    status: { $in: ['confirmed', 'checked_in'] },
    $or: [
      { checkInDate: { $lt: new Date(checkOut) }, checkOutDate: { $gt: new Date(checkIn) } }
    ]
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const conflict = await Booking.findOne(query);
  return !conflict;
}

// GET /api/bookings
router.get('/', protect, async (req, res) => {
  try {
    const { status, date, search } = req.query;
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      const d = new Date(date); d.setHours(0,0,0,0);
      const dEnd = new Date(date); dEnd.setHours(23,59,59,999);
      filter.$or = [
        { checkInDate: { $gte: d, $lte: dEnd } },
        { checkOutDate: { $gte: d, $lte: dEnd } }
      ];
    }
    if (search) {
      filter.$or = [
        { 'guest.firstName': new RegExp(search, 'i') },
        { 'guest.lastName': new RegExp(search, 'i') },
        { 'guest.email': new RegExp(search, 'i') },
        { bookingRef: new RegExp(search, 'i') }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate('room', 'roomNumber type floor')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/today
router.get('/today', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

    const checkIns = await Booking.find({
      checkInDate: { $gte: today, $lte: todayEnd },
      status: { $in: ['confirmed', 'checked_in'] }
    }).populate('room', 'roomNumber type');

    const checkOuts = await Booking.find({
      checkOutDate: { $gte: today, $lte: todayEnd },
      status: 'checked_in'
    }).populate('room', 'roomNumber type');

    res.json({ success: true, checkIns, checkOuts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('createdBy', 'name role');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const stay = await Stay.findOne({ booking: req.params.id }).populate('room');
    res.json({ success: true, booking, stay });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings
router.post('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, ...rest } = req.body;

    if (room) {
      const available = await checkRoomAvailability(room, checkInDate, checkOutDate);
      if (!available) return res.status(400).json({ success: false, message: 'Room not available for selected dates' });
    }

    const booking = await Booking.create({
      ...rest, room: room || null, checkInDate, checkOutDate, createdBy: req.user._id
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id
router.put('/:id', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    if (room && checkInDate && checkOutDate) {
      const available = await checkRoomAvailability(room, checkInDate, checkOutDate, req.params.id);
      if (!available) return res.status(400).json({ success: false, message: 'Room not available for selected dates' });
    }
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'checked_in') return res.status(400).json({ success: false, message: 'Cannot cancel a checked-in booking' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/bookings/:id/checkin
router.post('/:id/checkin', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { roomId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'confirmed') return res.status(400).json({ success: false, message: 'Booking must be confirmed to check in' });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.status !== 'available') return res.status(400).json({ success: false, message: 'Room is not available' });

    // Check availability
    const available = await checkRoomAvailability(roomId, booking.checkInDate, booking.checkOutDate, booking._id);
    if (!available) return res.status(400).json({ success: false, message: 'Room not available for these dates' });

    // Update booking
    booking.room = roomId;
    booking.status = 'checked_in';
    await booking.save();

    // Update room status
    room.status = 'occupied';
    await room.save();

    // Create stay
    const stay = await Stay.create({
      booking: booking._id,
      room: roomId,
      guest: {
        firstName: booking.guest.firstName,
        lastName: booking.guest.lastName,
        email: booking.guest.email,
        phone: booking.guest.phone
      },
      actualCheckIn: new Date(),
      plannedCheckIn: booking.checkInDate,
      plannedCheckOut: booking.checkOutDate,
      roomRate: room.pricePerNight,
      checkedInBy: req.user._id
    });

    res.json({ success: true, booking, stay, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/bookings/:id/checkout
router.post('/:id/checkout', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'checked_in') return res.status(400).json({ success: false, message: 'Booking must be checked in to check out' });

    const stay = await Stay.findOne({ booking: booking._id, status: 'active' });
    if (!stay) return res.status(404).json({ success: false, message: 'Active stay not found' });

    const checkOutTime = new Date();
    const nights = Math.max(1, Math.ceil((checkOutTime - stay.actualCheckIn) / (1000 * 60 * 60 * 24)));
    const roomCharges = nights * stay.roomRate;
    const serviceCharges = stay.services.reduce((sum, s) => sum + s.total, 0);
    const totalAmount = roomCharges + serviceCharges;

    stay.actualCheckOut = checkOutTime;
    stay.status = 'checked_out';
    stay.totalNights = nights;
    stay.roomCharges = roomCharges;
    stay.serviceCharges = serviceCharges;
    stay.totalAmount = totalAmount;
    stay.checkedOutBy = req.user._id;
    await stay.save();

    booking.status = 'checked_out';
    await booking.save();

    const room = await Room.findById(booking.room);
    if (room) {
      room.status = 'cleaning';
      await room.save();

      // Create housekeeping task
      await HousekeepingTask.create({
        room: room._id,
        type: 'checkout_clean',
        priority: 'high',
        createdBy: req.user._id,
        checklistItems: [
          { label: 'Change bed linens', completed: false },
          { label: 'Clean bathroom', completed: false },
          { label: 'Vacuum floors', completed: false },
          { label: 'Restock amenities', completed: false },
          { label: 'Check minibar', completed: false },
          { label: 'Inspect for damage', completed: false }
        ]
      });
    }

    res.json({ success: true, booking, stay });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
