# Agents & Feature Implementation Guide

This repo implements **SNAPIK** as an experiment-driven React app served via GitHub Pages (`docs/` output).

## Product intent
- Optimize for **PV/user**, retention, and monetization loops.
- Prioritize **content/product loops** over UI polish.
- The app must support **A/B product variants** (`quiz`, `tools`, `hybrid`) with sticky assignment.
- The codebase must remain deployable from `docs/` and safe for GitHub Pages.

## Repo structure (relevant)
- `src/core/experiment/*` — deterministic A/B variant assignment (`quiz | tools | hybrid`)
- `src/core/device/*` — device detection (mobile vs desktop)
- `src/core/tracking/*` — tracking wrapper (`trackEvent`)
- `src/features/quiz/*` — quiz engine + quiz feed
- `src/features/tools/*` — tools engine + tools feed
- `src/features/feed/*` — hybrid composition / cross-loop feed
- `src/features/ads/*` — ad placement components
- `src/shared/components/FeedRouter.tsx` — routes by experiment variant
- `src/layouts/*` — adaptive layouts (mobile vs desktop)
- `backlog/` — prioritized future work and MVP scope
- `done/` — completed work notes and implementation history
- `public/assets/flags/` — local flag SVG assets for quiz questions

## Hard requirements (do not break)
1. **Deterministic experiments**
   - `?variant=quiz|tools|hybrid` overrides randomness.
   - Assignment must be **sticky** in `localStorage`/cookie.
   - Variant assignment is by `hash(user_id + experiment_name) % weights`.
2. **One feed per variant**
   - `quiz` → quiz flow
   - `tools` → tools flow
   - `hybrid` → cross-loop composition (quiz + tools)
3. **Tracking events**
   - `page_view`
   - `quiz_step`, `quiz_complete`
   - `tool_used`
   - `ad_impression`
   - Use `trackEvent(eventName, payload)` from `src/core/tracking/trackEvent.ts`.
4. **Ads inside flow**
   - Mobile: sticky bottom ads
   - Desktop: sidebar ads
   - Ad slots must emit `ad_impression`.

## Runtime / deployment decisions
- Frontend scaffold: **Vite + React + TypeScript**.
- Production output: `docs/`.
- Custom domain: `snapik.pl` via `docs/CNAME`.
- Analytics: Google Analytics gtag is already embedded in the site shell.
- CI must run:
  - `npm ci`
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
- Local pre-commit (Husky) must run at least:
  - `npm run typecheck`
  - `npm run build`
- The repo should avoid pushing commits unless the local validation commands above pass.

## “Both pages” feature checklist (Quiz + Tools, plus Hybrid)
Implement features so they work consistently across both **quiz** and **tools** pages, and then compose them in **hybrid**:

### 1) Quiz page (variant `quiz`)
- Multi-step loop:
  - Render **one question per step**
  - After answer: move to next question
  - At end: show result and trigger recommendations
- Tracking:
  - `page_view` on entry
  - `quiz_step` per question transition
  - `quiz_complete` at result
- Cross-loop transition:
  - After `quiz_complete`, surface **tools recommendations**.

### 2) Tools page (variant `tools`)
- Interaction loop:
  - Accept input
  - Generate output (MVP can be mocked)
  - After completion: surface next content
- Tracking:
  - `page_view` on entry
  - `tool_used` including toolId/category and input/output tags (as available)
- Cross-loop transition:
  - After tool completion, surface **quiz recommendations**.

### 3) Hybrid page (variant `hybrid`)
- Must coordinate cross-loop:
  - Prefer showing quiz flow first
  - After quiz completion, show tools + tools recommendations
  - If tools is the next interaction, return back to quiz recommendations
- Tracking consistency:
  - Use the same events as quiz/tools (`page_view` with distinct `page` values, plus `quiz_*` and `tool_used`)

## Current implemented state (for external audit)
- Experiment assignment hook exists and is sticky.
- `quiz` has an MVP loop and now produces **tool recommendations** from quiz outcomes.
- `tools` is still mostly placeholder.
- `hybrid` is still mostly placeholder / cross-loop shell.
- Ads are placeholders and need real impression wiring.
- Tracking wrapper exists, but `/api/track` is still not implemented.
- Completed work is documented under `done/*.md`; future priorities live under `backlog/*.md`.
- Quiz flag art should be local SVGs under `public/assets/flags/`, sourced from Wikimedia Commons-style country flags (or equivalent license-safe source).
- Current quiz recommendations are too generic (`ai_generator:bioshort`, `utility:nameideas`) and should be treated as a backlog issue; future outputs must be more actionable and outcome-specific.
- New backlog item: local MongoDB + builder/seed script for 5 knowledge and 5 personality quizzes before scaling content APIs.
- New backlog item: AI quiz generator pipeline (prompt + LLM + validation + normalization + batch generation) for both knowledge and personality quizzes.

## Execution notes
- Ensure `npm run typecheck` and `npm run build` pass before committing.
- Keep deployments stable: changes must update `docs/` by running `npm run build` and committing the output.
- When proposing backlog items, prefer **ordered, dependency-aware items** that unblock revenue/retention first:
  1. hybrid cross-loop
  2. tools MVP
  3. real tracking backend
  4. ad impression wiring
  5. persistence/SEO/perf hardening

## Editing / patching howto
- Before editing any file, read the **latest version** first if the tool warns about external modifications.
- Prefer **single-file, focused edits**; do not bundle unrelated changes into one patch.
- If `ApplyPatch` fails, treat it as a signal to **re-read the target file** and patch against the latest contents rather than retrying the same hunk.
- Keep patches exact:
  - avoid rewriting large blocks unless required
  - preserve existing formatting and imports
  - use explicit, stable line contexts
- After any code edit, run the relevant validator(s) immediately:
  - `npm run typecheck`
  - `npm run build`
- If a patch is touching a file that was modified externally, stop and re-read before editing again.
