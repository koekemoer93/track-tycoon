# 🏁 Track Tycoon

Track Tycoon is a web + mobile app built for managing daily operations, staff, and inventory across multiple go-karting tracks.  
It features real-time task tracking, stock control, and role-based dashboards for employees and owners.

---

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
