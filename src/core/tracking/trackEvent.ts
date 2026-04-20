import { EXPERIMENT_NAME, type ExperimentVariant } from "../experiment/types";
import { getUserId } from "../user/getUserId";
import { enqueueTrackingEvent, flushTrackingQueue } from "./queue";
import { getSessionId } from "./session";

export type EventName = "page_view" | "quiz_step" | "quiz_complete" | "tool_used" | "ad_impression";

export function trackEvent(event: EventName, payload: Record<string, unknown> = {}) {
  const variant = (localStorage.getItem(`spk_variant:${EXPERIMENT_NAME}`) as ExperimentVariant | null) ?? "hybrid";
  const envelope = {
    event,
    ts: new Date().toISOString(),
    session_id: getSessionId(),
    user_id: getUserId(),
    experiment_name: EXPERIMENT_NAME,
    variant,
    payload: { ...payload, event },
  };

  enqueueTrackingEvent(envelope);
  void flushTrackingQueue();
}
