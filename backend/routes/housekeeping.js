const express = require('express');
const router = express.Router();
const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

// GET /api/housekeeping
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    // Housekeeping staff only see their own tasks or unassigned
    if (req.user.role === 'housekeeping') {
      filter.$or = [{ assignedTo: req.user._id }, { assignedTo: null }];
    }

    const tasks = await HousekeepingTask.find(filter)
      .populate('room', 'roomNumber type floor status')
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/housekeeping
router.post('/', protect, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const task = await HousekeepingTask.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/housekeeping/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await HousekeepingTask.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('room', 'roomNumber type floor status');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/housekeeping/:id/complete
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = 'completed';
    task.completedAt = new Date();
    await task.save();

    // Update room to available
    await Room.findByIdAndUpdate(task.room, { status: 'available' });

    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/housekeeping/:id/start
router.put('/:id/start', protect, async (req, res) => {
  try {
    const task = await HousekeepingTask.findByIdAndUpdate(
      req.params.id,
      { status: 'in_progress', assignedTo: req.user._id },
      { new: true }
    ).populate('room', 'roomNumber type floor');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
