const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');
const { protect, authorize } = require('../middleware/auth');

// GET /api/stays
router.get('/', protect, async (req, res) => {
  try {
    const stays = await Stay.find()
      .populate('room', 'roomNumber type floor')
      .populate('booking', 'bookingRef guest')
      .sort({ createdAt: -1 });
    res.json({ success: true, stays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/stays/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id)
      .populate('room')
      .populate('booking');
    if (!stay) return res.status(404).json({ success: false, message: 'Stay not found' });
    res.json({ success: true, stay });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/stays/:id/services - Add service to stay
router.post('/:id/services', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ success: false, message: 'Stay not found' });
    if (stay.status !== 'active') return res.status(400).json({ success: false, message: 'Stay is not active' });

    const { name, category, quantity, unitPrice, notes } = req.body;
    const total = quantity * unitPrice;

    stay.services.push({ name, category, quantity, unitPrice, total, addedBy: req.user._id, notes });
    await stay.save();

    res.json({ success: true, stay });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/stays/:id/services/:serviceId
router.delete('/:id/services/:serviceId', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const stay = await Stay.findById(req.params.id);
    if (!stay) return res.status(404).json({ success: false, message: 'Stay not found' });
    stay.services = stay.services.filter(s => s._id.toString() !== req.params.serviceId);
    await stay.save();
    res.json({ success: true, stay });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
