const memoryLocal = new Map<string, string>();
const memorySession = new Map<string, string>();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      const val = window.localStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Fallback to in-memory storage when localStorage is blocked by iframe/browser policies
    }
    return memoryLocal.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    memoryLocal.set(key, value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore SecurityError / QuotaExceededError
    }
  },
  removeItem(key: string): void {
    memoryLocal.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore SecurityError
    }
  },
  clear(): void {
    memoryLocal.clear();
    try {
      window.localStorage.clear();
    } catch {
      // Ignore SecurityError
    }
  }
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      const val = window.sessionStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Fallback to in-memory storage when sessionStorage is blocked by iframe/browser policies
    }
    return memorySession.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    memorySession.set(key, value);
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      // Ignore SecurityError / QuotaExceededError
    }
  },
  removeItem(key: string): void {
    memorySession.delete(key);
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore SecurityError
    }
  },
  clear(): void {
    memorySession.clear();
    try {
      window.sessionStorage.clear();
    } catch {
      // Ignore SecurityError
    }
  }
};
