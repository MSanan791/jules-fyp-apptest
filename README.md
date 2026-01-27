## SSD Data Collector – High‑Level Architecture

- **Frontend (mobile)**: Expo/React Native app (`jules-fyp-apptest/ssd-data-collector`) used by clinicians to:
  - manage patients
  - run protocol-based recording sessions
  - upload audio + annotations when a session is finished

- **Backend API**: Node/Express service (`ssd-app-backend`) that:
  - authenticates users with JWT
  - stores patients and sessions in PostgreSQL
  - uploads audio files to AWS S3 and links them to session records

- **Data flow**
  1. User logs into the app → frontend gets a JWT from `/api/auth/login`.
  2. Frontend creates/loads a patient from `/api/patients`.
  3. During a session, audio is recorded locally on the device.
  4. At the end, the app sends `multipart/form-data` to `/api/sessions/finalize` with:
     - audio files
     - word‑level annotations and metadata.
  5. Backend stores rows in Postgres and uploads audio to S3 in a single transaction.
