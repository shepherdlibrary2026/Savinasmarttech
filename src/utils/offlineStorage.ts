// ============================================================================
// Savina K-12 Offline Storage & Sync Helper
// Inspects, persists, and synchronizes offline data packets and local storage
// ============================================================================

export interface StorageBreakdown {
  totalKb: number;
  keys: {
    name: string;
    description: string;
    itemsCount: number;
    sizeKb: number;
  }[];
  cachedLessonsCount: number;
  offlineSubmissionsCount: number;
  pendingSyncCount: number;
}

export const getLocalStorageBreakdown = (): StorageBreakdown => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      totalKb: 0,
      keys: [],
      cachedLessonsCount: 0,
      offlineSubmissionsCount: 0,
      pendingSyncCount: 0,
    };
  }

  const monitoredKeys = [
    { key: 'savina_lessons', desc: 'Cached Lesson Slides & Audio Transcripts' },
    { key: 'savina_attendance', desc: 'Class Attendance Daily Registers' },
    { key: 'savina_submissions', desc: 'Student Assignment Work & Quizzes' },
    { key: 'savina_invoices', desc: 'Tuition Fee Invoices & Balances' },
    { key: 'savina_payments', desc: 'Mobile Money Receipts & Cash Slips' },
    { key: 'savina_messages', desc: 'Parent-Teacher Communication Logs' },
    { key: 'savina_sms_logs', desc: 'Liberia SMS Gateway Dispatch History' },
    { key: 'savina_schools', desc: 'Registered School Tenants Directory' },
    { key: 'savina_users', desc: 'Student, Teacher & Parent Profiles' },
  ];

  let totalChars = 0;
  let cachedLessonsCount = 0;
  let offlineSubmissionsCount = 0;
  let pendingSyncCount = 0;

  const keys = monitoredKeys.map((item) => {
    const raw = localStorage.getItem(item.key) || '[]';
    const chars = item.key.length + raw.length;
    totalChars += chars;
    const sizeKb = Math.round((chars * 2) / 1024);

    let itemsCount = 0;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        itemsCount = parsed.length;
        if (item.key === 'savina_lessons') {
          cachedLessonsCount = parsed.filter((l: any) => l.isDownloadedOffline).length;
        }
        if (item.key === 'savina_submissions') {
          offlineSubmissionsCount = parsed.filter((s: any) => !s.isSynced).length;
        }
      }
    } catch {
      itemsCount = 1;
    }

    return {
      name: item.key,
      description: item.desc,
      itemsCount,
      sizeKb,
    };
  });

  // Calculate pending sync items in queue
  try {
    const rawQueue = localStorage.getItem('savina_offline_queue') || '[]';
    const parsedQueue = JSON.parse(rawQueue);
    if (Array.isArray(parsedQueue)) {
      pendingSyncCount = parsedQueue.length;
    }
  } catch {
    pendingSyncCount = 0;
  }

  const totalKb = Math.round((totalChars * 2) / 1024);

  return {
    totalKb,
    keys,
    cachedLessonsCount,
    offlineSubmissionsCount,
    pendingSyncCount,
  };
};

// Export all local database tables as a JSON backup
export const exportOfflineBackupJson = (): string => {
  if (typeof window === 'undefined') return '{}';

  const backup: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    system: 'Savina Learning Center Offline Backup',
    version: '2.4.0',
    data: {},
  };

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('savina_')) {
      try {
        backup.data[key] = JSON.parse(localStorage.getItem(key) || 'null');
      } catch {
        backup.data[key] = localStorage.getItem(key);
      }
    }
  }

  return JSON.stringify(backup, null, 2);
};

// Trigger download of offline database backup file
export const downloadBackupFile = () => {
  const jsonStr = exportOfflineBackupJson();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `savina_offline_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
