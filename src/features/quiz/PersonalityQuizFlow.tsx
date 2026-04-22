import { useMemo } from "react";
import Question from "./Question";
import { useQuizEngine, type QuizStep } from "./useQuizEngine";
import { trackEvent } from "../../core/tracking/trackEvent";
import { getQuizDefinition, getQuizResult, type PersonalityAnswer } from "./quizStore";

const QUESTION_TIMEOUT_MS = 20_000;

export function PersonalityQuizFlow() {
  const quiz = useMemo(() => getQuizDefinition("quiz_animal_personality"), []);
  const steps = (quiz?.data.questions ?? []) as QuizStep<PersonalityAnswer>[];
  const { current, index, progress, answer, skip, finished, score, answers } = useQuizEngine(steps);

  if (finished) {
    const result = getQuizResult(quiz?.id ?? "quiz_animal_personality", answers.map((a) => a.answerId));
    if (result.mode !== "personality") return null;

    trackEvent("quiz_complete", {
      quizId: quiz?.id,
      score,
      total: steps.length,
      resultMode: result.mode,
      resultId: result.resultId,
      title: result.title,
      percent: result.percent,
      toolRecommendations: result.toolRecommendations,
    });

    return (
      <div className="spk-card">
        <h1 className="spk-title">{result.title}</h1>
        {result.image ? <img className="spk-result-image" src={result.image} alt="" /> : null}
        <p className="spk-muted">{result.description}</p>
        <p className="spk-muted">Wynik: {result.title} — {result.description}</p>
        <p className="spk-muted">Polecane narzędzia: {result.toolRecommendations.join(", ")}</p>
      </div>
    );
  }

  if (!current) return null;

  return (
    <Question<PersonalityAnswer>
      image={current.image}
      answers={current.answers}
      progress={progress}
      {...(current.prompt ? { prompt: current.prompt } : {})}
      timeLeftMs={QUESTION_TIMEOUT_MS}
      onSelect={(selected) => {
        trackEvent("quiz_step", {
          quizId: quiz?.id,
          index,
          questionId: current.id,
          answerId: selected.id,
          traits: selected.traits,
        });
      }}
      onTimeout={() => {
        trackEvent("quiz_step", {
          quizId: quiz?.id,
          index,
          questionId: current.id,
          answerId: "timeout",
          timedOut: true,
        });
        skip();
      }}
      onAnswer={(selected) => {
        answer(selected.id, false);
      }}
    />
  );
}
