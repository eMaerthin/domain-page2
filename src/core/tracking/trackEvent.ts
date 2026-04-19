type EventName = "page_view" | "quiz_step" | "quiz_complete" | "tool_used" | "ad_impression";

export function trackEvent(event: EventName, payload?: Record<string, unknown>) {
  // Placeholder: in production implement POST /api/track + optional local buffering.
  try {
    // eslint-disable-next-line no-console
    console.debug("[spk:track]", event, payload ?? {});
  } catch {
    // ignore
  }
}
