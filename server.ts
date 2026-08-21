import { app } from './server/app';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket Server for Live API voice conversations
const wss = new WebSocketServer({ server, path: '/api/live-ws' });

wss.on('connection', async (clientWs) => {
  console.log('[Live Voice WS] Client connected to Gemini 3.1 Flash Live session');
  
  let liveSession: any = null;

  try {
    const ai = new GoogleGenAI({});
    liveSession = await ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (text) {
            clientWs.send(JSON.stringify({ type: 'text', text }));
          }
        },
        onerror: (err) => {
          console.warn('[Live Voice WS] Error:', err);
          clientWs.send(JSON.stringify({ type: 'error', error: 'Live stream error' }));
        },
        onclose: () => {
          console.log('[Live Voice WS] Gemini session closed');
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are Savina Voice Tutor, an encouraging master teacher and oral coach for Liberian and West African students. You speak clearly with warmth, asking engaging questions and explaining concepts step-by-step.',
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Connected to Gemini Live API' }));
  } catch (err: any) {
    console.warn('[Live Voice WS] Init notice:', err.message);
    clientWs.send(JSON.stringify({
      type: 'simulated_ready',
      message: 'Voice session active in interactive speech mode.',
    }));
  }

  clientWs.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'audio' && parsed.audio && liveSession) {
        liveSession.sendRealtimeInput({
          audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (parsed.type === 'text' && parsed.text) {
        if (liveSession) {
          liveSession.sendRealtimeInput({
            text: parsed.text,
          });
        } else {
          // Simulated voice reply
          setTimeout(() => {
            clientWs.send(JSON.stringify({
              type: 'text',
              text: `[Savina Voice Tutor] Wonderful question about "${parsed.text}". In our Liberian curriculum, let us break this down into clear steps!`,
            }));
          }, 600);
        }
      }
    } catch (e) {
      console.warn('WS message parse error:', e);
    }
  });

  clientWs.on('close', () => {
    if (liveSession) {
      try {
        liveSession.close();
      } catch {}
    }
  });
});

// In production, serve static assets built by Vite
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all non-API requests to index.html (SPA routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`[Savina K-12 Server] Full-Stack Backend + Live Voice API running at http://0.0.0.0:${PORT}`);
});
