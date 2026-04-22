import { quizSeed } from "../../data/quizSeed";

export type QuizAssetManifest = {
  quizzes: typeof quizSeed;
};

export function buildQuizManifest(): QuizAssetManifest {
  return { quizzes: quizSeed };
}
