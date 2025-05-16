export interface Session {
  rdns: string;
  timestamp: number;
}

const STORAGE_KEY = 'walrSession';

export function setSession(rdns: string) {
  const session: Session = {
    rdns,
    timestamp: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getLatestSession(): Session | null {
  try {
    const sessionString = localStorage.getItem(STORAGE_KEY);
    if (!sessionString) {
      return null;
    }

    return JSON.parse(sessionString);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}
