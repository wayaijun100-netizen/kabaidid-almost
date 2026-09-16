/**
 * OBS WebSocket Synchronization Client & API Service
 */

export interface ObsScoreboardState {
  team1_name: string;
  team2_name: string;
  team1_score: number;
  team2_score: number;
  timer: number;
  timer_running: boolean;
}

export interface ObsStatusResponse {
  status: 'RUNNING' | 'STOPPED';
  lanIp: string;
  port: number;
  wsUrl: string;
  connectedClients: number;
  currentState: ObsScoreboardState;
}

export interface ObsFileInfo {
  name: string;
  exists: boolean;
  localPath: string;
  httpUrl: string;
  relativeUrl: string;
}

class ObsSyncClient {
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private lastSentStateJson: string = '';
  private cachedStatus: ObsStatusResponse | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initConnection();
    }
  }

  private initConnection() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.isConnecting = true;

    try {
      // Connect to server WebSocket endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        console.log('[OBS Sync] Main Scoreboard connected to WebSocket server');
        if (this.lastSentStateJson) {
          try {
            this.socket?.send(this.lastSentStateJson);
          } catch (e) {}
        }
      };

      this.socket.onerror = () => {
        this.isConnecting = false;
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        this.socket = null;
        if (!this.reconnectTimer) {
          this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.initConnection();
          }, 3000);
        }
      };
    } catch (err) {
      this.isConnecting = false;
    }
  }

  public sendState(state: ObsScoreboardState) {
    const payload = JSON.stringify({
      type: 'UPDATE_STATE',
      state,
    });

    this.lastSentStateJson = payload;

    // Send via active WebSocket for lowest latency (<1ms)
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(payload);
      } catch (err) {
        this.fallbackHttpSend(state);
      }
    } else {
      // Fallback via HTTP REST to guarantee state arrives at server
      this.fallbackHttpSend(state);
      this.initConnection();
    }
  }

  private fallbackHttpSend(state: ObsScoreboardState) {
    try {
      fetch('/api/obs/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      }).catch(() => {});
    } catch (e) {}
  }
}

export const obsSyncClient = new ObsSyncClient();

/**
 * Fetches current WebSocket server and LAN network status
 */
export async function fetchObsStatus(): Promise<ObsStatusResponse> {
  const res = await fetch('/api/obs/status');
  if (!res.ok) {
    throw new Error('Failed to fetch OBS status');
  }
  return res.json();
}

/**
 * Triggers re-generation of the 5 individual OBS HTML files on the server
 */
export async function triggerGenerateObsFiles(customIp?: string): Promise<{
  success: boolean;
  lanIp: string;
  port: number;
  wsUrl: string;
  files: string[];
}> {
  const res = await fetch('/api/obs/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip: customIp }),
  });
  if (!res.ok) {
    throw new Error('Failed to generate OBS files');
  }
  return res.json();
}

/**
 * Fetches the metadata and paths for the 5 individual OBS overlay files
 */
export async function fetchObsFiles(): Promise<{
  files: ObsFileInfo[];
  lanIp: string;
  wsUrl: string;
}> {
  const res = await fetch('/api/obs/files');
  if (!res.ok) {
    throw new Error('Failed to fetch OBS files');
  }
  return res.json();
}

/**
 * Tests direct connection to the WebSocket server and measures response latency
 */
export async function testWebSocketConnection(wsUrl: string): Promise<{
  success: boolean;
  latencyMs: number;
  message?: string;
}> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    let isResolved = false;

    try {
      const socket = new WebSocket(wsUrl);

      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          try {
            socket.close();
          } catch (e) {}
          resolve({
            success: false,
            latencyMs: 3000,
            message: 'Connection timed out (Check firewall or LAN IP)',
          });
        }
      }, 3000);

      socket.onopen = () => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          const latency = Math.round(performance.now() - startTime);
          try {
            socket.close();
          } catch (e) {}
          resolve({
            success: true,
            latencyMs: latency,
            message: `Handshake successful (${latency}ms)`,
          });
        }
      };

      socket.onerror = (err) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timeout);
          resolve({
            success: false,
            latencyMs: 0,
            message: 'WebSocket connection failed (Refused or unreachable)',
          });
        }
      };
    } catch (err: any) {
      resolve({
        success: false,
        latencyMs: 0,
        message: err?.message || 'Error initializing WebSocket test',
      });
    }
  });
}
