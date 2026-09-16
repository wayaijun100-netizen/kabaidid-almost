import fs from 'fs';
import path from 'path';
import { getLanIp } from './lanIp';

export interface GenerateResult {
  success: boolean;
  lanIp: string;
  port: number;
  wsUrl: string;
  files: string[];
}

function getTemplateTeam1Name(wsUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Team 1 Name</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    #value {
      font-family: Arial, sans-serif;
      font-size: 72px;
      font-weight: bold;
      color: #ffffff;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <span id="value"></span>
  <script>
    (function () {
      const params = new URLSearchParams(window.location.search);
      const host = params.get('ip') || window.location.hostname || '127.0.0.1';
      const port = params.get('port') || '8765';
      const wsUrl = params.get('ws') || ('ws://' + host + ':' + port);
      const valueEl = document.getElementById('value');

      function connect() {
        try {
          const ws = new WebSocket(wsUrl);
          ws.onmessage = function (event) {
            try {
              const data = JSON.parse(event.data);
              if (data && typeof data.team1_name !== 'undefined') {
                valueEl.textContent = data.team1_name;
              }
            } catch (e) {}
          };
          ws.onclose = function () {
            setTimeout(connect, 1000);
          };
          ws.onerror = function () {
            ws.close();
          };
        } catch (err) {
          setTimeout(connect, 1500);
        }
      }
      connect();
    })();
  </script>
</body>
</html>
`;
}

function getTemplateTeam2Name(wsUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Team 2 Name</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    #value {
      font-family: Arial, sans-serif;
      font-size: 72px;
      font-weight: bold;
      color: #ffffff;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <span id="value"></span>
  <script>
    (function () {
      const params = new URLSearchParams(window.location.search);
      const host = params.get('ip') || window.location.hostname || '127.0.0.1';
      const port = params.get('port') || '8765';
      const wsUrl = params.get('ws') || ('ws://' + host + ':' + port);
      const valueEl = document.getElementById('value');

      function connect() {
        try {
          const ws = new WebSocket(wsUrl);
          ws.onmessage = function (event) {
            try {
              const data = JSON.parse(event.data);
              if (data && typeof data.team2_name !== 'undefined') {
                valueEl.textContent = data.team2_name;
              }
            } catch (e) {}
          };
          ws.onclose = function () {
            setTimeout(connect, 1000);
          };
          ws.onerror = function () {
            ws.close();
          };
        } catch (err) {
          setTimeout(connect, 1500);
        }
      }
      connect();
    })();
  </script>
</body>
</html>
`;
}

function getTemplateTeam1Score(wsUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Team 1 Score</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    #value {
      font-family: Arial, sans-serif;
      font-size: 96px;
      font-weight: bold;
      color: #ffffff;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <span id="value">0</span>
  <script>
    (function () {
      const params = new URLSearchParams(window.location.search);
      const host = params.get('ip') || window.location.hostname || '127.0.0.1';
      const port = params.get('port') || '8765';
      const wsUrl = params.get('ws') || ('ws://' + host + ':' + port);
      const valueEl = document.getElementById('value');

      function connect() {
        try {
          const ws = new WebSocket(wsUrl);
          ws.onmessage = function (event) {
            try {
              const data = JSON.parse(event.data);
              if (data && typeof data.team1_score !== 'undefined') {
                valueEl.textContent = data.team1_score;
              }
            } catch (e) {}
          };
          ws.onclose = function () {
            setTimeout(connect, 1000);
          };
          ws.onerror = function () {
            ws.close();
          };
        } catch (err) {
          setTimeout(connect, 1500);
        }
      }
      connect();
    })();
  </script>
</body>
</html>
`;
}

function getTemplateTeam2Score(wsUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Team 2 Score</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    #value {
      font-family: Arial, sans-serif;
      font-size: 96px;
      font-weight: bold;
      color: #ffffff;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <span id="value">0</span>
  <script>
    (function () {
      const params = new URLSearchParams(window.location.search);
      const host = params.get('ip') || window.location.hostname || '127.0.0.1';
      const port = params.get('port') || '8765';
      const wsUrl = params.get('ws') || ('ws://' + host + ':' + port);
      const valueEl = document.getElementById('value');

      function connect() {
        try {
          const ws = new WebSocket(wsUrl);
          ws.onmessage = function (event) {
            try {
              const data = JSON.parse(event.data);
              if (data && typeof data.team2_score !== 'undefined') {
                valueEl.textContent = data.team2_score;
              }
            } catch (e) {}
          };
          ws.onclose = function () {
            setTimeout(connect, 1000);
          };
          ws.onerror = function () {
            ws.close();
          };
        } catch (err) {
          setTimeout(connect, 1500);
        }
      }
      connect();
    })();
  </script>
</body>
</html>
`;
}

function getTemplateTimer(wsUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Timer</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: transparent;
      overflow: hidden;
    }
    #value {
      font-family: Arial, sans-serif;
      font-size: 96px;
      font-weight: bold;
      color: #ffffff;
      line-height: 1;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <span id="value">30</span>
  <script>
    (function () {
      const params = new URLSearchParams(window.location.search);
      const host = params.get('ip') || window.location.hostname || '127.0.0.1';
      const port = params.get('port') || '8765';
      const wsUrl = params.get('ws') || ('ws://' + host + ':' + port);
      const valueEl = document.getElementById('value');

      function connect() {
        try {
          const ws = new WebSocket(wsUrl);
          ws.onmessage = function (event) {
            try {
              const data = JSON.parse(event.data);
              // Authoritative timer update from scoreboard application only
              if (data && typeof data.timer !== 'undefined') {
                valueEl.textContent = data.timer;
              }
            } catch (e) {}
          };
          ws.onclose = function () {
            setTimeout(connect, 1000);
          };
          ws.onerror = function () {
            ws.close();
          };
        } catch (err) {
          setTimeout(connect, 1500);
        }
      }
      connect();
    })();
  </script>
</body>
</html>
`;
}

/**
 * Generates/updates the 5 individual HTML files inside /obs_overlays/
 */
export function generateObsFiles(customLanIp?: string): GenerateResult {
  const lanIp = (customLanIp && customLanIp.trim()) || getLanIp();
  const port = 8765;
  const wsUrl = `ws://${lanIp}:${port}`;

  const overlayDir = path.join(process.cwd(), 'obs_overlays');
  if (!fs.existsSync(overlayDir)) {
    fs.mkdirSync(overlayDir, { recursive: true });
  }

  const filesMap: Record<string, string> = {
    'team1_name.html': getTemplateTeam1Name(wsUrl),
    'team2_name.html': getTemplateTeam2Name(wsUrl),
    'team1_score.html': getTemplateTeam1Score(wsUrl),
    'team2_score.html': getTemplateTeam2Score(wsUrl),
    'timer.html': getTemplateTimer(wsUrl),
  };

  const writtenFiles: string[] = [];
  for (const [filename, content] of Object.entries(filesMap)) {
    const filePath = path.join(overlayDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    writtenFiles.push(filename);
  }

  return {
    success: true,
    lanIp,
    port,
    wsUrl,
    files: writtenFiles,
  };
}
