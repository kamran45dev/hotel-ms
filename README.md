# 🏨 Grand Azure — Hotel Management System

A full-stack staff-only hotel management system built for large hotels (150+ rooms). Features a visual room board, real-time occupancy tracking, booking management, housekeeping workflows, and printable invoices.

---

## 🛠 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS      |
| Backend   | Node.js + Express                   |
| Database  | MongoDB + Mongoose                  |
| Auth      | JWT (JSON Web Tokens)               |

---

## 👥 Staff Roles

| Role          | Access                                                 |
|---------------|--------------------------------------------------------|
| Admin         | Full access — all modules + user management            |
| Receptionist  | Bookings, check-in/out, services, invoices             |
| Housekeeping  | View & complete housekeeping tasks                     |

---

## ✨ Features

- **Visual Room Board** — Full-screen grid grouped by floor, color-coded by status
- **Right-Slide Drawer** — Click any room for full detail panel with contextual actions
- **Booking Management** — Create, edit, cancel bookings; overlap prevention
- **Check-In / Check-Out** — Assign rooms, create stays, generate invoices
- **Housekeeping** — Task queue, start/complete workflow, auto-room status update
- **Services** — Add food, laundry, spa, transport charges to active stays
- **Printable Invoices** — Itemized room + service charges, print-ready layout
- **Dashboard** — Live stats, occupancy rate, today's arrivals/departures

---

## 🚀 Running Locally

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone / Extract

```bash
cd hotel-ms
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hotel_ms
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Seed the database** (creates rooms + staff accounts):

```bash
npm run seed
```

**Start the backend:**

```bash
npm run dev       # Development (with nodemon)
# or
npm start         # Production
```

Backend runs on: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

### 4. Login Credentials

| Role          | Email                       | Password    |
|---------------|-----------------------------|-------------|
| Admin         | admin@hotel.com             | admin123    |
| Receptionist  | receptionist@hotel.com      | recept123   |
| Housekeeping  | housekeeping@hotel.com      | house123    |

---

## 🏗 Project Structure

```
hotel-ms/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Booking.js
│   │   ├── Stay.js
│   │   └── HousekeepingTask.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── rooms.js          ← includes /board endpoint
│   │   ├── bookings.js       ← includes checkin/checkout
│   │   ├── stays.js          ← service management
│   │   ├── housekeeping.js
│   │   ├── services.js       ← service catalog
│   │   ├── invoices.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js           ← JWT + RBAC
│   ├── utils/
│   │   └── seed.js
│   ├── server.js
│   └── .env.example
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── RoomBoard.jsx     ← main feature
        │   ├── Bookings.jsx
        │   ├── Housekeeping.jsx
        │   └── Invoice.jsx
        ├── components/
        │   ├── Layout.jsx        ← sidebar nav
        │   ├── RoomCard.jsx
        │   └── RightDrawerPanel.jsx
        ├── context/
        │   └── AuthContext.jsx
        └── utils/
            └── api.js
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/auth/login       | Staff login          |
| GET    | /api/auth/me          | Get current user     |

### Rooms
| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| GET    | /api/rooms/board?date=    | Room board with occupancy    |
| GET    | /api/rooms                | All rooms                    |
| PUT    | /api/rooms/:id/status     | Update room status           |

### Bookings
| Method | Endpoint                      | Description          |
|--------|-------------------------------|----------------------|
| GET    | /api/bookings                 | List bookings        |
| POST   | /api/bookings                 | Create booking       |
| PUT    | /api/bookings/:id             | Update booking       |
| PUT    | /api/bookings/:id/cancel      | Cancel booking       |
| POST   | /api/bookings/:id/checkin     | Check in guest       |
| POST   | /api/bookings/:id/checkout    | Check out + invoice  |

### Stays
| Method | Endpoint                          | Description        |
|--------|-----------------------------------|--------------------|
| GET    | /api/stays/:id                    | Stay details       |
| POST   | /api/stays/:id/services           | Add service charge |

### Housekeeping
| Method | Endpoint                          | Description        |
|--------|-----------------------------------|--------------------|
| GET    | /api/housekeeping                 | List tasks         |
| PUT    | /api/housekeeping/:id/start       | Start task         |
| PUT    | /api/housekeeping/:id/complete    | Complete + set available |

### Invoices
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/invoices/:stayId | Generate invoice    |

---

## ☁️ Deployment

### Option A: Railway (Recommended — free tier)

**Backend:**
1. Push `backend/` to a GitHub repo
2. Create new Railway project → Deploy from GitHub
3. Set environment variables in Railway dashboard:
   - `MONGODB_URI` — use MongoDB Atlas connection string
   - `JWT_SECRET` — a strong random string
   - `CLIENT_URL` — your frontend URL
4. Railway auto-detects Node.js and runs `npm start`

**Frontend:**
1. Set `VITE_API_URL` in `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
2. Push `frontend/` to GitHub
3. Deploy on **Vercel** or **Netlify** → connect repo → build command: `npm run build`, publish dir: `dist`

---

### Option B: Render

**Backend:**
1. New Web Service → connect GitHub repo (backend folder)
2. Build command: `npm install`
3. Start command: `node server.js`
4. Add env vars (same as above)

**Frontend:**
1. New Static Site → connect GitHub repo (frontend folder)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`

---

### Option C: VPS / Self-hosted

```bash
# Backend (with PM2)
cd backend
npm install
npm install -g pm2
pm2 start server.js --name hotel-api
pm2 save

# Frontend (build + serve with nginx)
cd frontend
npm run build
# Copy dist/ to nginx web root
```

Sample nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/hotel-ms/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### MongoDB Atlas (Cloud DB)

1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user + whitelist IP (0.0.0.0/0 for cloud deploy)
3. Get connection string → use as `MONGODB_URI`
4. Run seed: `MONGODB_URI=<atlas-uri> npm run seed`

---

## 🔒 Security Notes for Production

- Change `JWT_SECRET` to a strong random 64+ character string
- Set `NODE_ENV=production`
- Use HTTPS in production
- Restrict MongoDB Atlas IP whitelist to your server IP
- Change all default seed passwords

---

## 🏨 Seed Data Overview

- **150 rooms** across 15 floors
- Floor 1–3: Standard (30 rooms) — $120/night
- Floor 4–8: Deluxe (50 rooms) — $200/night
- Floor 9–12: Suite (32 rooms) — $350/night
- Floor 13–14: Executive (12 rooms) — $500/night
- Floor 15: Presidential (4 rooms) — $900/night
- Mixed statuses seeded for demo (available, occupied, cleaning, maintenance)
