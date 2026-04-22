import { trackEvent } from "../../core/tracking/trackEvent";
import { getQuizDefinition, getNextQuestionIndex, getQuizResult, getAnswersSoFarSafe } from "./quizStore";
import { mountQuizUI } from "./quizUi";

export function startQuizEngine() {
  const quizId = "quiz_flags_visual_1";
  const quiz = getQuizDefinition(quizId);
  if (!quiz || quiz.type !== "knowledge") return;

  const questionIndex = getNextQuestionIndex(quizId);
  const question = quiz.data.questions[questionIndex];
  if (!question) return;

  trackEvent("quiz_step", {
    quizId,
    questionIndex,
    questionId: question.id,
    answerKey: "",
  });

  mountQuizUI({
    quizId,
    questions: quiz.data.questions as Array<{ id: string; image: string; answers: Array<{ id: string; text: string; correct: boolean }> }>,
    questionIndex,
    onAnswer: (answerKey) => {
      const nextIndex = questionIndex + 1;
      if (nextIndex < quiz.data.questions.length) {
        const nextQ = quiz.data.questions[nextIndex];
        if (!nextQ) return;
        trackEvent("quiz_step", {
          quizId,
          questionIndex: nextIndex,
          questionId: nextQ.id,
          answerKey,
        });
        mountQuizUI({
          quizId,
          questions: quiz.data.questions as Array<{ id: string; image: string; answers: Array<{ id: string; text: string; correct: boolean }> }>,
          questionIndex: nextIndex,
          onAnswer: (finalAnswerKey) => {
            const result = getQuizResult(quizId, [...getAnswersSoFarSafe(quizId), finalAnswerKey]);
            trackEvent("quiz_complete", {
              quizId,
              resultId: result.resultId,
              resultTags: result.tags,
              toolRecommendations: result.toolRecommendations,
            });
          },
        });
      } else {
        const result = getQuizResult(quizId, [...getAnswersSoFarSafe(quizId), answerKey]);
        trackEvent("quiz_complete", {
          quizId,
          resultId: result.resultId,
          resultTags: result.tags,
          toolRecommendations: result.toolRecommendations,
        });
      }
    },
  });
}
