import { useMemo, useState } from "react";

export type QuizStep<TAnswer> = {
  id: string;
  image: string;
  prompt?: string;
  answers: TAnswer[];
};

export function useQuizEngine<TAnswer>(steps: QuizStep<TAnswer>[]) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ answerId: string; correct: boolean }>>([]);

  const current = steps[index];

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round((index / steps.length) * 100);
  }, [index, steps.length]);

  const answer = (answerId: string, correct: boolean) => {
    setScore((s) => s + (correct ? 1 : 0));
    setAnswers((prev) => [...prev, { answerId, correct }]);
    setIndex((i) => Math.min(i + 1, steps.length));
  };

  const skip = () => {
    setAnswers((prev) => [...prev, { answerId: "timeout", correct: false }]);
    setIndex((i) => Math.min(i + 1, steps.length));
  };

  const finished = index >= steps.length;

  return { current, index, score, progress, answer, skip, finished, answers };
}
