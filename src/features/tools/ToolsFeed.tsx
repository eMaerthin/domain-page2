import { useEffect } from "react";
import { trackEvent } from "../../core/tracking/trackEvent";

export function ToolsFeed() {
  useEffect(() => {
    trackEvent("page_view", { page: "tools_feed" });
  }, []);

  return (
    <div className="spk-card">
      <h1 className="spk-title">Tools Feed (variant: tools)</h1>
      <p className="spk-muted">Placeholder tools engine. Will implement input → generate → recommendations + tracking.</p>
    </div>
  );
}
