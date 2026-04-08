const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Stay = require('../models/Stay');
const { protect, authorize } = require('../middleware/auth');

// GET /api/rooms/board?date=YYYY-MM-DD
router.get('/board', protect, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const dateStart = new Date(date); dateStart.setHours(0,0,0,0);
    const dateEnd = new Date(date); dateEnd.setHours(23,59,59,999);

    const rooms = await Room.find({ isActive: true }).sort({ floor: 1, roomNumber: 1 });

    // Get active stays for this date
    const activeStays = await Stay.find({
      status: 'active',
      plannedCheckIn: { $lte: dateEnd },
      plannedCheckOut: { $gte: dateStart }
    }).populate('booking').populate('room');

    // Get confirmed bookings (not yet checked in) for this date
    const confirmedBookings = await Booking.find({
      status: 'confirmed',
      room: { $ne: null },
      checkInDate: { $lte: dateEnd },
      checkOutDate: { $gte: dateStart }
    });

    const stayMap = {};
    activeStays.forEach(stay => {
      if (stay.room) stayMap[stay.room._id.toString()] = stay;
    });

    const bookingMap = {};
    confirmedBookings.forEach(b => {
      if (b.room) bookingMap[b.room.toString()] = b;
    });

    const boardRooms = rooms.map(room => {
      const rid = room._id.toString();
      const stay = stayMap[rid];
      const booking = bookingMap[rid];

      let guestName = null;
      let checkOutDate = null;
      let stayData = null;

      if (stay) {
        guestName = `${stay.guest.firstName} ${stay.guest.lastName}`;
        checkOutDate = stay.plannedCheckOut;
        stayData = {
          _id: stay._id,
          plannedCheckIn: stay.plannedCheckIn,
          plannedCheckOut: stay.plannedCheckOut,
          actualCheckIn: stay.actualCheckIn,
          roomRate: stay.roomRate,
          services: stay.services,
          booking: stay.booking
        };
      } else if (booking) {
        guestName = `${booking.guest.firstName} ${booking.guest.lastName}`;
        checkOutDate = booking.checkOutDate;
      }

      return {
        ...room.toObject(),
        guestName,
        checkOutDate,
        stay: stayData,
        activeBooking: booking || null
      };
    });

    // Group by floor
    const floors = {};
    boardRooms.forEach(room => {
      if (!floors[room.floor]) floors[room.floor] = [];
      floors[room.floor].push(room);
    });

    res.json({ success: true, rooms: boardRooms, floors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isActive: true }).sort({ floor: 1, roomNumber: 1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/rooms/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/rooms
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/rooms/:id
router.put('/:id', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/rooms/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
