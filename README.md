# VITC Smart Commute

An independent student project: a map-first web application for tracking VIT Chennai college buses.

*This project is not affiliated with VIT Chennai or its transport operator.*

## Features

- Live fleet map with bus markers
- Bus details and ETA
- Bus and route search
- My Fleet favourites
- Proximity notifications
- Bus sharing
- Crowd reports
- Analytics
- Freshers Mode
- Admin interface for student fleet requests and bus management

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Maps:** Leaflet / MapLibre
- **Backend:** Node.js, Express, TypeScript
- **Data storage:** JSON-based configuration and data files

## Prerequisites

- Node.js 20 or later
- npm

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file by copying `.env.example`.

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

Configure the required environment variables and authorised GPS tracking URLs in `.env`, following the examples in `.env.example`.

Start the backend:

```bash
npm run dev
```

The backend runs on port `5000` by default.

### 2. Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

If required, configure `VITE_API_BASE_URL` in the frontend environment. Its default is `http://localhost:5000`.

## Environment Variables

Refer to `backend/.env.example` for the current configuration.

Variables include:

- `VAMOSYS_API_URL`
- `PAIZOGPS_API_URL`
- `ADMIN_API_KEY`
- `GPS_REFRESH_INTERVAL_MS` — optional; defaults to `60000` ms
- Per-bus tracking URL configuration

## Admin Access

Protected admin endpoints require the `x-admin-key` request header to match `ADMIN_API_KEY`.

The shared-key authentication mechanism is intended for demonstration purposes, not production deployment.

## Limitations

- The Commute Planner is not implemented.
- Live tracking depends on GPS provider availability and valid tracking data.
- Some functionality may use mock GPS data.
- Admin authentication uses a shared key and requires stronger authentication for production use.

## Disclaimer

This is an independent student project developed for educational purposes. It is not an official VIT Chennai application and is not affiliated with the university or its transport operator.
