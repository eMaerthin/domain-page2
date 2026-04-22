import { useEffect, useState } from "react";
import { trackEvent } from "../../core/tracking/trackEvent";
import { QuizFlow } from "../quiz/QuizFlow";
import { ToolsFeed } from "../tools/ToolsFeed";

export function HybridFeed() {
  const [stage, setStage] = useState<"quiz" | "tools">("quiz");

  useEffect(() => {
    trackEvent("page_view", { page: "hybrid_feed" });
  }, []);

  return stage === "quiz" ? <QuizFlow /> : <ToolsFeed />;
}
