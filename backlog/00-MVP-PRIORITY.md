# MVP Backlog (Priority-ordered)

Scope: deterministic experiments + quiz/tools MVP + tracking + ads placements + cross-loop recirculation (maximize PV/user; minimal UX polish).

## P0 — Must ship first (baseline + monetization instrumentation)

1. **Experiment assignment engine (sticky + deterministic)**
   - Variants: `quiz`, `tools`, `hybrid`
   - Deterministic: `hash(user_id + experiment_name) % weights`
   - Override: `?variant=...` (ignore random, sticky in cookie/localStorage)
   - Output: single `variant` value available app-wide.
   - Acceptance:
     - Opening same link repeatedly yields same variant.
     - Changing `?variant=` yields new sticky variant.

2. **Routing + variant feeds**
   - Map variant → feed:
     - `quiz` → `QuizFeed`
     - `tools` → `ToolsFeed`
     - `hybrid` → `HybridFeed`
   - Acceptance:
     - Exactly one feed renders for the current variant.

3. **Tracking pipeline (front-end → `/api/track` contract)**
   - Events:
     - `page_view`
     - `quiz_step`
     - `quiz_complete`
     - `tool_used`
     - `ad_impression`
   - Implementation:
     - Provide a `trackEvent(eventName, payload)` wrapper.
     - Buffer + retry (best-effort) when network fails.
   - Acceptance:
     - Calling `trackEvent` results in network requests with correct payload shape.

4. **Ads placement scaffolding (in-flow + sidebar + sticky)**
   - Mobile:
     - sticky bottom ads
     - ads between steps / occasional interstitial
   - Desktop:
     - sidebar ads (highest RPM)
     - in-content ad slots
   - Implementation:
     - Create `AdSlot` component with `slotId` and `onImpression`.
   - Acceptance:
     - Each rendered ad slot emits `ad_impression` once per session/slot.

## P1 — Core engagement loops (PV/user)

5. **Quiz MVP: multi-page quiz engine**
   - Data model:
     - Quiz definition: questions list (id, text, options)
     - Answer submission → next question or result
   - UX constraints (mobile-first):
     - 1 question per screen
     - auto-next after answer (no extra nav)
   - Revenue logic:
     - ad per question
     - ad at result
   - Tracking:
     - `quiz_step` per question
     - `quiz_complete` at end
   - Acceptance:
     - Quiz completes end-to-end and reaches result view.
     - Step tracking matches question count.

6. **Tools MVP: input → generate → recommend**
   - Tools definitions (at least 2):
     - `ai_generator` (e.g., “bio/roast/avatar text”)
     - `utility` (e.g., “name ideas”)
   - Flow:
     - user input
     - render generated output
     - recommend next quiz/tool to maximize recirculation
   - Tracking:
     - `tool_used` with tool name + tool outcome metadata
   - Acceptance:
     - Tool can be used and produces output (mock OK initially).

7. **Cross-loop recommendation system (critical)**
   - After completion:
     - `quiz` → show tools + quizzes
     - `tool` → show quizzes + tools
   - Minimal algorithm:
     - deterministic mapping from result/tool category → recommended content ids
   - Acceptance:
     - User sees at least 2 recommended items after completing quiz/tool.

## P2 — Content + feed system (scaling)

8. **Unified content JSON store**
   - `content { id, type, title, data, tags }`
   - Feed logic:
     - `variant=quiz` → quiz content first
     - `variant=tools` → tools content first
     - `hybrid` → mixed strategy
   - Acceptance:
     - Feed renders from the JSON store; no hardcoded UI lists.

9. **Tool/quiz result personalization (lightweight)**
   - Rule-based using quiz answers or tool input tags.
   - Acceptance:
     - Different answers produce different recommendation sets.

## P3 — Production hardening

10. **Backend/API (or mocked gateway)**
   - Provide endpoints used by the frontend:
     - `GET /quiz/:id`
     - `GET /quiz/:id/question/:index`
     - `POST /quiz/:id/answer`
     - `GET /quiz/:id/result`
     - `POST /api/track`
   - Acceptance:
     - Frontend can run fully against local backend (or mocks with same contract).

11. **Ad integration wiring**
   - Replace placeholders with real AdSense/partner ad loaders.
   - Acceptance:
     - Ad impressions trigger tracking integration.

12. **Performance + SEO basics**
   - Ensure fast mobile load:
     - code splitting (as needed)
     - remove unused assets
   - Acceptance:
     - Lighthouse mobile score target agreed internally.
