import { useEffect } from "react";
import { trackEvent } from "../../core/tracking/trackEvent";
import { startQuizEngine } from "./quizMvp";
import { InstallQuizUI } from "./quizUi";

export function QuizFeed() {
  useEffect(() => {
    trackEvent("page_view", { page: "quiz_feed" });
    startQuizEngine();
  }, []);

  return (
    <div className="spk-card">
      <h1 className="spk-title">Quiz Feed (variant: quiz)</h1>
      <p className="spk-muted">MVP: quiz engine started (deterministic variant + URL sticky). Implementing multi-page flow next.</p>
      <InstallQuizUI />
    </div>
  );
}
