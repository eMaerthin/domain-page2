import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/App";
import "./shared/utils/styles.css";
import { hydrateQuizzesFromMongo, seedQuizzesOnRestart } from "./features/quiz/quizStore";

void hydrateQuizzesFromMongo();
void seedQuizzesOnRestart();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
