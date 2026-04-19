import { useEffect } from "react";
import { trackEvent } from "../../core/tracking/trackEvent";

export function HybridFeed() {
  useEffect(() => {
    trackEvent("page_view", { page: "hybrid_feed" });
  }, []);

  return (
    <div className="spk-card">
      <h1 className="spk-title">Hybrid Feed (variant: hybrid)</h1>
      <p className="spk-muted">Placeholder hybrid engine. Will implement cross-loop recommendations.</p>
    </div>
  );
}
