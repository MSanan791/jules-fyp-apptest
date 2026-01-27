# SSD Data Collector – Backend API

Node/Express REST API used by the mobile app for auth, patient management and uploading SSD recording sessions (audio + annotations).

## Tech stack

- **Runtime**: Node.js + Express  
- **Database**: PostgreSQL (Sequelize)  
- **Storage**: AWS S3 for audio files  

## Run locally

```bash
cd ssd-app-backend
npm install
cp .env.example .env    # or create .env manually
npx sequelize-cli db:migrate
npm start               # or node server.js
```

The server listens on `http://localhost:3000` by default and exposes routes under `/api` (auth, patients, sessions).***
