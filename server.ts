import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { getLanIp } from './server/lanIp';
import { generateObsFiles } from './server/generator';

export interface ScoreboardState {
  team1_name: string;
  team2_name: string;
  team1_score: number;
  team2_score: number;
  timer: number;
  timer_running: boolean;
}

// Authoritative in-memory state initialized with standard defaults
let currentState: ScoreboardState = {
  team1_name: 'TEAM 1',
  team2_name: 'TEAM 2',
  team1_score: 0,
  team2_score: 0,
  timer: 30,
  timer_running: false,
};

const app = express();
app.use(express.json());

const HTTP_PORT = 3000;
const WS_PORT = 8765;
const detectedLanIp = getLanIp();

// All active WebSocket clients (from standalone port 8765 and HTTP upgrade /ws)
const activeClients = new Set<WebSocket>();

function broadcastState(state: ScoreboardState) {
  currentState = { ...currentState, ...state };
  const payload = JSON.stringify(currentState);

  for (const client of activeClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payload);
      } catch (err) {
        console.error('[WS Broadcast] Error sending to client:', err);
      }
    }
  }
}

function handleNewConnection(ws: WebSocket, clientLabel: string) {
  activeClients.add(ws);
  console.log(`[WS Server] Client connected (${clientLabel}). Total active: ${activeClients.size}`);

  // Immediately send current scoreboard state upon connection
  try {
    ws.send(JSON.stringify(currentState));
  } catch (e) {
    console.error('[WS Server] Failed to send initial state:', e);
  }

  ws.on('message', (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'UPDATE_STATE' && data.state) {
        broadcastState(data.state);
      } else if (typeof data.team1_name !== 'undefined' || typeof data.timer !== 'undefined') {
        broadcastState(data);
      }
    } catch (err) {
      console.error('[WS Server] Failed to process message:', err);
    }
  });

  ws.on('close', () => {
    activeClients.delete(ws);
    console.log(`[WS Server] Client disconnected (${clientLabel}). Total active: ${activeClients.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[WS Server] Socket error (${clientLabel}):`, err.message);
    activeClients.delete(ws);
  });
}

// 1. Standalone WebSocket Server on 0.0.0.0:8765
let wss8765: WebSocketServer | null = null;
try {
  wss8765 = new WebSocketServer({
    port: WS_PORT,
    host: '0.0.0.0',
  });

  wss8765.on('connection', (ws) => {
    handleNewConnection(ws, 'Port 8765');
  });

  wss8765.on('listening', () => {
    console.log(`[WS Server] Running and listening on ws://0.0.0.0:${WS_PORT}`);
    console.log(`[WS Server] LAN URL: ws://${detectedLanIp}:${WS_PORT}`);
  });

  wss8765.on('error', (err) => {
    console.error(`[WS Server 8765] Error:`, err);
  });
} catch (err) {
  console.error('[WS Server 8765] Failed to start:', err);
}

// 2. Generate initial HTML overlay files on startup
try {
  generateObsFiles(detectedLanIp);
  console.log('[OBS Generator] 5 overlay files initialized in /obs_overlays');
} catch (err) {
  console.error('[OBS Generator] Initialization error:', err);
}

// Serve /obs_overlays as static files
const overlaysDir = path.join(process.cwd(), 'obs_overlays');
app.use('/obs_overlays', express.static(overlaysDir));

// ================= API ROUTES =================

// Status endpoint for the Scoreboard UI settings panel
app.get('/api/obs/status', (req, res) => {
  const currentIp = getLanIp();
  res.json({
    status: 'RUNNING',
    lanIp: currentIp,
    port: WS_PORT,
    wsUrl: `ws://${currentIp}:${WS_PORT}`,
    connectedClients: activeClients.size,
    currentState,
  });
});

// Update scoreboard state from HTTP client & broadcast
app.post('/api/obs/state', (req, res) => {
  const newState = req.body;
  if (newState && typeof newState === 'object') {
    broadcastState(newState);
    res.json({ success: true, connectedClients: activeClients.size, currentState });
  } else {
    res.status(400).json({ error: 'Invalid state payload' });
  }
});

// Regenerate the 5 HTML overlay files
app.post('/api/obs/generate', (req, res) => {
  const customIp = req.body?.ip || getLanIp();
  try {
    const result = generateObsFiles(customIp);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// List overlay files with metadata
app.get('/api/obs/files', (req, res) => {
  const currentIp = getLanIp();
  const fileNames = [
    'team1_name.html',
    'team2_name.html',
    'team1_score.html',
    'team2_score.html',
    'timer.html',
  ];

  const files = fileNames.map((name) => {
    const filePath = path.join(overlaysDir, name);
    const exists = fs.existsSync(filePath);
    return {
      name,
      exists,
      localPath: path.resolve(filePath),
      httpUrl: `http://${currentIp}:${HTTP_PORT}/obs_overlays/${name}`,
      relativeUrl: `/obs_overlays/${name}`,
    };
  });

  res.json({ files, lanIp: currentIp, wsUrl: `ws://${currentIp}:${WS_PORT}` });
});

// Download individual overlay file
app.get('/api/obs/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const allowed = [
    'team1_name.html',
    'team2_name.html',
    'team1_score.html',
    'team2_score.html',
    'timer.html',
  ];

  if (!allowed.includes(filename)) {
    return res.status(404).send('Not found');
  }

  const filePath = path.join(overlaysDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File does not exist');
  }

  res.download(filePath, filename);
});

// Create HTTP Server on port 3000
const httpServer = http.createServer(app);

// 3. Fallback WebSocket upgrade on HTTP server port 3000 (/ws)
const wss3000 = new WebSocketServer({ noServer: true });
wss3000.on('connection', (ws) => {
  handleNewConnection(ws, 'Port 3000 /ws');
});

httpServer.on('upgrade', (request, socket, head) => {
  try {
    const parsedUrl = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (parsedUrl.pathname === '/ws') {
      wss3000.handleUpgrade(request, socket, head, (ws) => {
        wss3000.emit('connection', ws, request);
      });
    }
  } catch (err) {
    // Ignore invalid upgrade requests
  }
});

// 4. Vite middleware (dev) / Static assets (prod)
async function setupFrontend() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`[HTTP Server] Running on http://0.0.0.0:${HTTP_PORT}`);
  });
}

setupFrontend().catch((err) => {
  console.error('[Server Error]', err);
});
