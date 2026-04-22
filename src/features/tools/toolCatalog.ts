export type ToolDefinition = {
  id: string;
  category: string;
  title: string;
  description: string;
  placeholder: string;
};

export const toolCatalog: ToolDefinition[] = [
  {
    id: "name_generator",
    category: "Generator",
    title: "Generator nicków",
    description: "Generuje stylizowane nicki na podstawie wpisanego tekstu.",
    placeholder: "Wpisz vibe, hobby albo słowo, np. 'sokół' lub 'gracz'",
  },
  {
    id: "password_generator",
    category: "Generator",
    title: "Generator haseł",
    description: "Tworzy losowe hasła przez randomuser.me.",
    placeholder: "np. 10-24",
  },
];

export function getDefaultTool() {
  return toolCatalog[0] ?? toolCatalog[1];
}
