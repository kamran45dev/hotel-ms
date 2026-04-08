const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Room = require('../models/Room');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_ms';

const users = [
  { name: 'Admin User', email: 'admin@hotel.com', password: 'admin123', role: 'admin' },
  { name: 'Sarah Chen', email: 'receptionist@hotel.com', password: 'recept123', role: 'receptionist' },
  { name: 'James Okafor', email: 'housekeeping@hotel.com', password: 'house123', role: 'housekeeping' },
  { name: 'Maria Santos', email: 'maria@hotel.com', password: 'maria123', role: 'receptionist' },
];

const roomTypes = ['standard', 'deluxe', 'suite', 'executive', 'presidential'];
const bedTypes = ['single', 'double', 'twin', 'king', 'queen'];
const views = ['city', 'garden', 'pool', 'ocean', 'none'];

const priceMap = {
  standard: 120,
  deluxe: 200,
  suite: 350,
  executive: 500,
  presidential: 900,
};

const amenitiesMap = {
  standard: ['WiFi', 'TV', 'Air Conditioning', 'Mini Fridge'],
  deluxe: ['WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Bathtub', 'Safe'],
  suite: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Jacuzzi', 'Living Room', 'Safe', 'Espresso Machine'],
  executive: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Jacuzzi', 'Living Room', 'Office Desk', 'Safe', 'Espresso Machine', 'Butler Service'],
  presidential: ['WiFi', 'Smart TV', 'Air Conditioning', 'Full Bar', 'Private Pool', 'Living Room', 'Dining Room', 'Kitchen', 'Safe', 'Espresso Machine', 'Butler Service', 'Private Terrace'],
};

function generateRooms() {
  const rooms = [];
  const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  // Floor layout: floors 1-3: standard (10 rooms each)
  // floors 4-8: deluxe (10 rooms each)
  // floors 9-12: suite (8 rooms each)
  // floors 13-14: executive (6 rooms each)
  // floor 15: presidential (4 rooms)

  const floorConfig = {
    1: { type: 'standard', count: 10 },
    2: { type: 'standard', count: 10 },
    3: { type: 'standard', count: 10 },
    4: { type: 'deluxe', count: 10 },
    5: { type: 'deluxe', count: 10 },
    6: { type: 'deluxe', count: 10 },
    7: { type: 'deluxe', count: 10 },
    8: { type: 'deluxe', count: 10 },
    9: { type: 'suite', count: 8 },
    10: { type: 'suite', count: 8 },
    11: { type: 'suite', count: 8 },
    12: { type: 'suite', count: 8 },
    13: { type: 'executive', count: 6 },
    14: { type: 'executive', count: 6 },
    15: { type: 'presidential', count: 4 },
  };

  const statuses = ['available', 'available', 'available', 'occupied', 'cleaning', 'maintenance', 'available', 'available', 'occupied', 'available'];
  let statusIdx = 0;

  floors.forEach(floor => {
    const { type, count } = floorConfig[floor];
    for (let i = 1; i <= count; i++) {
      const roomNum = `${floor}${String(i).padStart(2, '0')}`;
      const status = statuses[statusIdx % statuses.length];
      statusIdx++;

      rooms.push({
        roomNumber: roomNum,
        floor,
        type,
        status,
        pricePerNight: priceMap[type],
        capacity: type === 'presidential' ? 6 : type === 'suite' ? 4 : type === 'executive' ? 4 : 2,
        amenities: amenitiesMap[type],
        bedType: type === 'standard' ? 'double' : type === 'deluxe' ? 'queen' : 'king',
        area: type === 'standard' ? 28 : type === 'deluxe' ? 40 : type === 'suite' ? 65 : type === 'executive' ? 90 : 180,
        view: views[Math.floor(Math.random() * views.length)],
        description: `Elegant ${type} room on floor ${floor} with modern amenities.`,
      });
    }
  });

  return rooms;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Room.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create rooms
    const rooms = generateRooms();
    const createdRooms = await Room.create(rooms);
    console.log(`🏨 Created ${createdRooms.length} rooms`);

    console.log('\n✨ Seed complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:        admin@hotel.com / admin123');
    console.log('Receptionist: receptionist@hotel.com / recept123');
    console.log('Housekeeping: housekeeping@hotel.com / house123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
