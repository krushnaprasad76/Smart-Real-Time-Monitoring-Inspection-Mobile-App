# Smart Street Sentinel: Real-Time Monitoring & Inspection Mobile App

A high-performance, mobile-first municipal infrastructure monitoring and field inspection system. Designed for smart city street problems—including streetlights, drainage overflow, water pipeline leakages, road potholes, and electrical grid faults—with live simulated IoT socket telemetry, interactive civic map, dual inspector/citizen workflows, and persistent sensor audit logging.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural plan integrates the user's confirmed selections: dual inspector/citizen mode, interactive city map with live sensor pins, all five infrastructure categories, and a full-stack Next.js database with local persistence.

- **Confirmed Mode**: Dual-Role Architecture supporting **Municipal Field Crews & Supervisors** (work order audits, sensor threshold adjustments, sign-offs) and **Citizen Reporters** (rapid photo/location issue reporting and ticket tracking).
- **Primary Visualization**: Interactive vector city ward map with real-time sensor pins, telemetry bottom sheets, and status filters.
- **Monitored Infrastructure Categories**:
  1. **Smart Streetlights**: Lux levels, voltage fluctuation, lamp outage alerts.
  2. **Drainage & Floods**: Storm drain water levels, silt clog flow sensors.
  3. **Water Leakage**: Acoustic acoustic leak sensors and main pressure drop detection.
  4. **Potholes & Pavement**: Road surface roughness index and physical audit reports.
  5. **Electrical Grid**: Transformer load/temperature and cable fault detection.
- **Real-Time Telemetry & Sockets**: Bidirectional simulated WebSocket engine streaming live city sensor readings at 1Hz–2Hz, featuring real-time civic disaster/fault simulation (e.g. Flash Flood, 4th St Blackout, Water Main Burst).
- **Persistence & API**: Full-stack Next.js backend (`/api/sensors`, `/api/issues`, `/api/inspections`, `/api/logs`) with persistent local sync and offline queue.

---

## 1. Overview & Core Concept

### What It Does
The Smart Street Sentinel mobile app gives city engineers, field maintenance crews, and citizens a unified platform to detect, verify, inspect, and resolve civic hazards. Field inspectors view live IoT telemetry from thousands of street nodes on an interactive map, get automated anomaly alerts, conduct multi-point digital field audits with photo evidence, and dispatch repair crews. Citizens can report neighborhood hazards with geotagging and track municipal resolution progress.

### Target Audience & Persona
- **Municipal Field Inspectors & Crews**: Technicians responding to street issues, validating sensor warnings, and performing equipment replacements.
- **Public Works Supervisors**: Operations managers monitoring ward-level health and approving completed maintenance reports.
- **Citizens & Commuters**: Residents reporting street defects (potholes, flooded curbs, dark streetlights) directly from mobile browsers.

### Key Value
- **Early Hazard Mitigation**: Sensors catch underground water leaks and electrical transformer overheating before visible street collapse or fires occur.
- **Seamless Field Ergonomics**: 44px+ hitboxes, thumb-zone bottom sheet drawers, and offline-tolerant log queue for field crews on mobile devices.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Role Switcher & Profile Bar**: Seamlessly toggle between **Field Inspector** (diagnostic tools, sensor telemetry, inspection checklist) and **Citizen Reporter** (quick issue report form, my reports tracker).
2. **Interactive Ward Map View**:
   - Pan/zoom street map with categorized pins (Amber for Warning, Red for Critical, Blue for Nominal).
   - Category filter pills (Streetlights, Drainage, Water, Potholes, Electrical).
   - Tapping any node opens the **Slide-Up Telemetry Drawer** displaying live streaming metrics, recent incident history, and direct "Start Inspection" or "Report Issue" action.
3. **Live Telemetry & Anomaly Tripwire Engine**:
   - Live streaming sparkline charts for water levels, acoustic leak dB, line voltage, and road vibration.
   - Fault simulator controls: Inject "Heavy Storm Overflow", "Substation Surge", or "Main Water Pipe Rupture" to observe real-time alarms.
4. **Step-by-Step Field Inspection Audit**:
   - Asset verification (Node ID, Street address, GPS coordinates).
   - Multi-point checklist (Visual integrity, sensor calibration, electrical grounding, structural seal).
   - Photo attachment and severity tagging (Minor, Moderate, Critical Hazard).
   - Digital inspector sign-off and instant status change from "Critical" to "Inspected / In Repair".
5. **Citizen Report Flow**:
   - 3-step rapid report: Pick category -> Snap/upload photo & GPS location -> Add description.
   - Status tracker: "Reported" -> "Assigned to Crew" -> "Resolved".
6. **Historical Sensor Logs & Analytics**:
   - Searchable, tabular sensor event log with export capabilities (CSV/JSON).

### Visual Identity & Theme
- **Aesthetic Direction**: High-legibility civic utility — dark slate command center palette with distinct municipal safety signal colors.
- **Color Palette**:
  - Dominant Neutral Canvas (60%): `#0B0F19` (Deep Charcoal Navy)
  - Structural Surfaces (30%): `#141C2E` (Field Card Slate) with `#1F293D` hairline borders
  - Civic Semantic Accents (10%):
    - Streetlights: Electric Amber `#F59E0B`
    - Drainage & Water: Cyan / Azure `#06B6D4` / `#3B82F6`
    - Potholes & Roads: Industrial Orange `#F97316`
    - Electrical Grid: Neon Purple `#A855F7`
    - Hazard Alerts: Emergency Red `#EF4444`
    - Nominal Normal: Emerald Green `#10B981`
- **Typography & Formatting**:
  - Headings & Wordmarks: `Plus Jakarta Sans` (bold, clean title case)
  - Body & UI Controls: `Plus Jakarta Sans` (14px–16px, high-contrast)
  - Sensor Telemetry & Coordinates: `font-mono tabular-nums` for precise live numbers
- **Mobile Ergonomics**:
  - Fixed bottom navigation bar with 4 core destinations: **Map View**, **Live Telemetry**, **Inspections & Reports**, **Sensor Logs**.
  - All interactive elements $\ge 44\text{px}$ touch hitbox; sticky elements within 15% mobile viewport cap.
  - Seamless desktop preview container with mobile framing toggle (iPhone / Android / Responsive view).

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Interactive SVG-Vector City Ward Map vs External Map Tiles
- *Chosen Approach*: Rich interactive vector-based municipal map component featuring real street coordinate grids, landmark street names (Oak St, Broadway, 5th Ave, Waterfront Canal), clustered sensor nodes, and real-time pulsed alerts.
- *Why*: Instant load times, zero third-party API key failures or rate limits, and custom styling matching the dark tactical aesthetic.
- *Alternatives Considered*: Google Maps / Mapbox — avoided due to API key dependency and external billing requirements in self-contained applets.

### Decision 2: Real-Time Telemetry Socket Emulator
- *Chosen Approach*: High-frequency client/server socket loop with configurable sample interval (500ms to 2000ms), packet sequence counters, and live anomaly injection.
- *Why*: Provides genuine real-time live data visualization and telemetry graphing without requiring physical IoT hardware connected to the build environment.

### Decision 3: Local + Session Persistent Database Sync
- *Chosen Approach*: Full-stack Next.js API endpoints (`/api/sensors`, `/api/issues`, `/api/inspections`, `/api/logs`) backed by localStorage and IndexedDB fallback.
- *Why*: User explicitly requested full-stack Next.js database with persistent local and session logs. Changes survive page reloads and simulated offline field conditions.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│               SMART STREET SENTINEL - MUNICIPAL PLATFORM               │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
           ┌─────────────────────────┴─────────────────────────┐
           ▼                                                   ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────┐
│       Mobile UI Layer (Touch 44px)   │     │    Real-Time Socket Streamer      │
│  - Dual Role Bar (Inspector/Citizen) │     │  - Sensor Heartbeat (1Hz)         │
│  - Ward Vector Map & Sensor Nodes    │◄───►│  - Anomaly & Fault Injector       │
│  - Slide-Up Telemetry Drawer         │     │  - Critical Threshold Alarms      │
│  - Inspection & Citizen Report Forms │     │  - Packet Transmission Stats      │
└──────────────────┬───────────────────┘     └─────────────────┬─────────────────┘
                   │                                           │
                   ▼                                           ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────┐
│     Client State & Local Storage     │     │     Next.js Full-Stack REST API   │
│  - Active User & Role State          │     │  - GET/POST /api/sensors          │
│  - Offline Issue/Audit Queue         │◄───►│  - GET/POST /api/issues           │
│  - Local Cache & Audit History       │     │  - GET/POST /api/inspections      │
│  - Device Frame Toggle State         │     │  - GET/POST /api/logs             │
└──────────────────────────────────────┘     └───────────────────────────────────┘
```

### Data Entities
- **StreetAssetNode**:
  - `id`: unique ID (e.g. `SL-104`, `DR-209`, `WL-042`, `PH-018`, `EL-301`)
  - `name`: Human label (e.g. "Main & 4th St Streetlight Array", "Canal Storm Drain Basin B")
  - `category`: `'streetlight'` | `'drainage'` | `'water_leak'` | `'pothole'` | `'electrical'`
  - `location`: `{ address: string, ward: string, x: number, y: number, lat: number, lng: number }`
  - `status`: `'nominal'` | `'warning'` | `'critical'` | `'under_inspection'` | `'resolved'`
  - `lastInspected`: string (ISO date)
  - `assignedCrew`: string
- **LiveTelemetryData**:
  - `nodeId`: string
  - `timestamp`: number
  - `metrics`: `{ [key: string]: number }` (e.g. `lux`, `currentDraw`, `waterLevelCm`, `flowRateLpm`, `acousticDb`, `vibrationRms`, `transformerTempC`, `gridLoadPct`)
  - `alertStatus`: string
- **FieldInspection**:
  - `id`: string
  - `nodeId`: string
  - `inspectorName`: string
  - `inspectorBadge`: string
  - `checklist`: array of `{ id: string, label: string, passed: boolean, measurement?: string, notes?: string }`
  - `severity`: `'low'` | `'medium'` | `'high'` | `'critical'`
  - `evidencePhotos`: string[]
  - `signature`: string
  - `timestamp`: string
- **CitizenReport**:
  - `id`: string
  - `category`: string
  - `address`: string
  - `description`: string
  - `photoUrl`: string
  - `reporterName`: string
  - `status`: `'pending'` | `'investigating'` | `'repaired'`
  - `createdAt`: string
