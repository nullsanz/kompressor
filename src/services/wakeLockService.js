/**
 * Screen Wake Lock Service
 * Mencegah layar HP/perangkat mati (sleep/timeout) otomatis selama pengguna membuka web atau proses kompresi berjalan.
 */

let wakeLockSentinel = null;
let isRequested = false;
const listeners = new Set();

function notifyListeners(isActive) {
  listeners.forEach(fn => {
    try { fn(isActive); } catch (_) {}
  });
}

export function subscribeWakeLock(fn) {
  listeners.add(fn);
  fn(isWakeLockActive());
  return () => listeners.delete(fn);
}

export function isWakeLockSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export function isWakeLockActive() {
  return !!wakeLockSentinel && !wakeLockSentinel.released;
}

export async function requestScreenWakeLock() {
  isRequested = true;
  if (!isWakeLockSupported()) return false;

  try {
    if (wakeLockSentinel && !wakeLockSentinel.released) {
      return true;
    }
    wakeLockSentinel = await navigator.wakeLock.request('screen');
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null;
      notifyListeners(false);
      console.log('[WakeLock] Layar dilepas (auto-release).');
      // Jika masih requested dan tab aktif, coba minta lagi
      if (isRequested && document.visibilityState === 'visible') {
        requestScreenWakeLock();
      }
    });
    notifyListeners(true);
    console.log('[WakeLock] Layar HP dikunci aktif (Anti-Sleep ON).');
    return true;
  } catch (err) {
    console.warn('[WakeLock] Gagal meminta Wake Lock:', err.message);
    notifyListeners(false);
    return false;
  }
}

export async function releaseScreenWakeLock() {
  isRequested = false;
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release();
    } catch (_) {}
    wakeLockSentinel = null;
    notifyListeners(false);
  }
}

// Otomatis re-acquire saat tab kembali ke latar depan (foreground)
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (isRequested && document.visibilityState === 'visible') {
      requestScreenWakeLock();
    }
  });
}
