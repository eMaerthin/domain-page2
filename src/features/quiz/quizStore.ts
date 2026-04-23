import { quizSeed } from "../../data/quizSeed";
import { fetchQuizzes, postQuizSeedOnRestart } from "../../core/mongo/localMongoClient";

export type QuizType = "knowledge" | "personality";

export type KnowledgeAnswer = {
  id: string;
  text: string;
  correct: boolean;
};

export type PersonalityAnswer = {
  id: string;
  text: string;
  traits: string[];
};

export type Result = {
  id: string;
  title: string;
  description: string;
  image?: string;
  matchTraits: string[];
};

export type QuizQuestion<TAnswer> = {
  id: string;
  image: string;
  prompt?: string;
  answers: TAnswer[];
};

export type Quiz<TAnswer = KnowledgeAnswer | PersonalityAnswer> = {
  id: string;
  type: QuizType;
  title: string;
  tags: string[];
  data: {
    questions: QuizQuestion<TAnswer>[];
    results?: Result[];
  };
};

export type KnowledgeQuizResult = {
  mode: "knowledge";
  resultId: string;
  score: number;
  total: number;
  percent: number;
  bucket: "weak" | "ok" | "expert";
  tags: string[];
  toolRecommendations: string[];
};

export type PersonalityQuizResult = {
  mode: "personality";
  resultId: string;
  title: string;
  description: string;
  image?: string;
  score: number;
  total: number;
  percent: number;
  bucket: "match" | "fallback";
  tags: string[];
  toolRecommendations: string[];
};

export type QuizResult = KnowledgeQuizResult | PersonalityQuizResult;

const quizzes: Quiz<any>[] = [...quizSeed];

export function getQuizDefinition(quizId: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === quizId);
}

export async function hydrateQuizzesFromMongo() {
  const remoteQuizzes = await fetchQuizzes();
  const nextQuizzes = remoteQuizzes.length ? remoteQuizzes : quizSeed;
  quizzes.splice(0, quizzes.length, ...nextQuizzes);
}

export async function seedQuizzesOnRestart() {
  await postQuizSeedOnRestart();
}

export function getCurrentQuiz() {
  return quizSeed[0];
}

const STORE_KEY = "spk_quiz_answers";

function readAllAnswers(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function readAnswers(quizId: string): string[] {
  return readAllAnswers()[quizId] ?? [];
}

function writeAnswers(quizId: string, next: string[]) {
  try {
    const all = readAllAnswers();
    all[quizId] = next;
    localStorage.setItem(STORE_KEY, JSON.stringify(all));
  } catch {}
}

export function resetQuizProgress(quizId = quizSeed[0]?.id) {
  if (!quizId) return;
  writeAnswers(quizId, []);
}

export function getNextQuestionIndex(quizId = quizSeed[0]?.id) {
  if (!quizId) return 0;
  const answers = readAnswers(quizId);
  const quiz = getQuizDefinition(quizId);
  return Math.min(answers.length, quiz?.data.questions.length ?? 0);
}

export function mountAnswers(answerKey: string, questionIndex: number, quizId = quizSeed[0]?.id) {
  if (!quizId) return;
  const answers = readAnswers(quizId);
  const next = [...answers];
  next[questionIndex] = answerKey;
  writeAnswers(quizId, next);
}

export function getAnswersSoFar(quizId = quizSeed[0]?.id): string[] {
  if (!quizId) return [];
  return readAnswers(quizId);
}

export function getAnswersSoFarSafe(quizId = quizSeed[0]?.id) {
  return getAnswersSoFar(quizId);
}


export function getKnowledgeReview(quizId: string, answers: string[]) {
  const quiz = getQuizDefinition(quizId);
  if (!quiz || quiz.type !== "knowledge") return [];
  return quiz.data.questions.map((question, index) => {
    const userAnswerId = answers[index] ?? "";
    const userAnswer = question.answers.find((answer) => answer.id === userAnswerId);
    const correctAnswer = question.answers.find((answer) => "correct" in answer && answer.correct);
    return {
      questionId: question.id,
      image: question.image,
      prompt: question.prompt ?? quiz.title,
      userAnswer: userAnswer?.text ?? "Brak odpowiedzi",
      correctAnswer: correctAnswer?.text ?? "Brak poprawnej odpowiedzi",
      isCorrect: Boolean(userAnswerId && correctAnswer && userAnswerId === correctAnswer.id),
      encouragement: userAnswerId && correctAnswer && userAnswerId === correctAnswer.id ? "Dobrze!" : "Spróbuj ponownie następnym razem.",
    };
  });
}

export function getQuizResult(quizId: string, answers: string[]): QuizResult {
  const quiz = getQuizDefinition(quizId);
  if (!quiz) {
    return {
      mode: "knowledge",
      resultId: `${quizId}:unknown`,
      score: 0,
      total: 0,
      percent: 0,
      bucket: "weak",
      tags: ["quiz"],
      toolRecommendations: ["tools"],
    };
  }

  if (quiz.type === "knowledge") {
    const total = quiz.data.questions.length;
    const score = quiz.data.questions.reduce((acc, q, idx) => {
      const correctId = q.answers.find((a) => "correct" in a && a.correct)?.id;
      return acc + (answers[idx] === correctId ? 1 : 0);
    }, 0);
    const percent = total ? Math.round((score / total) * 100) : 0;
    const bucket: KnowledgeQuizResult["bucket"] = percent >= 70 ? "expert" : percent >= 40 ? "ok" : "weak";
    const toolRecommendations =
      bucket === "expert"
        ? ["tools"]
        : bucket === "ok"
          ? ["tools"]
          : ["tools"];
    return {
      mode: "knowledge",
      resultId: `${quiz.id}:${bucket}`,
      score,
      total,
      percent,
      bucket,
      tags: quiz.tags,
      toolRecommendations,
    };
  }

  const resultTraits = quiz.data.questions.reduce<Record<string, number>>((acc, q, idx) => {
    const selected = q.answers.find((a) => a.id === answers[idx]) as PersonalityAnswer | undefined;
    for (const trait of selected?.traits ?? []) acc[trait] = (acc[trait] ?? 0) + 1;
    return acc;
  }, {});
  const results = quiz.data.results ?? [];
  const ranked = results
    .map((result) => ({
      result,
      score: result.matchTraits.reduce((sum, trait) => sum + (resultTraits[trait] ?? 0), 0),
    }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked[0]?.result ?? results[0];
  const total = quiz.data.questions.length;
  const score = ranked[0]?.score ?? 0;
  const percent = total ? Math.round((score / total) * 100) : 0;
  const bucket: PersonalityQuizResult["bucket"] = winner ? "match" : "fallback";

  return {
    mode: "personality",
    resultId: winner?.id ?? `${quiz.id}:fallback`,
    title: winner?.title ?? quiz.title,
    description: winner?.description ?? "",
    ...(winner?.image ? { image: winner.image } : {}),
    score,
    total,
    percent,
    bucket,
    tags: quiz.tags,
    toolRecommendations: ["tools"],
  };
}
