import { useMemo } from "react";
import type { QuizQuestion } from "./quizUiTypes";

export function useQuizQuestion(questions: QuizQuestion[], questionIndex: number) {
  return useMemo(() => {
    return { question: questions[questionIndex] };
  }, [questions, questionIndex]);
}
