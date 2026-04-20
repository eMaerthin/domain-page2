import { useEffect } from "react";
import { resetQuizProgress, mountAnswers } from "./quizStore";

export type QuizUiMountArgs = {
  quizId: string;
  questions: Array<{
    id: string;
    image: string;
    answers: Array<{ id: string; text: string; correct: boolean }>;
  }>;
  questionIndex: number;
  onAnswer: (answerKey: string) => void;
};

export function mountQuizUI(args: QuizUiMountArgs) {
  resetQuizProgress();
  // TODO: Replace with proper React routing; for MVP we use a window-scoped renderer below.
  (window as any).__spkMountQuizUI?.(args);
}

export function InstallQuizUI() {
  useEffect(() => {
    (window as any).__spkMountQuizUI = (args: QuizUiMountArgs) => {
      const el = document.getElementById("root");
      if (!el) return;
      // Simple non-React MVP render to keep Vite/Rolldown happy.
      const q = args.questions[args.questionIndex];
      if (!q) return;
      const buttons = q.answers
        .map(
          (opt) =>
            `<button class="spk-btn" data-opt="${opt.id}">${opt.text}</button>`,
        )
        .join("");
      el.innerHTML = `
        <div class="spk-card">
          <h1 class="spk-title"></h1>
          <div class="spk-options">${buttons}</div>
        </div>
      `;
      el.querySelectorAll<HTMLButtonElement>("button[data-opt]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-opt") ?? "";
          mountAnswers(key, args.questionIndex);
          args.onAnswer(key);
        });
      });
    };
  }, []);
  return null;
}

// React JSX intentionally omitted in this MVP file to avoid build transform issues.
