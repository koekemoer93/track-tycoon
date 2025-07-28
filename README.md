# 🏁 Track Tycoon — Go-Karting Operations App

**Track Tycoon** is a full-featured web + mobile app for managing employee tasks, track operations, stock control, and analytics across multiple go-kart tracks.

---

## ✅ Features Completed (as of July 28, 2025)

### 🧑‍💼 Authentication
- Combined **Login/Register page** with dark Apple-style UI
- **Role-based OTP verification** for: Owner, Manager, Mechanic, Marshal, HR
- Firebase Auth integrated with Firestore user documents

### 🎯 Owner Dashboard
- Inspired by Apple Fitness Summary UI
- Displays:
  - 🟣 Tasks Done ring
  - 🔵 Shopping Requests ring
  - 🟢 Cleanliness ring
- Tracks listed below rings with progress bars
- Clickable to open per-track pages
- Fully themed to match dark fitness design

### ✅ Role-Based Pages
- Owner and Admins see the **full dashboard + stock control**
- Employees redirected to **EmployeeDashboard** showing daily tasks
- RoleRedirect logic built to route users based on their Firestore `role`

### 🛒 Stock Control Room
- Centralized stock management
- Add new stock (name, quantity, category)
- Transfer stock to specific tracks
- Track-specific inventory counters
- 🔔 Auto-updating shopping requests list
- ✅ Fulfill requests from within UI
- 💡 Filters by category (e.g., drinks, spares, cleaning)
- New **top-of-page product catalog summary** with low stock alerts

### 📦 Track Pages
- Checklist system per role (e.g., marshal, mechanic, cleaner)
- Tasks saved to Firestore per user
- Circular progress indicators
- Real-time shopping list with Firestore sync
- Image upload to Firebase Storage
- All progress saved by user/track

### 🧭 Navigation
- Top navigation bar with icons:
  - Dashboard
  - Employee Tasks
  - Stock Room
- Active tab highlight
- Routes:
  - `/` → AuthPage
  - `/dashboard` → Owner dashboard
  - `/employee-dashboard` → Employee view
  - `/stockroom` → Stock Control
  - `/track/:trackId` → Track-specific page

---

## 🛠 Tech Stack

- React.js (frontend)
- Firebase Auth + Firestore + Storage
- React Router DOM
- React Circular Progressbar
- Custom CSS (dark UI inspired by Apple Fitness app)

---

## 🚧 Upcoming Features

- Admin role and admin panel
- Real-time location check-ins
- Task approval workflow
- Signature capture, file uploads, recurring tasks
- Analytics per role, track, and week
- PDF report export
- Mobile responsiveness

---

## 📂 GitHub Management

All code is backed up regularly using proper commits.  
Design inspired by Apple Health/Fitness, but tailored to go-kart track ops.