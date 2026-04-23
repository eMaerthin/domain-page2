import { useEffect, useState } from "react";

export type QuestionProps<TAnswer extends { id: string; text: string }> = {
  image?: string;
  prompt?: string;
  answers: TAnswer[];
  progress?: number;
  timeLeftMs?: number;
  onSelect?: (answer: TAnswer) => void;
  onTimeout?: () => void;
  onAnswer: (answer: TAnswer) => void;
};

export default function Question<TAnswer extends { id: string; text: string }>({ image, answers, progress = 0, prompt, timeLeftMs, onSelect, onTimeout, onAnswer }: QuestionProps<TAnswer>) {
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(typeof timeLeftMs === "number" ? timeLeftMs : null);

  useEffect(() => {
    setSelected(null);
    setTimeLeft(typeof timeLeftMs === "number" ? timeLeftMs : null);
  }, [image, timeLeftMs]);

  useEffect(() => {
    if (!timeLeftMs || selected) return;
    const startedAt = Date.now();
    const tick = () => {
      const remaining = Math.max(0, timeLeftMs - (Date.now() - startedAt));
      setTimeLeft(remaining);
      if (remaining <= 0) onTimeout?.();
    };
    tick();
    const intervalId = window.setInterval(tick, 250);
    const timeoutId = window.setTimeout(() => onTimeout?.(), timeLeftMs);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [timeLeftMs, selected, onTimeout]);

  const handleClick = (a: TAnswer) => {
    if (selected) return;
    setSelected(a.id);
    onSelect?.(a);
    navigator.vibrate?.(30);
    window.setTimeout(() => onAnswer(a), 350);
  };

  return (
    <div className="spk-question">
      <div className="spk-question__hero">
        {image ? <img src={image} alt="quiz visual" className="spk-question__image" loading="eager" decoding="async" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} /> : null}
        <div className="spk-question__overlay" />
        {prompt ? <div className="spk-question__prompt">{prompt}</div> : null}
        {typeof timeLeft === "number" ? <div className="spk-question__timer">{Math.max(0, Math.ceil(timeLeft / 1000))}</div> : null}
      </div>

      <div className="spk-question__progress">
        <div className="spk-question__progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="spk-question__answers">
        {answers.map((a) => {
          const isSelected = selected === a.id;
          return (
            <button key={a.id} onClick={() => handleClick(a)} className={["spk-question__answer", isSelected ? "spk-question__answer--selected" : ""].join(" ")}>
              {a.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
