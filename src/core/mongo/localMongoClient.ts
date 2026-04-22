import { quizSeed } from "../../data/quizSeed";
import { buildQuizManifest } from "../content/quizCatalog";

const baseUrl = import.meta.env.VITE_LOCAL_MONGODB_URL ?? "http://localhost:3031";
const manifest = buildQuizManifest();

export async function fetchQuizzes() {
  try {
    const res = await fetch(`${baseUrl}/api/quizzes`);
    if (!res.ok) return quizSeed;
    const data = (await res.json()) as typeof quizSeed;
    return Array.isArray(data) && data.length ? data : manifest.quizzes;
  } catch {
    return manifest.quizzes;
  }
}

export async function postQuizSeedOnRestart() {
  try {
    await fetch(`${baseUrl}/api/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...manifest, mode: "preserve" }),
    });
  } catch {}
}
