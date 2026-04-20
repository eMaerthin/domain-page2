export type QuizOption = { key: string; label: string };

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
};
