# SSD Data Collector - Frontend (Mobile App)

A React Native (Expo) mobile application designed for Speech Therapists (SLPs) to collect high-quality audio datasets for Speech Sound Disorder (SSD) detection. The app facilitates patient management, session recording (52 specific words), and secure atomic uploads to the cloud.

## 📱 Technical Stack

* **Framework:** [Expo](https://expo.dev/) (React Native)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
* **Animations:** `react-native-reanimated`
* **Audio:** `expo-av`
* **Storage:** `expo-secure-store` (Auth tokens), `expo-file-system`
* **Navigation:** `expo-router` (File-based routing)

## 🚀 Prerequisites

* [Node.js](https://nodejs.org/) (LTS recommended)
* [Expo Go](https://expo.dev/client) app installed on your physical device (iOS/Android) or an Emulator/Simulator.

## 🔌 API Endpoints

For detailed documentation on all available endpoints, request bodies, and response examples, please refer to the full API Documentation:

👉 **[View Complete API Documentation](./API_docs.md)**

### Quick Overview
* **Auth:** `POST /api/auth/login`
* **Patients:** `GET /api/patients`, `POST /api/patients`
* **Sessions:** `POST /api/sessions/finalize` (Atomic Upload)

## 🛠️ Installation & Setup

1.  **Clone the repository** (if not already done).
2.  **Navigate to the project directory:**
    ```bash
    cd ssd-data-collector
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## ⚙️ Configuration

The application communicates with a backend server. You must configure the API URL to point to your local machine or production server.

1.  Open `services/AuthService.ts`, `services/PatientService.ts`, and `services/SessionService.ts`.
2.  Update the `API_URL` constant.
    * **Physical Device:** Use your computer's local IP address (e.g., `http://192.168.1.5:3000/api`). **Do not use `localhost`**.
    * **Emulator:** You can use `http://10.0.2.2:3000/api` (Android) or `http://localhost:3000/api` (iOS).

## 🏃‍♂️ Running the App

1.  **Start the development server:**
    ```bash
    npx expo start
    ```
2.  **Scan the QR code:**
    * Use the **Expo Go** app on your Android/iOS device to scan the QR code displayed in the terminal.
    * Or press `a` for Android Emulator, `i` for iOS Simulator.

## 📂 Project Structure

```text
ssd-data-collector/
├── app/                    # Expo Router screens (File-based routing)
│   ├── _layout.tsx         # Root layout (Auth Provider + Gesture Handler)
│   ├── index.tsx           # Entry point
│   └── (screens...)        # Login, Home, Recording, etc.
├── components/
│   ├── screens/            # Screen implementations
│   └── ui/                 # Reusable UI components (AnimatedButton, StyledInput)
├── context/                # React Context (AuthContext)
├── services/               # API integrations (Auth, Patient, Session)
├── store/                  # State management (SessionStore)
└── assets/                 # Images and fonts
```
✨ Key Features
Secure Authentication: JWT-based login with token storage via SecureStore.

Patient Management: Create and list patients with demographic data.

Guided Recording: Step-by-step recording interface for the 52-word protocol.

Fluid UI: Animations and micro-interactions using Reanimated.

Atomic Uploads: Consolidates audio files and metadata for transaction-safe uploads.

🐛 Known Issues / Notes
Expo AV Warning: You may see a deprecation warning for expo-av. This is expected in newer Expo SDKs; migration to expo-audio is planned for future releases.
