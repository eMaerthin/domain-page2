import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/snapik.pl/",
  build: {
    outDir: "docs",
    emptyOutDir: true,
  },
});
