import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { networkManager, NetworkState } from '../../services/networkManager';
import { getLocalStorageBreakdown, downloadBackupFile, StorageBreakdown } from '../../utils/offlineStorage';
import {
  Wifi,
  WifiOff,
  Signal,
  HardDrive,
  RefreshCw,
  Download,
  Database,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Server,
  Smartphone,
} from 'lucide-react';

interface OfflineDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineDiagnosticsModal: React.FC<OfflineDiagnosticsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    connectionMode,
    setConnectionMode,
    dataSaverActive,
    setDataSaverActive,
    offlineQueue,
    triggerSyncQueue,
    dataBytesSavedKb,
    lessons,
    currentSchool,
  } = useApp();

  const [netState, setNetState] = useState<NetworkState>(networkManager.getState());
  const [storageData, setStorageData] = useState<StorageBreakdown>(getLocalStorageBreakdown());
  const [testingPing, setTestingPing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = networkManager.subscribe((state) => {
      setNetState(state);
      setStorageData(getLocalStorageBreakdown());
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setTestingPing(true);
    setPingResult(null);
    try {
      const res = await networkManager.checkServerConnectivity();
      if (res.isOnline) {
        setPingResult(`Connected! Round-trip latency: ${res.latencyMs || 24}ms`);
      } else {
        setPingResult('Server unreachable. Operating in pure offline LocalStorage mode.');
      }
    } catch {
      setPingResult('Connection failed. Using cached local storage.');
    } finally {
      setTestingPing(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      await triggerSyncQueue();
      setStorageData(getLocalStorageBreakdown());
    } finally {
      setSyncing(false);
    }
  };

  const isActuallyOffline = !netState.isOnline || connectionMode === 'offline';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div
          className={`p-6 text-white transition-colors duration-300 ${
            isActuallyOffline
              ? 'bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 border-b border-rose-800/40'
              : 'bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 border-b border-emerald-800/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white border shadow-inner ${
                  isActuallyOffline
                    ? 'bg-rose-600/30 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-600/30 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {isActuallyOffline ? <WifiOff className="w-6 h-6 animate-pulse" /> : <Wifi className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      isActuallyOffline
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isActuallyOffline ? 'Offline-First Engine Active' : 'Cloud Online & Synced'}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                    PWA ServiceWorker
                  </span>
                </div>
                <h3 className="text-lg font-bold mt-0.5">
                  Offline Architecture & Network Monitor
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-sm font-bold transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Status Indicator Banner */}
          <div
            className={`rounded-2xl p-4 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isActuallyOffline
                ? 'bg-rose-950/40 border-rose-500/30'
                : 'bg-emerald-950/40 border-emerald-500/30'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isActuallyOffline ? 'Disconnected from Cloud Server' : 'Active High-Speed Connection'}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isActuallyOffline ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                  }`}
                />
              </div>
              <p className="text-xs text-slate-300">
                {isActuallyOffline
                  ? 'All student attendance, grades, lesson note reviews, and homework submissions are safely saved in local storage and will automatically sync when network returns.'
                  : `Operating normally with live synchronization to ${currentSchool.name}.`}
              </p>
            </div>

            <button
              onClick={handleTestPing}
              disabled={testingPing}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 shrink-0 transition"
            >
              <Activity className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{testingPing ? 'Pinging Server...' : 'Ping /api/health'}</span>
            </button>
          </div>

          {pingResult && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 font-mono flex items-center gap-2">
              <span className="text-emerald-400 font-bold">Diagnostics:</span>
              <span>{pingResult}</span>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Physical Net</span>
              <span
                className={`text-sm font-bold mt-1 block ${
                  netState.isOnline ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netState.isOnline ? 'Browser Online' : 'Hardware Offline'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Type: {netState.effectiveType.toUpperCase()}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Local DB Size</span>
              <span className="text-sm font-bold text-amber-400 mt-1 block font-mono">
                {storageData.totalKb} KB
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                {storageData.keys.length} DB Tables
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Cached Lessons</span>
              <span className="text-sm font-bold text-teal-400 mt-1 block font-mono">
                {storageData.cachedLessonsCount} Lessons
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Ready Zero-Data
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Pending Sync</span>
              <span
                className={`text-sm font-bold mt-1 block font-mono ${
                  offlineQueue.length > 0 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {offlineQueue.length} Actions
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                In Queue
              </span>
            </div>
          </div>

          {/* Network Simulator Controls */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Signal className="w-4 h-4 text-emerald-400" />
                Network Emulation & Data Saver Mode
              </h4>
              <span className="text-[11px] text-slate-500">Test Liberian 2G/3G/4G Conditions</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setConnectionMode('online_4g')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  connectionMode === 'online_4g'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>4G Fast (LTE)</span>
              </button>

              <button
                onClick={() => setConnectionMode('slow_3g')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  connectionMode === 'slow_3g'
                    ? 'bg-amber-950 border-amber-500 text-amber-300 ring-2 ring-amber-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Signal className="w-3.5 h-3.5 text-amber-400" />
                <span>Slow 3G (128kbps)</span>
              </button>

              <button
                onClick={() => setConnectionMode('offline')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  connectionMode === 'offline'
                    ? 'bg-rose-950 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Simulate Offline</span>
              </button>
            </div>
          </div>

          {/* Local Storage Database Table Breakdown */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-400" />
                Local Storage Persistence Tables
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                Total Allocated: {storageData.totalKb} KB
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {storageData.keys.map((k, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="text-white font-mono font-semibold">{k.name}</div>
                    <div className="text-[10px] text-slate-400">{k.description}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-amber-400 font-bold">{k.itemsCount} records</div>
                    <div className="text-[10px] text-slate-500">{k.sizeKb} KB</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sync Queue Actions */}
          {offlineQueue.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <h5 className="text-xs font-bold text-amber-300">
                  {offlineQueue.length} Actions Queued for Cloud Upload
                </h5>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Includes offline attendance records, student submissions, and payment receipts.
                </p>
              </div>

              <button
                onClick={handleSyncNow}
                disabled={syncing || isActuallyOffline}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync to Cloud Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap text-xs">
          <button
            onClick={downloadBackupFile}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Offline Backup (.json)</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
