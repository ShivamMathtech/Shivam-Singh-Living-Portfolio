# Shivam Singh — Living Portfolio

A complete, responsive portfolio connecting mathematics, AI, computer vision, and full-stack development. The design combines warm charcoal, electric chartreuse, editorial typography, original project illustrations, and interactive mathematical canvases.

**Ready to run:** source code, a prebuilt `dist/` site, local API server, Vercel functions, automated tests, and Windows setup are included. There are **zero npm dependencies**.

## Start on Windows

1. Install **Node.js 22 or newer** from https://nodejs.org.
2. Extract this ZIP completely.
3. Double-click **`start-windows.bat`**.
4. Open **http://localhost:5173**. Keep the terminal running.

Or use a terminal in this folder:

```sh
npm run dev
```

No `npm install` is required. Node’s built-in modules provide the development server, build process, and tests. On macOS/Linux run `./start-macos-linux.sh` or `npm run dev`. To choose a port: `npm run dev -- --port 8080`. The dev server builds once when started; restart after changing source files.

Do not double-click `index.html`: JSON, JavaScript modules, and APIs need an HTTP server.

## Deploy the entire project on Vercel

1. Create a GitHub repository named **`shivam-singh-portfolio`** and upload this folder’s contents, including `src`, `api`, `server`, `scripts`, `package.json`, and `vercel.json`.
2. In Vercel, select **Add New → Project**, then import the repository.
3. Select framework preset **Other**.
4. Set **Build command** to `npm run build`; **Output directory** to `dist`.
5. Keep the root directory at the folder containing `package.json`. Use Node.js 22 or newer.
6. Deploy. Vercel serves the portfolio and the `/api/github` and `/api/leetcode` functions in the same project.

The configuration is already in `vercel.json`. No database or paid API key is needed. A Vercel deployment was not performed as part of this ZIP delivery; the build, local API, UI, and automated checks were verified.

**Optional environment variables (Vercel → Settings → Environment Variables):**

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | A read-only GitHub token raises the shared server’s GitHub rate limit. Public repository metadata is all that is needed. |
| `SITE_URL` | Your final HTTPS domain, e.g. `https://your-portfolio.vercel.app`. Generates canonical metadata and `sitemap.xml` at build time. |

For local use, copy `.env.example` to `.env.local` and enter your values, then restart. `.env.local` is ignored by Git. Never put a GitHub token in `src/`, browser JavaScript, or a public environment variable. No secrets are supplied in this project.

Official deployment references:
- https://vercel.com/docs/functions/runtimes/node-js
- https://vercel.com/docs/project-configuration/vercel-json
- https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user
- https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api

## What updates automatically

| Information | Update behavior |
| --- | --- |
| Public GitHub projects, languages, descriptions, stars, deployment URLs, latest push dates | GitHub public API, including pagination. Fresh data is cached for 15 minutes, checked while the tab is visible, and refreshed on returning to an old tab. A manual Refresh button is available. |
| GitHub totals | From public profile and repository metadata; kept separate from Shivam’s personal “500+ projects designed” milestone. |
| LeetCode solved count and rank | Best-effort server-side request to LeetCode’s public profile GraphQL endpoint. Cached for one hour; the saved verified snapshot is labeled with its date if the API is unavailable. The endpoint is not a guaranteed public API and may change. |
| LinkedIn | Links directly to the supplied profile. No scraping, OAuth, or fabricated LinkedIn metrics. |
| Education, contact information, achievements, project milestone, bio | Edit `src/data/profile.json`; rebuild/redeploy. These personal facts cannot be inferred reliably from GitHub commits. |

Live updates are **request-based**, not instant push notifications. Every visitor gets the most recent successful data available within the cache window. The server uses only public GitHub repositories, even when a token is configured. If any repository page fails, the partial result is rejected and the existing snapshot stays available. A browser without local storage still works.

A full public GitHub snapshot is included as a reliable fallback. Fetch time is recorded in `src/data/github-snapshot.json`; missing or private repositories are not presented as public work. Repository names, descriptions, and URLs are rendered safely rather than interpreted as HTML.

On a purely static host, the gallery can use GitHub’s browser-accessible API directly; the LeetCode server endpoint is unavailable, so its last verified snapshot/profile link remains. Static hosting still provides all visual interactions, filters, contact links, and mathematical canvases.

## Project previews

Project cards use original illustrative artwork, labeled **Project visualization**. These are not screenshots or claims about the live deployment.

For a live preview, the project must have an HTTPS **Website** URL in its GitHub repository’s About settings. The portfolio reads this `homepage` field automatically. Open a project and choose **Load live preview** to load it in a sandboxed iframe, or **Open website** for a normal new tab. Some deployment hosts block embedding via CSP or `X-Frame-Options`; a cross-origin parent cannot reliably detect this. The direct website link always remains available. Repository URLs are sourced from GitHub; deployment health is not continuously monitored.

To show previews for more repositories: open that repository on GitHub → About gear → Website → enter the deployed HTTPS URL → save. The portfolio picks it up on its next successful refresh.

## Personalize and maintain

- `src/data/profile.json`: biography, education, contact details, achievement, featured project order, and optional title/category/artwork overrides.
- `src/index.html`: page sections, headline, long-form copy, social links, research interests, and static fallback text.
- `src/styles.css`: responsive layout, colors, typography, and theme tokens.
- `src/canvas.js`: actual 3D parametric surfaces and interactive wave plots.
- `src/art.js`: original project illustrations.
- `src/lib.js`: safe repository normalization, filters, and public GitHub pagination.
- `src/app.js`: client UI, caching, dialogs, command menu, and contacts.
- `api/`: same-origin Vercel API functions.
- `server/github.mjs`: server cache and request deduplication.
- `scripts/build.mjs`: copies static source, generates printable profile, adds structured metadata, and optionally generates sitemap.

Featured entries use exact repository names. New repos still appear automatically under All work and Recent; pin one by adding its name to `featured`. Category guesses use names/descriptions/topics; use `projectOverrides` for precise categorization. GitHub forks and archived repos are excluded from the gallery; public-account totals may include them.

The supplied academic information is B.Tech CSE (2026), **9.4 CGPA**; B.Sc Mathematics (2022), **60%**; Class XII (2019), **79.5%**; Class X (2017), **82%**; and **All India Ranker, IIT JAM 2020**. No exact AIR number has been invented. The B.Tech institution is Dev Bhoomi Uttarakhand University, from the supplied profile context. Verify spelling/official names before using the printable profile for applications.

### Refresh the fallback snapshot

```sh
npm run sync
npm run build
```

The included `.github/workflows/refresh-projects.yml` optionally refreshes the fallback snapshot daily at **03:17 UTC (08:47 IST)** after this project is pushed to your GitHub default branch and Actions is enabled. It can also be run manually in the Actions tab. This workflow has not been installed on your GitHub account by delivering the ZIP. It uses GitHub’s built-in workflow token and commits only the generated public snapshot. If branch protection disallows bot pushes, run the sync command locally instead. Vercel’s Git integration can redeploy when the snapshot commit is pushed. Daily refresh supplements the runtime API; it is not required for live data.

### Contact and printable profile

Email: **drshivam49@gmail.com** · Phone: **+91 88964 97776**.

The contact form validates fields, then opens the visitor’s email application with a composed draft. It does **not** silently send mail, retain visitor messages, or show a false “sent” status. A Copy message alternative is included. The phone link uses `tel:`; external profiles open in new tabs.

“View printable profile” opens `/profile.html`. Its Print / Save as PDF button opens the browser’s print dialog. It is generated from the profile configuration at build time. A PDF is not pre-generated.

## Interactions

- Pointer-rotatable 3D torus, sphere, and wave surfaces.
- Wave laboratory with sine/interference/Lissajous modes, amplitude/frequency sliders, pause, reset, and PNG export.
- Search, category filter, recent/star sorting, progressive project loading, and project dialogs.
- `Ctrl+K` / `Cmd+K` quick navigation with keyboard selection.
- Dark/light themes with local preference persistence.
- Mobile navigation, reduced-motion support, visible focus, labels, and a skip link.
- Printable professional profile and structured Person metadata.

## Verify

```sh
npm test
npm run build
```

Tests cover URL safety, private-repository exclusion, HTML escaping, filtering and sorting, complete pagination, failure recovery, cache deduplication, token non-disclosure, and supplied profile facts. See `VERIFICATION.md` for the actual checks performed.

## Fonts and attribution

The site requests DM Sans, DM Serif Display, and IBM Plex Mono from Google Fonts, with system fallbacks when offline. A small DejaVu Sans symbol subset is bundled so interface arrows render reliably; its license is in `src/assets/FONT-LICENSE.txt`. All project illustrations are original SVG code in this project. No third-party project screenshots or photographs are bundled.
