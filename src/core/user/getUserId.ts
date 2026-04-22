import { getCookie, setCookie } from "../storage/cookies";

export function getUserId() {
  try {
    const key = "spk_uid";
    const existing = localStorage.getItem(key) ?? getCookie("uid");
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    setCookie("uid", id);
    return id;
  } catch {
    // Fallback: best-effort in constrained environments
    return "anonymous";
  }
}
