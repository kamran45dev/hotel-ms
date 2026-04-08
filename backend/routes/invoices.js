const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// GET /api/invoices/:stayId
router.get('/:stayId', protect, async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.stayId)
      .populate('room', 'roomNumber type floor pricePerNight')
      .populate('booking', 'bookingRef guest checkInDate checkOutDate adults children')
      .populate('checkedInBy', 'name')
      .populate('checkedOutBy', 'name');

    if (!stay) return res.status(404).json({ success: false, message: 'Stay not found' });

    const nights = stay.totalNights || Math.max(1, Math.ceil(
      ((stay.actualCheckOut || new Date()) - stay.actualCheckIn) / (1000 * 60 * 60 * 24)
    ));
    const roomCharges = stay.roomCharges || nights * stay.roomRate;
    const serviceCharges = stay.serviceCharges || stay.services.reduce((sum, s) => sum + s.total, 0);
    const totalAmount = stay.totalAmount || roomCharges + serviceCharges;

    const invoice = {
      invoiceNumber: `INV-${stay._id.toString().slice(-8).toUpperCase()}`,
      stay,
      nights,
      roomCharges,
      serviceCharges,
      totalAmount,
      generatedAt: new Date(),
      hotel: {
        name: 'Grand Azure Hotel',
        address: '123 Luxury Boulevard, City Center',
        phone: '+1 (555) 123-4567',
        email: 'reservations@grandazure.com',
        website: 'www.grandazure.com'
      }
    };

    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
