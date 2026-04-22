const targetMap: Record<string, string> = {
  "ą": "a",
  "ć": "c",
  "ę": "e",
  "ł": "l",
  "ń": "n",
  "ó": "o",
  "ś": "s",
  "ź": "z",
  "ż": "z",
};

function normalize(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => targetMap[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "");
}

export function buildNicknameSuggestions(seed: string) {
  const base = normalize(seed);
  const words = ["sokol", "piorun", "lisek", "wilczyk", "iskra", "blysk"];
  const suffixes = ["pro", "x", "go", "max", "flow", "mix"];

  return Array.from({ length: 3 }, (_, index) => {
    const head = words[index] ?? "nickname";
    const tail = suffixes[index] ?? "mix";
    return base ? `${base}-${head}-${tail}` : `${head}-${tail}`;
  });
}
