import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules/**", "docs/**", "dist/**"],
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {},
    },
    rules: {
      // keep empty for now (MVP safety checks only)
    },
  },
];
