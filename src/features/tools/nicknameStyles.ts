const stylizers = [
  (text: string) => `【${text}】`,
  (text: string) => `★ ${text} ★`,
  (text: string) => `~✦~ ${text} ~✦~`,
  (text: string) => `(${text})`,
  (text: string) => `${text} ✨`,
  (text: string) => `⌁ ${text} ⌁`,
  (text: string) => `› ${text} ‹`,
  (text: string) => `❖ ${text} ❖`,
  (text: string) => `✧ ${text} ✧`,
  (text: string) => `«${text}»`,
  (text: string) => `〔${text}〕`,
  (text: string) => `⟦${text}⟧`,
  (text: string) => `⚡ ${text} ⚡`,
  (text: string) => `♡ ${text} ♡`,
  (text: string) => `☾ ${text} ☽`,
  (text: string) => `♪ ${text} ♪`,
  (text: string) => `✿ ${text} ✿`,
  (text: string) => `░${text}░`,
  (text: string) => `▣ ${text} ▣`,
  (text: string) => `◈ ${text} ◈`,
  (text: string) => `❂ ${text} ❂`,
  (text: string) => `⟁ ${text} ⟁`,
  (text: string) => `⟊ ${text} ⟊`,
  (text: string) => `༺ ${text} ༻`,
  (text: string) => `꧁ ${text} ꧂`,
  (text: string) => `༒ ${text} ༒`,
  (text: string) => `✦ ${text} ✦`,
  (text: string) => `❋ ${text} ❋`,
  (text: string) => `✺ ${text} ✺`,
];

export function buildStyledNicknames(seed: string) {
  const input = seed.trim() || "nick";
  const shuffled = [...stylizers].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map((stylizer) => stylizer(input));
}
