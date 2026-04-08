const express = require('express');
const router = express.Router();
const Stay = require('../models/Stay');
const { protect } = require('../middleware/auth');

// GET /api/services/catalog - predefined services
router.get('/catalog', protect, (req, res) => {
  const catalog = [
    { name: 'Room Service - Breakfast', category: 'food', unitPrice: 35 },
    { name: 'Room Service - Lunch', category: 'food', unitPrice: 45 },
    { name: 'Room Service - Dinner', category: 'food', unitPrice: 55 },
    { name: 'Minibar Items', category: 'minibar', unitPrice: 15 },
    { name: 'Laundry - Shirt', category: 'laundry', unitPrice: 8 },
    { name: 'Laundry - Suit', category: 'laundry', unitPrice: 20 },
    { name: 'Laundry - Express', category: 'laundry', unitPrice: 30 },
    { name: 'Spa Treatment', category: 'spa', unitPrice: 120 },
    { name: 'Airport Transfer', category: 'transport', unitPrice: 60 },
    { name: 'Parking - Daily', category: 'transport', unitPrice: 25 },
    { name: 'Extra Bed', category: 'other', unitPrice: 40 },
    { name: 'Late Checkout Fee', category: 'other', unitPrice: 50 },
  ];
  res.json({ success: true, catalog });
});

module.exports = router;
