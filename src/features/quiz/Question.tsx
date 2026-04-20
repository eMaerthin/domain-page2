import { useEffect, useState } from "react";

export type Answer = {
  id: string;
  text: string;
  correct: boolean;
};

type QuestionProps = {
  image: string;
  answers: Answer[];
  progress?: number;
  onAnswer: (isCorrect: boolean) => void;
};

export default function Question({ image, answers, progress = 0, onAnswer }: QuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [image]);

  const handleClick = (a: Answer) => {
    if (selected) return;
    setSelected(a.id);
    navigator.vibrate?.(30);
    window.setTimeout(() => onAnswer(a.correct), 350);
  };

  return (
    <div className="spk-question">
      <div className="spk-question__hero">
        <img src={image} alt="" className="spk-question__image" loading="eager" />
        <div className="spk-question__overlay" />
        <div className="spk-question__progress">
          <div className="spk-question__progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="spk-question__answers">
        {answers.map((a) => {
          const isSelected = selected === a.id;
          return (
            <button
              key={a.id}
              onClick={() => handleClick(a)}
              className={[
                "spk-question__answer",
                isSelected ? (a.correct ? "spk-question__answer--correct" : "spk-question__answer--wrong") : "",
              ].join(" ")}
            >
              {a.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
