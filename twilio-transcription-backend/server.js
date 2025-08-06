// WebSocket backend for Twilio Video with Google Speech transcription
// This server exposes a token endpoint and a WebSocket for audio streaming.

const fs = require('fs');
const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
const { SpeechClient } = require('@google-cloud/speech');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Twilio access token endpoint
app.get('/token', (req, res) => {
  const identity = req.query.identity || uuidv4();
  const token = new twilio.jwt.AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY,
    process.env.TWILIO_API_SECRET,
    { identity }
  );
  token.addGrant(new twilio.jwt.AccessToken.VideoGrant());
  res.json({ identity, token: token.toJwt() });
});

// Google Speech client for streaming recognition
function createRecognizeStream(ws) {
  const client = new SpeechClient();
  const request = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US'
    },
    interimResults: false
  };

  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      const transcript = data.results[0]?.alternatives[0]?.transcript;
      if (transcript) {
        const payload = JSON.stringify({ transcript });
        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    });

  ws.on('close', () => recognizeStream.end());
  return recognizeStream;
}

// Handle WebSocket connections and stream audio to Google Speech
wss.on('connection', ws => {
  const recognizeStream = createRecognizeStream(ws);

  ws.on('message', message => {
    if (Buffer.isBuffer(message)) {
      recognizeStream.write(message);
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
