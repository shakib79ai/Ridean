// Mocked client-side "session" used only to gate the final booking/payment
// step behind sign-in, while search + rate browsing stays fully open to guests.
// No real auth/backend exists in this prototype.

const KEY = "ridean_mock_session";

export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSession() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
