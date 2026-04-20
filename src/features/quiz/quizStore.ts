import type { ExperimentVariant } from "../../core/experiment/types";

type QuizOption = { key: string; label: string };
type QuizQuestion = { id: string; prompt: string; options: QuizOption[] };
type QuizResult = { resultId: string; tags: string[] };
type QuizDefinition = {
  id: string;
  questions: QuizQuestion[];
  resultMapping: Record<string, QuizResult>;
};

const quiz_1: QuizDefinition = {
  id: "quiz_1",
  questions: [
    {
      id: "q1",
      prompt: "Pick your focus:",
      options: [
        { key: "growth", label: "Growth" },
        { key: "money", label: "Monetization" },
      ],
    },
    {
      id: "q2",
      prompt: "Choose your style:",
      options: [
        { key: "fast", label: "Fast" },
        { key: "viral", label: "Viral" },
      ],
    },
  ],
  resultMapping: {
    growth__fast: { resultId: "r1", tags: ["quiz", "growth", "fast"] },
    growth__viral: { resultId: "r2", tags: ["quiz", "growth", "viral"] },
    money__fast: { resultId: "r3", tags: ["quiz", "money", "fast"] },
    money__viral: { resultId: "r4", tags: ["quiz", "money", "viral"] },
  },
};

export function getQuizDefinition(quizId: string): QuizDefinition | undefined {
  if (quizId === "quiz_1") return quiz_1;
  return undefined;
}

const STORE_KEY = "spk_quiz_answers";

function readAnswers(): string[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

function writeAnswers(next: string[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {}
}

export function resetQuizProgress() {
  writeAnswers([]);
}

export function getNextQuestionIndex() {
  const answers = readAnswers();
  return Math.min(answers.length, quiz_1.questions.length - 1);
}

export function quizAnswersToKey(answers: string[]) {
  return answers.join("__");
}

export function getQuizResult(quizId: string, answers: string[]): QuizResult {
  const key = quizAnswersToKey(answers);
  const result = quiz_1.resultMapping[key] ?? { resultId: "r_unknown", tags: ["quiz", "unknown"] };
  return result;
}

export function getAnswersSoFarSafe() {
  return getAnswersSoFar();
}

export function mountAnswers(answerKey: string, questionIndex: number) {
  const answers = readAnswers();
  const next = [...answers];
  next[questionIndex] = answerKey;
  writeAnswers(next);
}

export function getAnswersSoFar(): string[] {
  return readAnswers();
}

export function answersSoFar(answerKey: string) {
  const answers = readAnswers();
  return [...answers, answerKey];
}
