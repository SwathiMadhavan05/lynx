# LYNX

LYNX is a real-time incident monitoring and response dashboard built for security and operations teams. It combines live alert handling, floor-aware visualization, camera coverage monitoring, staff coordination, and audit logging in a single control-room style interface.

Live deployment:
[https://lynx-76cfa.web.app](https://lynx-76cfa.web.app)

## Overview

The project is designed as the operations layer around a smart surveillance workflow.

Instead of only showing CCTV feeds, LYNX helps teams:

- detect and monitor incidents in real time
- review alerts by floor, camera, and severity
- dispatch staff and resolve incidents
- track camera coverage and system status
- maintain an auditable incident history
- simulate incidents for demos, training, and testing

## Key Features

- Secure staff login using Firebase Authentication
- Real-time dashboard with incident metrics
- Floor-based incident map and live incident feed
- Incidents view with filtering and action workflow
- Cameras view with device status and incident linkage
- Staff directory with duty and assignment visibility
- Audit log drawer with export support
- Demo Mode for simulated incident generation
- Firebase Hosting deployment

## Problem It Solves

Traditional monitoring systems often stop at alert generation or passive surveillance. LYNX focuses on the next step: response orchestration.

It helps operations teams move from:

1. alert detection
2. to visual verification
3. to staff coordination
4. to incident resolution
5. to audit and review

all inside one interface.

## Product Workflow

1. A live or simulated incident is created.
2. The incident is written to Firestore.
3. The dashboard updates in real time.
4. The operator reviews the incident feed and floor map.
5. Staff can acknowledge, dispatch, or resolve the incident.
6. Audit log entries are written for traceability.
7. Camera and staff views reflect the updated operational state.

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend / Cloud

- Firebase Authentication
- Cloud Firestore
- Firebase Realtime Database
- Firebase Cloud Messaging
- Firebase Hosting
- Firebase Functions

## Project Structure

```text
lynx/
├── functions/              # Firebase Functions codebase
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Images and static UI assets
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── data/               # Demo fallback data
│   ├── hooks/              # Firestore/data hooks
│   ├── pages/              # Route-level pages
│   ├── services/           # App services such as simulation engine
│   └── types/              # Shared TypeScript types
├── firebase.json           # Firebase Hosting / Firestore / Functions config
├── firestore.rules         # Firestore security rules
├── seed.mjs                # Seed script for sample Firestore data
└── README.md
```

## Main Screens

### Dashboard

- global metrics
- floor selector
- live floor map
- incident feed
- linked operational context

### Incidents

- incident queue
- floor and status filtering
- response actions

### Cameras

- camera coverage visibility
- online/offline state
- incident count per camera
- fallback demo inventory when Firestore camera data is unavailable

### Staff

- on-duty staff visibility
- assignment count
- fallback demo roster when Firestore staff data is unavailable

### Settings

- system notes and operational overview

## Demo Mode

Demo Mode generates simulated incidents using the local simulation engine.

This makes the system easier to:

- demonstrate in presentations
- train operators
- validate the response flow
- test UI updates without live production data

The simulation engine writes incidents into Firestore and uses camera context when available. If Firestore camera data is missing, the app falls back to built-in demo camera data so the UI remains usable.

## Fallback Data Behavior

Some sections include built-in fallback datasets to keep the MVP demo-friendly when Firebase collections are empty or unreadable.

Fallback-enabled sections:

- Cameras
- Staff

This is especially useful for demos when Firestore rules, missing seed data, or incomplete setup would otherwise leave pages blank.

## Local Development

### Prerequisites

- Node.js
- npm
- Firebase project access

### Install dependencies

```bash
npm install
cd functions && npm install
```

### Environment setup

Create a `.env.local` file with Firebase config values similar to:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

### Start the app

```bash
npm run dev
```

The local app usually runs at:
[http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
```

This outputs the production build into the `dist/` folder.

## Firebase Deployment

This project is configured for Firebase Hosting with:

- `dist` as the hosting public directory
- SPA rewrite to `index.html`
- cache headers for static assets

Deploy command:

```bash
npx firebase-tools deploy --only hosting --project lynx-76cfa
```

## Seed Data

The project includes a seed script:

```bash
node seed.mjs
```

It can populate sample:

- cameras
- staff
- incidents
- audit logs

This is useful if you want the Firestore-backed screens to show real project data instead of fallback demo data.

## Security Rules

The repo includes:

- `firestore.rules`
- `database.rules.json`

These define access for incidents, cameras, staff, and audit logs.

## Current MVP Notes

- The app is deployed and working on Firebase Hosting.
- Some pages include fallback demo data for resilience.
- Real camera video playback is not fully wired yet; camera records currently represent metadata and operational state.
- The current MVP is optimized for demos, incident workflow visualization, and real-time dashboard behavior.

## Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` previews the production build locally

## Repository

GitHub:
[https://github.com/SwathiMadhavan05/lynx](https://github.com/SwathiMadhavan05/lynx)

## Future Improvements

- real video feed integration
- stronger Firestore error handling and recovery
- richer analytics and reporting
- role-based admin controls
- multi-site / multi-building support
- mobile-optimized operator workflows

## License

This repository currently does not define a separate license file.
