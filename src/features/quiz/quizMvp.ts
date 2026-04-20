import { trackEvent } from "../../core/tracking/trackEvent";
import { getQuizDefinition, getNextQuestionIndex, getQuizResult } from "./quizStore";
import { mountQuizUI } from "./quizUi";
import { getAnswersSoFarSafe } from "./quizStore";

export function startQuizEngine() {
  // MVP: initialize a small hardcoded quiz from the store and mount a minimal UI.
  const quizId = "quiz_1";
  const quiz = getQuizDefinition(quizId);
  if (!quiz) return;

  const questionIndex = getNextQuestionIndex();
  const question = quiz.questions[questionIndex];
  if (!question) return;

  trackEvent("quiz_step", {
    quizId,
    questionIndex,
    questionId: question.id,
    answerKey: "",
  });

  mountQuizUI({
    quizId,
    questions: quiz.questions,
    questionIndex,
    onAnswer: (answerKey) => {
      const nextIndex = questionIndex + 1;
      if (nextIndex < quiz.questions.length) {
        const nextQ = quiz.questions[nextIndex];
        if (!nextQ) return;
        trackEvent("quiz_step", {
          quizId,
          questionIndex: nextIndex,
          questionId: nextQ.id,
          answerKey,
        });
        mountQuizUI({
          quizId,
          questions: quiz.questions,
          questionIndex: nextIndex,
          onAnswer: (finalAnswerKey) => {
            const result = getQuizResult(quizId, [...getAnswersSoFarSafe(), finalAnswerKey]);
            trackEvent("quiz_complete", {
              quizId,
              resultId: result.resultId,
              resultTags: result.tags,
            });
          },
        });
      } else {
        const result = getQuizResult(quizId, [...getAnswersSoFarSafe(), answerKey]);
        trackEvent("quiz_complete", {
          quizId,
          resultId: result.resultId,
          resultTags: result.tags,
        });
      }
    },
  });
}
