import { useMemo } from "react";
import Question from "./Question";
import { useQuizEngine } from "./useQuizEngine";
import { trackEvent } from "../../core/tracking/trackEvent";
import { getCurrentQuiz, getQuizResult } from "./quizStore";

export function QuizFlow() {
  const quiz = useMemo(() => getCurrentQuiz(), []);
  const steps = quiz?.data.questions ?? [];
  const { current, index, progress, answer, finished, score } = useQuizEngine(steps);

  if (finished) {
    const result = getQuizResult(quiz?.id ?? "quiz_flags_visual_1", []);
    trackEvent("quiz_complete", {
      score,
      total: steps.length,
      percent: result.percent,
      bucket: result.bucket,
      toolRecommendations: result.toolRecommendations,
    });
    return (
      <div className="spk-card">
        <h1 className="spk-title">Quiz complete</h1>
        <p className="spk-muted">Score: {score}/{steps.length}</p>
        <p className="spk-muted">Wynik: {result.percent}% ({result.bucket})</p>
        <p className="spk-muted">Polecane narzędzia: {result.toolRecommendations.join(", ")}</p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <Question
      image={current.image}
      answers={current.answers}
      progress={progress}
      onSelect={(selected) => {
        trackEvent("quiz_step", {
          index,
          isCorrect: selected.correct,
          questionId: current.id,
          answerId: selected.id,
        });
      }}
      onAnswer={(isCorrect) => {
        answer(isCorrect);
      }}
    />
  );
}
