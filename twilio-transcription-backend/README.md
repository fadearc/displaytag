# Twilio Transcription Backend

Example Node.js backend that issues Twilio Video access tokens and exposes a WebSocket endpoint that streams audio to the Google Speech API for real-time transcription.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables in a `.env` file:
   ```bash
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_KEY=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_API_SECRET=your_api_secret
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-service-account.json
   PORT=3000
   ```
3. Start the server:
   ```bash
   npm start
   ```

The server provides a `/token` endpoint for obtaining a Twilio Video token and a WebSocket endpoint on the same port for streaming 16-bit 16kHz linear PCM audio. Transcribed text is broadcast to all connected clients.
