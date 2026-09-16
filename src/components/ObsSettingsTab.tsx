import React, { useState, useEffect } from 'react';
import {
  Radio,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Wifi,
  ShieldAlert,
  Download,
  Layers,
  Activity,
  Terminal,
  FileCode,
} from 'lucide-react';
import {
  fetchObsStatus,
  triggerGenerateObsFiles,
  fetchObsFiles,
  testWebSocketConnection,
  ObsStatusResponse,
  ObsFileInfo,
} from '../utils/obsSync';

export const ObsSettingsTab: React.FC = () => {
  const [status, setStatus] = useState<ObsStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [customIp, setCustomIp] = useState<string>('');
  const [files, setFiles] = useState<ObsFileInfo[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedFirewall, setCopiedFirewall] = useState<boolean>(false);
  const [copiedFileUrl, setCopiedFileUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateSuccess, setGenerateSuccess] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs: number;
    message?: string;
  } | null>(null);

  const loadStatusAndFiles = async () => {
    try {
      setLoading(true);
      const [statusData, filesData] = await Promise.all([
        fetchObsStatus(),
        fetchObsFiles(),
      ]);
      setStatus(statusData);
      setCustomIp(statusData.lanIp);
      setFiles(filesData.files);
    } catch (err) {
      console.error('[OBS Settings] Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatusAndFiles();
    // Refresh status every 3 seconds to update Connected Browser Sources count
    const interval = setInterval(async () => {
      try {
        const s = await fetchObsStatus();
        setStatus(s);
      } catch (e) {}
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyWsUrl = () => {
    const url = status?.wsUrl || `ws://${customIp || '127.0.0.1'}:8765`;
    navigator.clipboard?.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  const handleCopyFirewall = () => {
    const cmd = 'netsh advfirewall firewall add rule name="Kabaddi Scoreboard WS 8765" dir=in action=allow protocol=TCP localport=8765';
    navigator.clipboard?.writeText(cmd);
    setCopiedFirewall(true);
    setTimeout(() => setCopiedFirewall(false), 2200);
  };

  const handleCopyFileLink = (url: string, name: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedFileUrl(name);
    setTimeout(() => setCopiedFileUrl(null), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateSuccess(false);
    try {
      await triggerGenerateObsFiles(customIp || undefined);
      const filesData = await fetchObsFiles();
      setFiles(filesData.files);
      const statusData = await fetchObsStatus();
      setStatus(statusData);
      setGenerateSuccess(true);
      setTimeout(() => setGenerateSuccess(false), 3500);
    } catch (err) {
      console.error('[OBS Settings] Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // Test the local WS URL or detected LAN URL
      const targetUrl = status?.wsUrl || `ws://${customIp || '127.0.0.1'}:8765`;
      const res = await testWebSocketConnection(targetUrl);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err?.message || 'Connection test error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const activeIp = customIp || status?.lanIp || '127.0.0.1';
  const activeWsUrl = `ws://${activeIp}:8765`;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Category Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            OBS / Live Output (WebSocket LAN Streaming)
          </h3>
          <p className="text-xs text-slate-400">
            Broadcast live score and raid clock data across your local network directly into OBS Studio using 5 independent HTML overlays.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadStatusAndFiles}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh network telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ================= PRIMARY TELEMETRY HUD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Status */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>WebSocket Server</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="mt-2 text-xl font-mono font-black text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            RUNNING
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Host: 0.0.0.0 (All LAN Interfaces)
          </div>
        </div>

        {/* LAN IP */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>LAN IP</span>
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-mono font-black text-cyan-300 truncate">
            {activeIp}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Detected IPv4 LAN Address
          </div>
        </div>

        {/* Port */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Port</span>
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl font-mono font-black text-indigo-300">
            8765
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            TCP WebSocket Port
          </div>
        </div>

        {/* Connected Sources */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Connected Browser Sources</span>
            <Layers className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-mono font-black text-amber-300 flex items-center gap-2">
            <span>{status?.connectedClients ?? 0}</span>
            <span className="text-xs font-normal text-slate-400">client(s)</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Active OBS overlay streams
          </div>
        </div>
      </div>

      {/* ================= WEBSOCKET URL & ACTION BUTTONS ================= */}
      <div className="p-5 rounded-2xl bg-[#0e1526] border border-indigo-500/20 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              WebSocket URL
            </div>
            <div className="mt-1 font-mono text-sm sm:text-base font-bold text-yellow-300 select-all bg-black/50 px-3 py-1.5 rounded-lg border border-yellow-500/30 inline-block">
              {activeWsUrl}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyWsUrl}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-300" />
                  <span>COPY WEBSOCKET URL</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'TESTING...' : 'TEST CONNECTION'}</span>
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              <FileCode className="w-4 h-4" />
              <span>{isGenerating ? 'GENERATING...' : 'GENERATE OBS HTML FILES'}</span>
            </button>
          </div>
        </div>

        {/* Test Connection Output Feedback */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs font-mono flex items-center justify-between border ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${testResult.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{testResult.message}</span>
            </div>
            {testResult.success && (
              <span className="text-[11px] text-emerald-400/80">Latency: {testResult.latencyMs}ms</span>
            )}
          </div>
        )}

        {/* Generate Files Success Banner */}
        {generateSuccess && (
          <div className="p-3 rounded-xl text-xs font-mono bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Successfully generated and updated 5 independent HTML overlays in /obs_overlays with {activeWsUrl}!</span>
          </div>
        )}

        {/* IP override input for advanced multi-NIC setups */}
        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Scoreboard PC LAN IP (Change if using a secondary network adapter):
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customIp}
              onChange={(e) => setCustomIp(e.target.value)}
              placeholder="e.g. 192.168.1.159"
              className="px-3 py-1 rounded-lg bg-black/50 border border-white/15 text-white font-mono text-xs w-40 focus:outline-none focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono cursor-pointer"
            >
              Update
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5 INDIVIDUAL OBS HTML OVERLAYS ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Five Individual Pure-Data OBS Overlays
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Unstyled &amp; 100% transparent text outputs for custom OBS styling
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {[
            {
              id: 'team1_name',
              file: 'team1_name.html',
              label: 'Browser Source 1: Team 1 Name',
              field: 'team1_name',
              value: status?.currentState?.team1_name || 'TEAM 1',
              accent: 'border-blue-500/40 text-blue-400',
              recommendedSize: '500 x 120 px',
            },
            {
              id: 'team2_name',
              file: 'team2_name.html',
              label: 'Browser Source 2: Team 2 Name',
              field: 'team2_name',
              value: status?.currentState?.team2_name || 'TEAM 2',
              accent: 'border-red-500/40 text-red-400',
              recommendedSize: '500 x 120 px',
            },
            {
              id: 'team1_score',
              file: 'team1_score.html',
              label: 'Browser Source 3: Team 1 Score',
              field: 'team1_score',
              value: status?.currentState?.team1_score ?? 0,
              accent: 'border-blue-500/40 text-blue-300',
              recommendedSize: '320 x 280 px',
            },
            {
              id: 'team2_score',
              file: 'team2_score.html',
              label: 'Browser Source 4: Team 2 Score',
              field: 'team2_score',
              value: status?.currentState?.team2_score ?? 0,
              accent: 'border-red-500/40 text-red-300',
              recommendedSize: '320 x 280 px',
            },
            {
              id: 'timer',
              file: 'timer.html',
              label: 'Browser Source 5: 30s Raid Clock',
              field: 'timer',
              value: `${status?.currentState?.timer ?? 30}s`,
              accent: 'border-yellow-500/40 text-yellow-400',
              recommendedSize: '300 x 280 px',
            },
          ].map((item, index) => {
            const overlayUrl = `http://${activeIp}:3000/obs_overlays/${item.file}`;
            const isCopied = copiedFileUrl === item.file;

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-slate-300 shrink-0">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-white">
                        {item.file}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                        {item.recommendedSize}
                      </span>
                      <span className={`px-2 py-0.5 rounded bg-black/60 border text-[10px] font-mono font-bold ${item.accent}`}>
                        LIVE: {String(item.value)}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate max-w-lg mt-0.5 select-all">
                      Local Path: /obs_overlays/{item.file}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <a
                    href={`/obs_overlays/${item.file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    title="Open overlay in browser preview"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyFileLink(overlayUrl, item.file)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy HTTP URL for OBS Browser Source"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`/api/obs/file/${item.file}`}
                    download={item.file}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-xs font-mono text-indigo-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    title="Download HTML file for local file browser source"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= OBS STUDIO SETUP STEP-BY-STEP ================= */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 text-xs">
        <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          OBS Studio Configuration Instructions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="font-bold text-amber-300 font-mono">STEP 1: ADD SOURCES</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In OBS Studio, click <b>+</b> in Sources &gt; select <b>Browser</b>. Create 5 sources corresponding to each of the 5 HTML overlay files.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="font-bold text-amber-300 font-mono">STEP 2: SET URL / FILE</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Either check <b>Local File</b> and browse to <code className="text-yellow-200">/obs_overlays/team1_score.html</code>, or paste the LAN HTTP URL.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <div className="font-bold text-amber-300 font-mono">STEP 3: POSITION &amp; RESIZE</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Background is 100% transparent. Drag, resize, and layer Team 1 Name, Team 2 Name, Scores, and Raid Clock anywhere on your 1080p canvas!
            </p>
          </div>
        </div>
      </div>

      {/* ================= WINDOWS FIREWALL INSTRUCTIONS ================= */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Windows Firewall Rule for Port 8765 (Scoreboard PC &rarr; OBS PC on LAN)
          </div>

          <button
            type="button"
            onClick={handleCopyFirewall}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            {copiedFirewall ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Command Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Command</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          If your OBS Studio is running on a separate computer on the same Wi-Fi / LAN, allow inbound TCP connections on port <b>8765</b> on the Scoreboard PC. Open PowerShell as Administrator and run:
        </p>

        <div className="bg-black/60 p-3 rounded-xl font-mono text-xs text-amber-200 border border-amber-500/20 overflow-x-auto select-all">
          netsh advfirewall firewall add rule name="Kabaddi Scoreboard WS 8765" dir=in action=allow protocol=TCP localport=8765
        </div>
      </div>
    </div>
  );
};
