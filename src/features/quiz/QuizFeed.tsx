import { useEffect } from "react";
import { trackEvent } from "../../core/tracking/trackEvent";
import { QuizFlow } from "./QuizFlow";

export function QuizFeed() {
  useEffect(() => {
    trackEvent("page_view", { page: "quiz_feed" });
  }, []);

  return (
    <QuizFlow />
  );
}
