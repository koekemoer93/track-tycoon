# 🏁 Track Tycoon

Track Tycoon is a web + mobile app built for managing daily operations, staff, and inventory across multiple go-karting tracks.  
It features real-time task tracking, stock control, and role-based dashboards for employees and owners.

---
🛠 Track Tycoon – Stock Room Feature Update (Aug 2, 2025)
✅ New Features Added Today
📦 Revamped StockRoomPage UI

Glassmorphic dashboard-style layout

Category summary cards (Drinks, Spares, Cleaning, Uncategorized)

Responsive grid layout for stock items (3 per row)

Live progress bars showing stock quantities

Category-colored bars (clean and minimal)

➕ Add Stock Form

Add new stock items with name, quantity, category

Auto-syncs to Firestore

🔁 Transfer Stock Form

Select stock item

Choose destination track

Transfer quantity directly to track inventory

📥 CSV Stock Importer (already implemented earlier)

Import bulk stock from CSV via StockImportPage.js

📊 UI Design
Matched Apple-style dark theme with glassmorphic panels

Fully responsive design with modern layout

Clean, intuitive structure consistent with TrackDashboard
## 🚀 Live Features (As of Latest Commit)

### ✅ Authentication
- Firebase Authentication (Login & Register)
- OTP-based role assignment
- Role-based redirects (Owner/Admin → Dashboard, Employees → Checklist)

### ✅ Role Management
- Roles: owner, manager, marshal, mechanic, cleaner, HR
- `isAdmin` access flag for elevated features (StockRoom, Track Analytics)

### ✅ Dashboard System
- 📊 **Owner Dashboard** with progress rings (Tasks, Shopping, Cleanliness)
- 👷 **Employee Dashboard** with daily tasks by role & track
- 🧠 Apple Fitness-inspired UI

### ✅ Real-Time Daily Tasks
- Role-based checklist templates per day (loaded from Firestore)
- Tasks are saved with checkbox progress
- Optional image upload per task (coming soon)

### ✅ Shopping List Requests
- Employees request stock (e.g. “2x engine oil”)
- Stored under each `tracks/{trackId}/shoppingList`
- Linked to the StockRoom for fulfillment

### ✅ StockRoom System (Admin-Only)
- View & manage central inventory (`stockRoom` collection)
- Transfer stock to individual tracks (updates `trackStock`)
- View all pending shopping requests from tracks
- ✅ Fulfill requests with one click
- ✅ Move fulfilled items to `fulfilledRequests` subcollection
- Timestamped fulfillment log
- Category filter (Drinks, Spares, Cleaning)

### ✅ Firestore Data Structure
- `users/{uid}` → role, name, track, isAdmin
- `tracks/{trackId}` → metadata + shoppingList
- `stockRoom/{itemId}` → quantity, category, trackStock
- `templates/{trackId}_{role}_{day}` → dynamic checklist templates

---

## 🛠 Tech Stack

- **React.js**
- **Firebase Auth**
- **Firebase Firestore**
- **Firebase Storage** (image upload coming soon)
- **React Router**
- **CSS** (custom dark Apple-style theme)

---

## 🔒 Access Control

| Role     | Access                                           |
|----------|--------------------------------------------------|
| Owner    | Full access to all dashboards & StockRoom        |
| Manager  | Same as owner (via `isAdmin`)                    |
| Others   | Employee Checklist & Track-specific tasks only   |

---
