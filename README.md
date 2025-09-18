# ✈️ Gulf Air App — Frontend (Expo/React Native)

Welcome aboard! This is your interactive boarding pass to the Gulf Air mobile app. Built with Expo + React Native and powered by a FastAPI backend, this app lets you search flights, manage bookings, check in, and track your Falconflyer miles, points, and card tier.

Grab your seat, stow your carry‑on, and let’s take off. 🧳🛫

## 🧭 What’s Onboard

- Smart flight search with clear messages if your chosen date isn’t available
- Manage Booking: reschedule (route/class/seat), cancel & refund with a dedicated screen
- My Trips with real 24‑hour check‑in window and friendly messages
- Check‑in rewards miles and points, with automatic tier upgrades
- Falconflyer dashboard showing miles, points, card tier, and membership number
- Bottom navigation + side menu for smooth traveling around the app

---

## ✅ Pre‑Flight Checklist

- Node.js 18+
- npm (or yarn)
- Expo CLI (via `npx expo` is fine)
- Python 3.11+ with Pipenv (for the backend)

---

## 🗺️ Flight Map (Project Structure)

```
/Users/alyazz/code/ga/projects/capstone
├─ gulf-air-backend/        # FastAPI + SQLAlchemy backend
└─ gulf-air-frontend/       # Expo/React Native app (this repo)
```

---

## 🛠️ Start the Engines — Backend (FastAPI)

Cabin crew, prepare the backend for departure at `http://localhost:8000`.

1) Taxi to the backend folder:
```
cd /Users/alyazz/code/ga/projects/capstone/gulf-air-backend
```

2) Fuel up dependencies:
```
pipenv install --dev
```

3) Load passengers (optional but recommended):
```
pipenv run python seed.py
```

4) Takeoff:
```
pipenv run python main.py
```

Runway lights you’ll see:
- Auth: `/auth/register`, `/auth/login`, `/auth/profile`, `/auth/loyalty`
- Flights: `/api/flights`
- Bookings: `/api/bookings`, `/api/bookings/{id}`, `/api/bookings/{id}/checkin`, `/api/bookings/{id}/reschedule`

---

## 📱 Fasten Seatbelts — Frontend (Expo)

Open a new terminal window:
```
cd /Users/alyazz/code/ga/projects/capstone/gulf-air-frontend
npm install
```

Board the app:
```
npm run start
```

Choose your cabin:
- iOS Simulator: press `i` (Xcode required)
- Android Emulator: press `a` (Android Studio required)
- Web: press `w`

If your backend is on another host/port/device, set the base URL in `utils/api.js`.

---

## 🔐 Crew Roster — Test Users

Seed data creates users with loyalty info (see `gulf-air-backend/data/user_data.py`). Examples:
- `aliaburashid` / `alia123` (email: `burashidalia@gmail.com`)
- Plus: `admin_user`, `john_doe`, `sarah_ahmed`, `mohammed_ali`

Use the app’s `login` screen; a token is stored and used for authenticated requests.

---

## 🧩 Cabins & Compartments — Key Screens

- Home: launch point and quick links
- Book: route/date search, grouped results, clear date‑not‑available message
- My Trips: your bookings + check‑in state and timing
- Manage Booking: full details, reschedule (route/class/seat), cancel & refund
- Cancel Booking: dedicated, branded screen with refund info
- Falconflyer: miles, points, card tier, membership
- Side Menu: accessible from the header

---

## 🏅 Falconflyer — How Rewards Work

- Check‑in calculates miles and points using flight distance, seat class bonus, and tier bonus.
- Card tier is based on loyalty points:
  - BLUE: 0 points
  - SILVER: 500 points
  - GOLD: 1,000 points
  - PLATINUM: 2,000 points
- The check‑in API returns rewards and tier upgrade info; the app shows a celebratory message and offers a shortcut to Falconflyer.

---

## 🛟 In‑Flight Support (Troubleshooting)

- API errors (400/401/500):
  - Ensure backend is up at `http://localhost:8000`.
  - Make sure you’re logged in; re‑login if needed.
  - If data looks stale, run `seed.py` and restart the backend.

- “Cannot connect to server”:
  - Backend might be down or unreachable from your emulator/device.

- Dates/times show N/A:
  - Backend must return ISO‑8601 strings; the app normalizes microseconds and date‑only strings.

- iOS Simulator layout oddities:
  - Try different devices or resetting the simulator. The app uses safe areas and scroll views.

---

## 🧾 Handy Scripts

Frontend:
- `npm run start` — start Expo bundler
- `npm run ios` — open iOS simulator
- `npm run android` — open Android emulator
- `npm run web` — run web build

Backend (in `gulf-air-backend/`):
- `pipenv run python seed.py` — seed the database
- `pipenv run python main.py` — start FastAPI server

---

## 🧰 Tech Behind the Wings

- Frontend: Expo, React Native, expo-router, Axios
- Backend: FastAPI, SQLAlchemy, Pydantic, SQLite, JWT auth (Passlib/pyJWT)

---

## 🧑‍✈️ Captain’s Note

This project was crafted for a capstone — have fun exploring, and enjoy your flight! 🛩️
