# ArenaFlow AI

ArenaFlow AI is a smart fan experience platform for large-scale sporting venues. Built with React, Tailwind CSS, Firebase, and Gemini AI.

## Features
- **Fan Mode**: Get AI routing recommendations based on live stadium crowd data, check live gate queue lengths, and use the Fan AI Concierge chat.
- **Staff Mode**: Monitor stadium crowd density using the SVG live heatmap, view global metrics, and get AI-suggested actions for high-capacity zones.
- **Accessibility Integration**: Built-in voice prompts and dynamic UI scaling for visually impaired users.
- **Real-Time Synchronization**: Connects to Firebase Realtime Database for live heatmap data mirroring.

## Setup Instructions

### 1. External APIs (Gemini)
Obtain a Gemini API Key from Google AI Studio.

### 2. Database (Firebase Realtime DB)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Realtime Database**.
3. Under the **Rules** tab, ensure you have read/write enabled for testing:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
4. Register a Web App in Firebase and copy the configuration details.

### 3. Environment Variables
Rename `.env.example` to `.env` and fill in your keys:
```env
VITE_GEMINI_API_KEY=your_gemini_key

VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_domain
VITE_FIREBASE_DATABASE_URL=your_firebase_db_url
VITE_FIREBASE_PROJECT_ID=your_firebase_project
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 4. Running Locally
```bash
npm install
npm run dev
```
*Note: The application will automatically push simulated crowd data to your Firebase database every 8 seconds if successfully connected.*

## Deployment

### 1. Firebase Hosting (Recommended)
This platform is set up for rapid deployment via Firebase Hosting. Assuming you have the Firebase CLI installed:
```bash
npm run build
firebase login
firebase deploy
```

### 2. Google Cloud Run (Docker)
A production `Dockerfile` is also included if you prefer containerized deployment (defaults to port 8080).
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/arenaflow-ai
gcloud run deploy arenaflow-ai \
    --image gcr.io/YOUR_PROJECT_ID/arenaflow-ai \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```
