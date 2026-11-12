# Verification — 12 November 2026

## Completed

- `npm test`: **10 passing tests** covering URL validation, private-data exclusion, safe text rendering, filtering/sorting, multi-page GitHub imports, failed-page handling, concurrent server caching, retry behavior, and profile accuracy.
- `npm run build`: successful. Builds the site and printable profile without package downloads.
- Browser review at desktop width and iframe viewports of **390 px** and **768 px**. No horizontal overflow observed at the checked mobile and desktop widths.
- Verified mobile navigation and project dialog layout.
- Verified project search with `mathverse`, Mathematics filtering, and opening the MathVerse X detail dialog.
- Verified light/dark theme switching and persistence across page navigation.
- Verified the quick-navigation menu opens Playground by keyboard selection.
- Verified Interference selection, frequency slider change from 2.0 to 2.1, and pause control changes to Play.
- Verified the contact draft Copy action using test input. No email was sent.
- Live GitHub import completed across all pages: **497 public repositories** at verification time. Repository counts and star totals are dynamically displayed and will change.
- Live LeetCode response returned **801 solved**, rank **78,025** at verification time. These values are snapshots, not permanent claims.
- Original portfolio artwork is local SVG/canvas code. No external screenshot service is required.

## Scope and limits

- The Vercel configuration is included, but no deployment was made to the user’s Vercel account.
- An embedded MathVerse X request was attempted; the testing browser displayed a blocked/failed frame. The dialog retains the direct deployment link and explains that hosts may restrict iframe loading. Do not treat every repository’s Website URL as a verified healthy deployment.
- GitHub and LeetCode availability, rate limits, and external deployment headers are outside this app’s control. The portfolio preserves its latest snapshot when refresh fails.
- GitHub statistics and projects are read automatically. Education, research interests, and personal milestones come from profile configuration.
- The contact form composes an email draft; it is not a transactional email service.
- No automated cross-browser or accessibility certification is claimed. Browser QA used the available Chromium browser.
