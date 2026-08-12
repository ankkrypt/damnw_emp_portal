import { useSyncExternalStore } from "react";

// Frontend-only session management.
//
// TODO(backend): when the backend auth endpoints are ready, replace the body
// of `login()` with a real `POST /api/auth/login` call and persist whatever
// the API returns (token, user, etc.) instead of building the session here.

const SESSION_KEY = "employee_portal_session";
const SESSION_EVENT = "employee-portal:session-change";

export interface Session {
  email: string;
  name: string;
  loggedInAt: string;
}

// useSyncExternalStore requires getSnapshot to return a reference-stable value
// between reads (it compares snapshots with Object.is), so cache the parsed
// session keyed by the raw localStorage string. A fresh JSON.parse per call
// would be seen as a "changed" snapshot every render and cause an infinite
// re-render loop.
let lastRaw: string | null = null;
let lastSession: Session | null = null;

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastSession = raw ? (JSON.parse(raw) as Session) : null;
  }
  return lastSession;
}

function subscribe(callback: () => void): () => void {
  // The native `storage` event only fires in *other* tabs, so also listen for
  // a same-tab event dispatched by login()/logout().
  window.addEventListener("storage", callback);
  window.addEventListener(SESSION_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SESSION_EVENT, callback);
  };
}

// React hook that stays in sync with the session store (localStorage).
// Returns null during SSR / while signed out.
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}

function writeSession(session: Session | null): void {
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_KEY);
  }
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/**
 * Demo login — currently accepts any well-formed email + password.
 * Resolves after a short delay to mimic a network round-trip.
 */
export function login(email: string, password: string): Promise<Session> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (!email || !password) {
        reject(new Error("Email and password are required"));
        return;
      }
      const session: Session = {
        email: email.trim().toLowerCase(),
        name: displayName(email),
        loggedInAt: new Date().toISOString(),
      };
      writeSession(session);
      resolve(session);
    }, 500);
  });
}

export function logout(): void {
  if (typeof window === "undefined") return;
  writeSession(null);
}

function displayName(email: string): string {
  const local = email.split("@")[0] || "User";
  return (
    local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ") || "User"
  );
}
