# Done: Quiz scoring and recommendations

## Implemented
- Replaced result-mapping style quiz outcomes with score-based scoring.
- Added quiz buckets:
  - `weak`
  - `ok`
  - `expert`
- Added tool recommendations based on score bucket.
- Included recommendations in `quiz_complete` tracking payload.

## Notes
- This made the quiz outcome more useful and connected it to the tools loop.
- However, current recommendation labels may still be too generic for users and should be replaced with more actionable outputs in the backlog.
