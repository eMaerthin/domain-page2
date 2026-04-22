type TrackingEnvelope = {
  event: string;
  ts: string;
  session_id: string;
  user_id: string;
  experiment_name: string;
  variant: string;
  payload: Record<string, unknown>;
};

const QUEUE_KEY = "spk_track_queue";
const MAX_QUEUE = 50;
const TRACK_ENDPOINT = new URL("/api/track", window.location.origin).toString();

function readQueue(): TrackingEnvelope[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TrackingEnvelope[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(next: TrackingEnvelope[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(next.slice(-MAX_QUEUE)));
  } catch {}
}

export function enqueueTrackingEvent(event: TrackingEnvelope) {
  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);
}

export async function flushTrackingQueue() {
  const queue = readQueue();
  if (!queue.length) return;

  const remaining: TrackingEnvelope[] = [];
  for (const item of queue) {
    try {
      const payload = JSON.stringify(item);
      const sent =
        typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function"
          ? navigator.sendBeacon(TRACK_ENDPOINT, new Blob([payload], { type: "application/json" }))
          : false;
      if (!sent) {
        const res = await fetch(TRACK_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (!res.ok) remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
}
