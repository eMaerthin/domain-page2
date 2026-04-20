export type Answer = {
  id: string;
  text: string;
  correct: boolean;
};

export type Question = {
  id: string;
  image: string;
  prompt?: string;
  answers: Answer[];
};

export type Quiz = {
  id: string;
  title: string;
  tags: string[];
  data: {
    questions: Question[];
  };
};

export type QuizResult = {
  resultId: string;
  score: number;
  total: number;
  percent: number;
  bucket: "weak" | "ok" | "expert";
  tags: string[];
  toolRecommendations: string[];
};

const quiz_1: Quiz = {
  id: "quiz_flags_visual_1",
  title: "Czy rozpoznasz flagi świata?",
  tags: ["geografia", "flagi"],
  data: {
    questions: [
      {
        id: "q1",
        image: "/assets/flags/france.png",
        answers: [
          { id: "a", text: "Francja", correct: true },
          { id: "b", text: "Włochy", correct: false },
          { id: "c", text: "Holandia", correct: false },
        ],
      },
      {
        id: "q2",
        image: "/assets/flags/japan.png",
        answers: [
          { id: "a", text: "Chiny", correct: false },
          { id: "b", text: "Japonia", correct: true },
          { id: "c", text: "Korea", correct: false },
        ],
      },
      {
        id: "q3",
        image: "/assets/flags/germany.png",
        answers: [
          { id: "a", text: "Belgia", correct: false },
          { id: "b", text: "Niemcy", correct: true },
          { id: "c", text: "Austria", correct: false },
        ],
      },
      {
        id: "q4",
        image: "/assets/flags/italy.png",
        answers: [
          { id: "a", text: "Włochy", correct: true },
          { id: "b", text: "Francja", correct: false },
          { id: "c", text: "Hiszpania", correct: false },
        ],
      },
      {
        id: "q5",
        image: "/assets/flags/brazil.png",
        answers: [
          { id: "a", text: "Argentyna", correct: false },
          { id: "b", text: "Brazylia", correct: true },
          { id: "c", text: "Kolumbia", correct: false },
        ],
      },
      {
        id: "q6",
        image: "/assets/flags/canada.png",
        answers: [
          { id: "a", text: "Kanada", correct: true },
          { id: "b", text: "USA", correct: false },
          { id: "c", text: "Austria", correct: false },
        ],
      },
      {
        id: "q7",
        image: "/assets/flags/sweden.png",
        answers: [
          { id: "a", text: "Norwegia", correct: false },
          { id: "b", text: "Szwecja", correct: true },
          { id: "c", text: "Finlandia", correct: false },
        ],
      },
      {
        id: "q8",
        image: "/assets/flags/uk.png",
        answers: [
          { id: "a", text: "Wielka Brytania", correct: true },
          { id: "b", text: "Irlandia", correct: false },
          { id: "c", text: "Australia", correct: false },
        ],
      },
      {
        id: "q9",
        image: "/assets/flags/spain.png",
        answers: [
          { id: "a", text: "Hiszpania", correct: true },
          { id: "b", text: "Portugalia", correct: false },
          { id: "c", text: "Meksyk", correct: false },
        ],
      },
      {
        id: "q10",
        image: "/assets/flags/usa.png",
        answers: [
          { id: "a", text: "USA", correct: true },
          { id: "b", text: "Kanada", correct: false },
          { id: "c", text: "Wielka Brytania", correct: false },
        ],
      },
    ],
  },
};

export function getQuizDefinition(quizId: string): Quiz | undefined {
  if (quizId === quiz_1.id) return quiz_1;
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
  return Math.min(answers.length, quiz_1.data.questions.length);
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

export function getAnswersSoFarSafe() {
  return getAnswersSoFar();
}

export function getQuizResult(quizId: string, answers: string[]): QuizResult {
  const quiz = getQuizDefinition(quizId);
  const total = quiz?.data.questions.length ?? 0;
  const score = quiz?.data.questions.reduce((acc, q, idx) => acc + (answers[idx] === q.answers.find((a) => a.correct)?.id ? 1 : 0), 0) ?? 0;
  const percent = total ? Math.round((score / total) * 100) : 0;
  const bucket: QuizResult["bucket"] = percent >= 70 ? "expert" : percent >= 40 ? "ok" : "weak";

  const toolRecommendations =
    bucket === "expert"
      ? ["ai_generator:viralhook", "ai_generator:promopost"]
      : bucket === "ok"
        ? ["ai_generator:bioshort", "utility:nameideas"]
        : ["utility:headlinebank", "ai_generator:promopost"];

  return {
    resultId: `${quiz?.id ?? quizId}:${bucket}`,
    score,
    total,
    percent,
    bucket,
    tags: quiz?.tags ?? ["quiz"],
    toolRecommendations,
  };
}

export function getCurrentQuiz() {
  return quiz_1;
}

export function getCorrectAnswerId(questionId: string) {
  const question = quiz_1.data.questions.find((q) => q.id === questionId);
  return question?.answers.find((a) => a.correct)?.id;
}
