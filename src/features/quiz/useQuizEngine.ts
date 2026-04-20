import { useMemo, useState } from "react";

export type QuizAnswer = {
  id: string;
  text: string;
  correct: boolean;
};

export type QuizStep = {
  id: string;
  image: string;
  prompt?: string;
  answers: QuizAnswer[];
};

export function useQuizEngine(steps: QuizStep[]) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const current = steps[index];

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round((index / steps.length) * 100);
  }, [index, steps.length]);

  const answer = (isCorrect: boolean) => {
    setScore((s) => s + (isCorrect ? 1 : 0));
    setAnswers((prev) => [...prev, isCorrect]);
    setIndex((i) => Math.min(i + 1, steps.length));
  };

  const finished = index >= steps.length;

  return { current, index, score, progress, answer, finished, answers };
}
