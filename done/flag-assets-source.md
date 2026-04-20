# Done: Flag assets source and local wiring

## Source chosen
- Wikimedia Commons SVG flag pages were selected as the canonical source for country flag artwork.
- Local static SVG placeholders were created under `public/assets/flags/` for the quiz.

## Implemented
- Added local SVGs for:
  - France
  - Japan
  - Germany
  - Italy
  - Brazil
  - Canada
  - Sweden
  - United Kingdom
  - Spain
  - United States
- Updated the quiz question bank to use local `/assets/flags/*.svg` paths.

## Notes
- This keeps the quiz independent from hotlinked remote images and improves reliability on mobile.
