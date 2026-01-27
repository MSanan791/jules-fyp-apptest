# SSD Data Collector – Frontend

Simple React Native (Expo) app used by speech therapists to manage patients and record SSD assessment sessions, then upload audio + metadata to the backend.

## Tech stack

- **Framework**: Expo (React Native) with TypeScript  
- **Navigation**: `expo-router`  
- **Audio**: `expo-av`  

## Run locally

```bash
cd jules-fyp-apptest/ssd-data-collector
npm install
npx expo start --tunnel
```

The app expects the backend at the URL configured in `config/api.ts`.  
On a physical device, use your machine’s LAN IP (not `localhost`).
