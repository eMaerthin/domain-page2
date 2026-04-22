const COOKIE_PREFIX = "spk_";

export function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const key = `${COOKIE_PREFIX}${name}=`;
  const entry = document.cookie.split("; ").find((part) => part.startsWith(key));
  return entry ? decodeURIComponent(entry.slice(key.length)) : undefined;
}

export function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 365) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}
