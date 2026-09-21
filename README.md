# Smart Water & Drainage Management System
### B.Tech Community Service Project (CSP) — Ramaswami Peta, Rajanagaram

**Location:** Ramaswami Peta, near Rajanagaram, East Godavari District, Andhra Pradesh, India  
**Project Topic:** Water Scarcity and Drainage Problems  
**Architecture:** Offline-First Local Civic-Tech Management Platform  

---

## 1. Project Overview

The **Smart Water & Drainage Management System** is an offline-first civic-tech management platform specifically developed for Ramaswami Peta, Rajanagaram Mandal, East Godavari District. The platform addresses chronic civic challenges identified during empirical field surveys:
1. **Acute Summer Water Scarcity:** 62.0% of surveyed households report severe water shortages during summer months.
2. **Poor Drainage & Vector Menace:** 46.6% of households report unmaintained drains, and 55.8% report stagnant water near homes leading to mosquito breeding and viral fevers.
3. **Delayed Grievance Redressal:** Lack of a transparent local tracking mechanism between residents and the Panchayat/Municipal engineers.

This software runs **100% offline** on a local computer with **zero external dependencies**, no CDN links, no online map services, and no internet-based authentication.

---

## 2. Architecture & Technology Stack

```
                 SMART WATER & DRAINAGE SYSTEM
                              │
             ┌────────────────┴────────────────┐
             │                                 │
        RESIDENT                            ADMIN
    (resident / resident123)            (admin / admin123)
             │                                 │
             └──────────────┬──────────────────┘
                            │
                     React + JavaScript (Vite)
                     No CDN / No External Assets
                            │
                  Localhost API (Port 8000)
                            │
                       FastAPI
                            │
                   Rule-Based Priority Engine
                            │
                     SQLite3 Database
                 (database/water_drainage.db)
          ┌─────────────────┼──────────────────┐
          │                 │                  │
     Complaints       208 Survey Data     Notifications
   & Update History   & Demographics      & Awareness
          │                 │                  │
          └─────────────────┼──────────────────┘
                            │
              Offline SVG Interactive Charts
                            │
          Offline SVG Community Locality Map
            (Ramaswami Peta Prototype Map)
```

- **Frontend:** React 18, JavaScript (no TypeScript), Pure CSS Design System (`App.css`).
- **Backend:** Python 3, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic, PBKDF2-HMAC-SHA256 password hashing.
- **Database:** SQLite3 (`database/water_drainage.db`).
- **Charts:** Offline pure SVG and CSS interactive charts (`DonutChart`, `BarChart`, `HorizontalBarChart`, `TrendLineChart`).
- **Map:** Offline Prototype Community Map of Ramaswami Peta built using pure SVG with interactive pins, roads, and landmarks.
- **Priority Engine:** Deterministic rule-based priority engine classifying complaints into High, Medium, or Low severity.

---

## 3. Demo Credentials

| Role | Username / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Resident** | `resident` | `resident123` | Dashboard, Report Problem, My Complaints, Community Map, Survey Results, Awareness, Notifications, Profile |
| **Admin** | `admin` | `admin123` | Executive Dashboard, Manage Complaints (Triage & Status Transitions), Water Monitoring, Drainage Monitoring, Survey Analytics, Community Map, Reports & Offline CSV Export, Notifications, Profile |

> Both roles can also be loaded with 1 click using the **Demo Credentials** buttons on the login screen.

---

## 4. Step-by-Step Demonstration Workflow

Follow this 18-step workflow to verify all system components:

1. **Start the Application:** Double-click `start_offline.bat` (or start backend and frontend separately).
2. **Login as Resident:** Click `Resident: resident / resident123` on the login screen, then click **LOGIN AS RESIDENT**.
3. **Navigate to Report Problem:** Click **Report Problem** on the sidebar or **Report Drainage Issue** on the dashboard.
4. **Select Category:** Click **Drainage**.
5. **Select Problem Type:** Choose **Blocked Major Drain**.
6. **Enter Location:** Select `Main Road Junction, near Ramaswami Temple` from the suggestions.
7. **Enter Description:** Enter `The main stormwater drain along the temple road is severely clogged with silt. Overflowing onto the street.`
8. **Observe Live Priority Preview:** Notice the Rule-Based Priority System automatically flags this as **HIGH**.
9. **Submit:** Click **Submit Complaint (Save to SQLite)**.
10. **Note Reference ID:** A unique ID is generated (e.g., `CMP-2026-0042`) with status `Pending`.
11. **Check My Complaints:** Open **My Complaints** and see the newly created complaint.
12. **Check Community Map:** Open **Community Issues** to see the interactive pin placed on Ramaswami Peta's map.
13. **Logout:** Click **Logout** in the bottom left of the sidebar.
14. **Login as Admin:** Click `Admin: admin / admin123`, then click **LOGIN AS ADMIN**.
15. **Open Manage Complaints:** Navigate to **Manage Complaints** to view the triage board.
16. **Advance Status:**
    - Click **Update** on the complaint -> change status from `Pending` to `Assigned` (assign to `Ward 3 Sanitation Crew`).
    - Click **Update** again -> change to `In Progress` (add comment: `Desilting machine deployed`).
    - Click **Update** again -> change to `Resolved` (add comment: `Drain cleaned and flow restored`).
17. **Verify History & Export:**
    - Open **Complaint Details** to view the 4-step status timeline (`Submitted` → `Assigned` → `In Progress` → `Resolved`).
    - Go to **Reports & Export** and click **Export Offline CSV** to download `complaints_report_ramaswami_peta.csv`.
18. **Resident Confirmation:** Log out and log back in as `resident`. Notice the resolved status and the new notification in the notification center.

---

## 5. How to Run Locally

### Option A: Using the Windows Batch Script
Double-click `start_offline.bat`. It will automatically:
- Launch the FastAPI backend on `http://127.0.0.1:8000`
- Launch the React frontend on `http://127.0.0.1:5173`
- Open your default web browser to the application

### Option B: Manual Terminal Execution

#### Terminal 1 (Backend):
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

---

## 6. Troubleshooting

- **Backend not running message in frontend:**
  Ensure the FastAPI server is running on port 8000. Test with `http://127.0.0.1:8000/health`.
- **Port 8000 or 5173 already in use:**
  Close conflicting processes or specify alternative local ports in `backend/main.py` and `frontend/vite.config.js`.
- **Database Reset:**
  To reset all data to default seed state, delete `database/water_drainage.db` and restart the backend.

---

## 7. Offline Map Data Setup

The **Smart Water & Drainage Management System** features a **100% Offline GIS & Satellite Mapping Engine** that operates with zero internet connectivity and zero external map tile servers (no Google Maps API, no OpenStreetMap CDN, no Mapbox).

### 7.1 Folder Structure & File Locations

All offline map assets are stored locally within the project repository:

```
smart-water-drainage/
├── frontend/
│   ├── public/
│   │   └── maps/
│   │       ├── locations.json         # Offline geographic index & autocomplete database
│   │       └── india-geo.json         # Vector GIS boundaries, rivers, highways, & survey area
│   └── src/
│       ├── assets/
│       │   └── maps/
│       │       └── ramaswami-peta-map.png  # Authentic local high-resolution satellite survey
│       └── components/
│           ├── OfflineIndiaMap.jsx    # Level 1: Vector GIS canvas with LOD, pan, zoom, & search
│           └── OfflineMap.jsx         # Level 2: Satellite imagery with complaint markers & pins
└── map-data/                          # Archival & offline data staging directory
    ├── india/
    │   └── india-geo.json
    ├── states/
    ├── districts/
    └── locations/
        └── locations.json
```

### 7.2 Supported File Formats

1. **GeoJSON (`.json` / `.geojson`):**
   - The primary vector format used by the application for state boundaries, district polygons, river paths, national highways, and locality boundaries.
   - Files are parsed directly in the browser using SVG rendering for 60fps hardware-accelerated zoom and pan.
2. **Raster / Satellite Imagery (`.png`, `.jpg`, `.webp`):**
   - Used for Level 2 high-resolution ground surveys of Ramaswami Peta.
   - Placed in `frontend/src/assets/maps/` and bundled directly by Vite into the offline build.
3. **MBTiles / PMTiles (Optional Extension):**
   - For ultra-dense raster/vector tile packages (e.g. statewide zoom 0–18), MBTiles/PMTiles can be converted into GeoJSON layers or extracted into `frontend/public/maps/tiles/{z}/{x}/{y}.pbf` for local serving.

### 7.3 How to Add New Districts, Mandals, or Villages

To add a new locality (e.g., another mandal or village in Andhra Pradesh):

1. **Add to the Search & Navigation Index (`frontend/public/maps/locations.json`):**
   Add a JSON entry with coordinates and search keywords:
   ```json
   {
     "id": "AP-EG-KOR",
     "name": "Korukonda",
     "type": "town",
     "parent": "AP-EG",
     "state": "Andhra Pradesh",
     "district": "East Godavari",
     "lat": 17.1667,
     "lng": 81.8333,
     "zoom": 11,
     "description": "Temple town in East Godavari district",
     "keywords": ["korukonda", "temple", "east godavari"]
   }
   ```
2. **Add Boundary Vectors (`frontend/public/maps/india-geo.json`):**
   Add a `Feature` to the `features` array:
   ```json
   {
     "type": "Feature",
     "id": "AP-EG-KOR",
     "properties": {
       "name": "Korukonda Mandal",
       "type": "district_subdivision",
       "level": 3
     },
     "geometry": {
       "type": "Polygon",
       "coordinates": [[[81.80, 17.15], [81.85, 17.20], [81.82, 17.12], [81.80, 17.15]]]
     }
   }
   ```

### 7.4 How the System Detects Installed Map Data

1. **Automated Offline Initialization:**
   Upon loading the **Community Map** page, the application automatically performs local HTTP GET requests to `/maps/locations.json` and `/maps/india-geo.json`.
2. **Graceful Fallback:**
   If a specific boundary layer is not yet installed in `public/maps/`, the map gracefully falls back to the national and state vector paths and renders location pins based on mathematical projection.
3. **Zero Configuration Required:**
   All default files for India, Andhra Pradesh, East Godavari, Rajanagaram, Kanavaram, and Ramaswami Peta are pre-installed and ready out-of-the-box.

### 7.5 Running Completely Offline

1. Ensure Python (3.9+) and Node.js (18+) are installed on your machine.
2. Disconnect your computer from Wi-Fi / Ethernet to verify offline capabilities.
3. Execute `start_offline.bat` (or run backend on port 8000 and frontend on port 5173).
4. Navigate to **Community Issues** in the sidebar:
   - Use the **Search Bar** to find "East Godavari", "Andhra Pradesh", "Rajanagaram", or "3WHH+7P6".
   - Zoom in and pan across India down to Ramaswami Peta.
   - Click **🛰️ Switch to Satellite View** to inspect the high-resolution survey map and local complaint pins.

