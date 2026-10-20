// The visitor's cookie choice, kept in localStorage. "unknown" = not chosen yet.
export type Consent = "granted" | "denied" | "unknown";

const KEY = "alamir_cookie_consent";
export const CONSENT_EVENT = "alamir:consent";
export const OPEN_SETTINGS_EVENT = "alamir:open-cookie-settings";

export function getConsent(): Consent {
  try {
    const value = localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : "unknown";
  } catch {
    return "unknown";
  }
}

export function setConsent(value: "granted" | "denied") {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Storage blocked: the choice lasts until the page is closed.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Removes the Meta and Google cookies a visitor got after accepting (used when the consent is withdrawn). */
export function clearTrackingCookies() {
  const names = document.cookie
    .split(";")
    .map((part) => part.split("=")[0].trim())
    .filter((name) => /^(_fbp|_fbc|_ga|_gid|_gat|_gcl_)/.test(name));
  const hosts = [location.hostname, `.${location.hostname.replace(/^www\./, "")}`];
  for (const name of names) {
    document.cookie = `${name}=; Max-Age=0; path=/`;
    for (const host of hosts) document.cookie = `${name}=; Max-Age=0; path=/; domain=${host}`;
  }
}
