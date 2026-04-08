const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Stay = require('../models/Stay');
const HousekeepingTask = require('../models/HousekeepingTask');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

    const [
      totalRooms,
      roomsByStatus,
      todayCheckIns,
      todayCheckOuts,
      pendingHousekeeping,
      recentBookings,
      occupancyData
    ] = await Promise.all([
      Room.countDocuments({ isActive: true }),
      Room.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.countDocuments({ checkInDate: { $gte: today, $lte: todayEnd }, status: 'confirmed' }),
      Booking.countDocuments({ checkOutDate: { $gte: today, $lte: todayEnd }, status: 'checked_in' }),
      HousekeepingTask.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      Booking.find({ status: { $in: ['confirmed', 'checked_in'] } })
        .sort({ createdAt: -1 }).limit(5)
        .populate('room', 'roomNumber type'),
      // Last 7 days occupancy
      Stay.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    const statusMap = {};
    roomsByStatus.forEach(r => { statusMap[r._id] = r.count; });

    res.json({
      success: true,
      stats: {
        totalRooms,
        available: statusMap.available || 0,
        occupied: statusMap.occupied || 0,
        cleaning: statusMap.cleaning || 0,
        maintenance: statusMap.maintenance || 0,
        reserved: statusMap.reserved || 0,
        todayCheckIns,
        todayCheckOuts,
        pendingHousekeeping,
        occupancyRate: totalRooms > 0 ? Math.round(((statusMap.occupied || 0) / totalRooms) * 100) : 0
      },
      recentBookings,
      occupancyData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
