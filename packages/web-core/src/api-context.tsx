'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { RideanApi, type User } from '@ridean/shared';

const TOKEN_KEY = 'ridean.token';

interface AuthState {
  api: RideanApi;
  /** Stripe publishable key; empty when the API runs with simulated payments */
  stripeKey: string;
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  /** Sign in with a phone number instead of an email address. */
  loginWithPhone: (phone: string, password: string) => Promise<User>;
  register: (input: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
function writeToken(t: string | null) {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable (private mode) — session lasts for this tab only */
  }
}

/** Provides the API client and the signed-in user to the whole app. */
export function ApiProvider({ baseUrl, stripeKey = '', children }: { baseUrl: string; stripeKey?: string; children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const api = useMemo(
    () =>
      new RideanApi({
        baseUrl,
        getToken: () => token ?? readToken(),
        onUnauthorized: () => {
          writeToken(null);
          setToken(null);
          setUser(null);
        },
      }),
    [baseUrl, token],
  );

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setUser(null);
      return;
    }
    try {
      setUser(await api.me());
    } catch {
      setUser(null);
    }
  }, [api]);

  useEffect(() => {
    setToken(readToken());
  }, []);
  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  const value: AuthState = {
    api,
    stripeKey,
    user,
    ready,
    login: async (email, password) => {
      const r = await api.login(email, password);
      writeToken(r.accessToken);
      setToken(r.accessToken);
      setUser(r.user);
      return r.user;
    },
    loginWithPhone: async (phone, password) => {
      const r = await api.loginWithPhone(phone, password);
      writeToken(r.accessToken);
      setToken(r.accessToken);
      setUser(r.user);
      return r.user;
    },
    register: async (input) => {
      const r = await api.register(input);
      writeToken(r.accessToken);
      setToken(r.accessToken);
      setUser(r.user);
      return r.user;
    },
    logout: () => {
      writeToken(null);
      setToken(null);
      setUser(null);
    },
    refresh,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRidean(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRidean must be used inside <ApiProvider>');
  return v;
}
