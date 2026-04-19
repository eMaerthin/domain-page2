# Tracking Contract (MVP)

## Endpoint
`POST /api/track`

## Event schema
All events share:
- `event`: string (one of: `page_view`, `quiz_step`, `quiz_complete`, `tool_used`, `ad_impression`)
- `ts`: ISO timestamp
- `session_id`: stable per browser session
- `user_id`: stable per user (from `spk_uid` or equivalent)
- `experiment_name`: always `homepage_v1` (for now)
- `variant`: `quiz | tools | hybrid`
- `payload`: event-specific object

## Event definitions

### `page_view`
- payload:
  - `page`: string (e.g., `quiz_feed`, `tools_feed`, `quiz_question`, `quiz_result`, `tool_page`)

### `quiz_step`
- payload:
  - `quizId`: string
  - `questionIndex`: number
  - `questionId`: string
  - `answerKey`: string (or normalized answer id)

### `quiz_complete`
- payload:
  - `quizId`: string
  - `resultId`: string
  - `resultTags`: string[]

### `tool_used`
- payload:
  - `toolId`: string
  - `toolCategory`: string
  - `inputTags`: string[]
  - `outputTags`: string[]

### `ad_impression`
- payload:
  - `slotId`: string
  - `adType`: string (e.g., `sidebar`, `sticky_bottom`, `in_content`)
  - `placementContext`: string (e.g., `quiz_step`, `result`, `header`)

## Buffering rules (frontend)
- Queue events when offline / request fails.
- Flush in order, capped (e.g., 50 events) to avoid unbounded memory.
- De-dupe `ad_impression` by `slotId + placementContext` per session.
