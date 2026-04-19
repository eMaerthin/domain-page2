import { useEffect } from "react";
import { trackEvent } from "../../core/tracking/trackEvent";

export function QuizFeed() {
  useEffect(() => {
    trackEvent("page_view", { page: "quiz_feed" });
  }, []);

  return (
    <div className="spk-card">
      <h1 className="spk-title">Quiz Feed (variant: quiz)</h1>
      <p className="spk-muted">Placeholder quiz engine. Will implement multi-page loop + scoring next.</p>
    </div>
  );
}
