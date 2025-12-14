# SSD Data Collector - API Documentation

This document details the RESTful API endpoints for the SSD Data Collector application.

## 🔗 Base URL
All endpoints are prefixed with `/api`.
* **Local Development:** `http://<YOUR_IP>:3000/api`
* **Production:** `https://your-production-url.com/api`

## 🔐 Authentication
Most endpoints require a valid **JSON Web Token (JWT)**.
* **Header:** `Authorization`
* **Value:** `Bearer <your_token_here>`

---

## 1. Authentication Endpoints

### Login
Authenticates a Therapist and returns a JWT token for session access.

* **Endpoint:** `POST /auth/login`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "email": "therapist@example.com",
    "password": "password123"
  }
Success Response (200 OK):

JSON

{
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": 1,
    "name": "Dr. Smith",
    "email": "therapist@example.com"
  }
}
Error Response (401 Unauthorized):

JSON

{ "msg": "Invalid credentials" }
2. Patient Management Endpoints
Get All Patients
Retrieves a list of all patients assigned to the logged-in therapist.

Endpoint: GET /patients

Access: Protected (Requires Token)

Request Headers:

Authorization: Bearer <token>

Success Response (200 OK):

JSON

[
  {
    "id": 101,
    "name": "Test Patient",
    "age": 5,
    "gender": "Male",
    "primary_language": "English",
    "initial_diagnosis": "Mild SSD",
    "createdAt": "2025-01-01T10:00:00Z"
  },
  ...
]
Create New Patient
Registers a new patient under the current therapist's care.

Endpoint: POST /patients

Access: Protected (Requires Token)

Request Headers:

Authorization: Bearer <token>

Content-Type: application/json

Request Body:

JSON

{
  "name": "Jane Doe",
  "age": 6,
  "gender": "Female",
  "primary_language": "Spanish",
  "initial_ssd_type": "Phonological Disorder"
}
Success Response (201 Created):

JSON

{
  "message": "Patient created successfully",
  "patient": {
    "id": 102,
    "name": "Jane Doe",
    ...
  }
}
Get Patient Details
Retrieves specific details for a single patient.

Endpoint: GET /patients/:id

Access: Protected (Requires Token)

Params: id (Integer) - The Patient ID

Success Response (200 OK): returns the patient object.

Get Patient Sessions
Retrieves a history of recording sessions for a specific patient.

Endpoint: GET /patients/:id/sessions

Access: Protected (Requires Token)

Params: id (Integer) - The Patient ID

Success Response (200 OK):

JSON

[
  {
    "id": 50,
    "date": "2025-02-14",
    "final_diagnosis": "Improved",
    "upload_status": "COMPLETED"
  }
]
3. Session & Recording Endpoints (Atomic Upload)
Finalize & Upload Session
This is a multipart/form-data request. It performs an "Atomic Transaction":

Creates a Session record in PostgreSQL.

Uploads all 52 audio files to AWS S3.

Creates 52 Recording entries in PostgreSQL linking the file URLs. If any step fails, the entire operation is rolled back.

Endpoint: POST /sessions/finalize

Access: Protected (Requires Token)

Request Headers:

Authorization: Bearer <token>

Content-Type: multipart/form-data

Form Data Fields:

patientId (Text): ID of the patient (e.g., "101").

annotations (Text/JSON String): A stringified JSON array containing metadata for each word.

JSON

[
  { "word": "Cat", "transcription": "Kat", "errorType": "None" },
  { "word": "Dog", "transcription": "Log", "errorType": "Substitution" }
]
audio_files (File[]): The binary audio files (WAV or M4A).

Note: The order of files must match the order of the annotations array.

Success Response (200 OK):

JSON

{
  "message": "Session uploaded successfully",
  "sessionId": 55,
  "recordingsSaved": 52
}
Error Response (500 Internal Server Error):

JSON

{ "error": "Transaction failed: S3 Upload Error" }
