// ============================================================================
// Savina K-12 Network & Offline Storage Monitoring Engine
// Tracks real network state, latency, service worker status, and local storage
// ============================================================================

export interface NetworkState {
  isOnline: boolean;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlinkMbps?: number;
  rttMs?: number;
  saveData: boolean;
  serviceWorkerActive: boolean;
  lastChecked: number;
  latencyMs?: number;
  localStorageUsageKb: number;
}

type NetworkListener = (state: NetworkState) => void;

class NetworkManager {
  private listeners: Set<NetworkListener> = new Set();
  private state: NetworkState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: '4g',
    downlinkMbps: undefined,
    rttMs: undefined,
    saveData: false,
    serviceWorkerActive: false,
    lastChecked: Date.now(),
    latencyMs: undefined,
    localStorageUsageKb: 0,
  };

  private pingIntervalId: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.updateConnectionInfo();
    this.calculateStorageUsage();

    // Listen to browser network change events
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));

    // Listen to Network Information API changes if supported
    const nav = navigator as any;
    if (nav.connection) {
      nav.connection.addEventListener('change', () => {
        this.updateConnectionInfo();
        this.notify();
      });
    }

    // Register Service Worker
    this.registerServiceWorker();

    // Periodic Heartbeat Ping (Every 25 seconds)
    this.pingIntervalId = setInterval(() => {
      this.checkServerConnectivity();
    }, 25000);

    // Initial server ping
    this.checkServerConnectivity();
  }

  private updateConnectionInfo() {
    const nav = navigator as any;
    const isOnline = navigator.onLine;

    let effectiveType: NetworkState['effectiveType'] = '4g';
    let downlinkMbps: number | undefined = undefined;
    let rttMs: number | undefined = undefined;
    let saveData = false;

    if (nav.connection) {
      effectiveType = nav.connection.effectiveType || '4g';
      downlinkMbps = nav.connection.downlink;
      rttMs = nav.connection.rtt;
      saveData = !!nav.connection.saveData;
    }

    this.state = {
      ...this.state,
      isOnline,
      effectiveType,
      downlinkMbps,
      rttMs,
      saveData,
      lastChecked: Date.now(),
    };
  }

  private handleOnlineStatus(isOnline: boolean) {
    this.state.isOnline = isOnline;
    this.updateConnectionInfo();
    this.calculateStorageUsage();
    if (isOnline) {
      this.checkServerConnectivity();
    }
    this.notify();
  }

  // Register Service Worker
  async registerServiceWorker(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.state.serviceWorkerActive = !!registration.active || !!registration.installing;
      this.notify();

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'activated') {
              this.state.serviceWorkerActive = true;
              this.notify();
            }
          });
        }
      });

      return true;
    } catch (err) {
      console.warn('[NetworkManager] ServiceWorker registration skipped/failed:', err);
      this.state.serviceWorkerActive = false;
      return false;
    }
  }

  // Ping backend to detect real internet connectivity vs offline / captive portal
  async checkServerConnectivity(): Promise<{ isOnline: boolean; latencyMs?: number }> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/health?t=' + Date.now(), {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (res.ok) {
        this.state.isOnline = true;
        this.state.latencyMs = latency;
      } else {
        // Server error or offline fallback response
        this.state.latencyMs = latency;
      }
    } catch (err) {
      // Network fetch error - true offline or unreachable
      this.state.isOnline = false;
      this.state.latencyMs = undefined;
    }

    this.state.lastChecked = Date.now();
    this.calculateStorageUsage();
    this.notify();

    return {
      isOnline: this.state.isOnline,
      latencyMs: this.state.latencyMs,
    };
  }

  // Calculate local storage size in KB across all app keys
  calculateStorageUsage(): number {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }

    let totalChars = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('savina_')) {
        const val = localStorage.getItem(key) || '';
        totalChars += key.length + val.length;
      }
    }

    // ~2 bytes per UTF-16 character
    const totalBytes = totalChars * 2;
    const totalKb = Math.round(totalBytes / 1024);
    this.state.localStorageUsageKb = totalKb;
    return totalKb;
  }

  getState(): NetworkState {
    return { ...this.state };
  }

  subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (e) {
        console.error('[NetworkManager] Listener error:', e);
      }
    });
  }

  destroy() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
    }
    this.listeners.clear();
  }
}

export const networkManager = new NetworkManager();
