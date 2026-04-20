import React from "react";
import ReactDOM from "react-dom/client";

let root: ReturnType<typeof ReactDOM.createRoot> | null = null;

export function mountRoot(node: React.ReactElement) {
  const el = document.getElementById("root");
  if (!el) return;
  if (!root) root = ReactDOM.createRoot(el);
  root.render(node);
}
