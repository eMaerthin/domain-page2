import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Question from "./Question";
import { useQuizEngine } from "./useQuizEngine";
import { trackEvent } from "../../core/tracking/trackEvent";
import { getKnowledgeReview, getQuizDefinition, getQuizResult } from "./quizStore";

const QUESTION_TIMEOUT_MS = 20_000;
const HISTORY_KEY = "spk_completed_quizzes";

type QuizSelection = {
  quizId: string;
  mode: "knowledge" | "personality";
};

function readCompletedQuizzes(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function markCompletedQuiz(quizId: string) {
  try {
    const current = readCompletedQuizzes();
    if (!current.includes(quizId)) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify([...current, quizId]));
    }
  } catch {}
}

function RecommendationScreen({ completedQuizIds, onSelectQuiz, onGoToTools }: { completedQuizIds: string[]; onSelectQuiz: (selection: QuizSelection) => void; onGoToTools: () => void }) {
  const quizCards = [
    {
      quizId: "quiz_flags_visual_1",
      mode: "knowledge" as const,
      title: "Quiz wiedzy: flagi",
      subtitle: "10 szybkich pytań obrazkowych z wynikiem.",
      eyebrow: "Wiedza",
    },
    {
      quizId: "quiz_cities_visual_1",
      mode: "knowledge" as const,
      title: "Jakie to miasto",
      subtitle: "10 szybkich pytań ze znanych miast.",
      eyebrow: "Wiedza",
    },
    {
      quizId: "quiz_mood_match_1",
      mode: "personality" as const,
      title: "Do jakiego nastroju pasujesz?",
      subtitle: "8 pytań, wynik i vibe pasujący do Ciebie.",
      eyebrow: "Osobowość",
    },
    {
      quizId: "quiz_mood_picture_1",
      mode: "personality" as const,
      title: "Jaki masz dzisiaj nastrój?",
      subtitle: "8 pytań, wynik i vibe pasujący do Ciebie.",
      eyebrow: "Osobowość",
    },
    {
      quizId: "quiz_animal_personality",
      mode: "personality" as const,
      title: "Quiz osobowości: zwierzę",
      subtitle: "8 pytań, wynik i profil pasujący do Ciebie.",
      eyebrow: "Osobowość",
    },
  ].filter((quiz) => !completedQuizIds.includes(quiz.quizId));

  return (
    <div className="spk-picker">
      <div className="spk-picker__hero">
        <div className="spk-picker__eyebrow">Quiz Snapik</div>
        <h1 className="spk-picker__title">Wybierz quiz</h1>
        <p className="spk-picker__subtitle">Pokazujemy tylko niewypróbowane quizy.</p>
      </div>
      <div className="spk-picker__cards">
        {quizCards.length ? quizCards.map((quiz) => (
          <button key={quiz.quizId} className="spk-picker__card" onClick={() => onSelectQuiz({ quizId: quiz.quizId, mode: quiz.mode })}>
            <span className="spk-picker__eyebrow">{quiz.eyebrow}</span>
            <strong>{quiz.title}</strong>
            <span>{quiz.subtitle}</span>
          </button>
        )) : (
          <div className="spk-card">
            <h2 className="spk-title">Masz już zrobione wszystkie quizy</h2>
            <p className="spk-muted">Historia i ponowne pokazywanie wrócą później.</p>
          </div>
        )}
      </div>
      <button
        className="spk-picker__cta"
        onClick={() => {
          onGoToTools();
          window.dispatchEvent(new CustomEvent("spk-variant-change", { detail: "tools" }));
        }}
      >
        Przejdź do narzędzi
      </button>
    </div>
  );
}

export function QuizFlow() {
  const navigate = useNavigate();
  const [selection, setSelection] = useState<QuizSelection | null>(null);
  const [restartToken, setRestartToken] = useState(0);
  const [reviewPage, setReviewPage] = useState(0);
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>(() => readCompletedQuizzes());
  const quiz = useMemo(() => (selection ? getQuizDefinition(selection.quizId) : undefined), [selection]);
  const steps = quiz?.data.questions ?? [];
  const { current, index, progress, answer, skip, finished, score, answers } = useQuizEngine(steps);

  const startQuiz = (next: QuizSelection) => {
    setSelection(next);
    setRestartToken((t) => t + 1);
    setReviewPage(0);
  };

  if (!selection || !quiz) {
    return <RecommendationScreen completedQuizIds={completedQuizIds} onSelectQuiz={startQuiz} onGoToTools={() => navigate("/?variant=tools")} />;
  }

  if (finished) {
    const result = getQuizResult(quiz.id, answers.map((a) => a.answerId));
    const resultLabel = result.mode === "knowledge" ? `${result.percent}% (${result.bucket})` : `${result.title} — ${result.description}`;
    const showScore = result.mode === "knowledge";

    markCompletedQuiz(quiz.id);
    if (!completedQuizIds.includes(quiz.id)) {
      setCompletedQuizIds((prev) => [...prev, quiz.id]);
    }

    trackEvent("quiz_complete", {
      quizId: quiz.id,
      score,
      total: steps.length,
      resultMode: result.mode,
      percent: result.percent,
      bucket: result.bucket,
      toolRecommendations: result.toolRecommendations,
    });

    if (result.mode === "knowledge") {
      const review = getKnowledgeReview(quiz.id, answers.map((a) => a.answerId));
      const currentReview = review[reviewPage] ?? review[0];
      const canPrev = reviewPage > 0;
      const canNext = reviewPage < review.length - 1;

      return (
        <div className="spk-card">
          <h1 className="spk-title">Quiz ukończony</h1>
          {showScore ? <p className="spk-muted">Wynik: {score}/{steps.length}</p> : null}
          <p className="spk-muted">Wynik: {resultLabel}</p>
          {currentReview ? (
            <div className="spk-review">
              <h2 className="spk-title">{currentReview.prompt}</h2>
              <img className="spk-review__image" src={currentReview.image} alt={currentReview.prompt} />
              <p className="spk-muted">Twoja odpowiedź: {currentReview.userAnswer}</p>
              <p className="spk-muted">Dobra odpowiedź: {currentReview.correctAnswer}</p>
              <p className="spk-muted">{currentReview.encouragement}</p>
            </div>
          ) : null}
          <div className="spk-review__actions">
            <button className="spk-picker__cta" onClick={() => setReviewPage((page) => Math.max(page - 1, 0))} disabled={!canPrev}>
              Poprzednie
            </button>
            <button className="spk-picker__cta" onClick={() => setReviewPage((page) => Math.min(page + 1, review.length - 1))} disabled={!canNext}>
              Następne
            </button>
          </div>
          <button className="spk-picker__cta" onClick={() => navigate("/?variant=tools", { replace: false })}>
            Przejdź do tooli
          </button>
        </div>
      );
    }

    return (
      <div className="spk-card">
        <h1 className="spk-title">Quiz ukończony</h1>
        <p className="spk-muted">Wynik: {resultLabel}</p>
        <p className="spk-muted">Przejdź do zakładki narzędzi, aby zobaczyć kolejne kroki.</p>
        <button
          className="spk-picker__cta"
          onClick={() => {
            navigate("/?variant=tools", { replace: false });
            window.dispatchEvent(new CustomEvent("spk-variant-change", { detail: "tools" }));
          }}
        >
          Przejdź do tooli
        </button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <Question
      key={`${selection.quizId}:${restartToken}`}
      image={current.image}
      answers={current.answers}
      progress={progress}
      {...(current.prompt ? { prompt: current.prompt } : {})}
      timeLeftMs={QUESTION_TIMEOUT_MS}
      onSelect={(selected) => {
        trackEvent("quiz_step", {
          quizId: quiz.id,
          index,
          questionId: current.id,
          answerId: selected.id,
          ...("correct" in selected ? { isCorrect: selected.correct } : {}),
          ...("traits" in selected ? { traits: selected.traits } : {}),
          mode: quiz.type,
        });
      }}
      onTimeout={() => {
        trackEvent("quiz_step", {
          quizId: quiz.id,
          index,
          questionId: current.id,
          answerId: "timeout",
          timedOut: true,
          isCorrect: false,
          mode: quiz.type,
        });
        skip();
      }}
      onAnswer={(selected) => {
        const isCorrect = "correct" in selected ? Boolean(selected.correct) : false;
        answer(selected.id, isCorrect);
      }}
    />
  );
}
