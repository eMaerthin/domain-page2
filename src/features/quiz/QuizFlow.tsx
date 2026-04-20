import { useMemo } from "react";
import Question from "./Question";
import { useQuizEngine } from "./useQuizEngine";
import { trackEvent } from "../../core/tracking/trackEvent";

const STEPS = [
  {
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&q=80",
    answers: [
      { id: "a1", text: "I want more clicks", correct: true },
      { id: "a2", text: "I want smaller buttons", correct: false },
    ],
  },
  {
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80",
    answers: [
      { id: "b1", text: "Use tools", correct: true },
      { id: "b2", text: "Ignore flow", correct: false },
    ],
  },
] as const;

export function QuizFlow() {
  const steps = useMemo(() => STEPS, []);
  const { current, index, progress, answer, finished, score } = useQuizEngine(steps as any);

  if (finished) {
    trackEvent("quiz_complete", { score, total: steps.length });
    return (
      <div className="spk-card">
        <h1 className="spk-title">Quiz complete</h1>
        <p className="spk-muted">Score: {score}/{steps.length}</p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <Question
      image={current.image}
      answers={current.answers as any}
      progress={progress}
      onAnswer={(isCorrect) => {
        trackEvent("quiz_step", { index, isCorrect });
        answer(isCorrect);
      }}
    />
  );
}
