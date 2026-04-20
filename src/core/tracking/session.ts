import { getUserId } from "../user/getUserId";
import { EXPERIMENT_NAME, type ExperimentVariant } from "../experiment/types";

const SESSION_KEY = "spk_session_id";

export function getSessionId() {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "session-anon";
  }
}

export function getTrackingContext(variant: ExperimentVariant, payload: Record<string, unknown>) {
  return {
    event: String(payload.event ?? "unknown"),
    ts: new Date().toISOString(),
    session_id: getSessionId(),
    user_id: getUserId(),
    experiment_name: EXPERIMENT_NAME,
    variant,
    payload,
  };
}
