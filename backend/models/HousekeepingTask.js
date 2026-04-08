const mongoose = require('mongoose');

const housekeepingTaskSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  type: { type: String, enum: ['checkout_clean', 'daily_clean', 'inspection', 'deep_clean'], default: 'checkout_clean' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date, default: null },
  notes: { type: String, default: '' },
  checklistItems: [{
    label: String,
    completed: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('HousekeepingTask', housekeepingTaskSchema);
