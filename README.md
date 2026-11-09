# charilaosstavrou.github.io

Personal portfolio of Charilaos (Harris) Stavrou: **https://charilaosstavrou.github.io**

Built with React + Vite and deployed to GitHub Pages by GitHub Actions. The Projects section fills itself from my public GitHub repositories.

## Add a new project to the site

You don't need to touch this repo. On the **project's** GitHub page:

1. Click the **⚙️ gear icon next to "About"** (top right of the repo's main page).
2. Fill in:
   - **Description**: one sentence; it becomes the card text.
   - **Website**: the live demo URL (e.g. `https://my-app.vercel.app`). Shown as the **Live demo** button. Leave empty if there's no demo.
   - **Topics**: add **`portfolio`** (required, or the repo won't appear).
     Add **`featured`** too if you want it as a large card at the top.
     Any other topics (e.g. `simulation`, `lean`) show up as tags on the card.
3. Click **Save changes**.

The repo must be **public** and **not a fork**. The card title comes from the repo name (`kanban-calculator` → "Kanban Calculator", `line-simulatorv1` → "Line Simulator"). To pick a different title, add it to `projectTitleOverrides` in `src/content.js`.

**Card image:** the repo's social preview. To use your own image, go to the repo's **Settings → General → Social preview → Edit → Upload an image** (1280×640 works best). Without one, GitHub's auto-generated card is used.

### When does it show up?

- **Right away, for most visitors**: the site asks the GitHub API for the latest repo list in the browser and updates the cards.
- **Within 6 hours, for everyone**: the workflow rebuilds the site every 6 hours with fresh data. To update it now, go to **Actions → "Build and deploy to GitHub Pages" → Run workflow**.

If the GitHub API is down or rate-limited, the site quietly shows the data from the last build. If **no** repo has the `portfolio` topic yet, the site keeps the built-in fallback list in `src/data/projects.json`, so the Projects section never ends up empty.

**Sorting:** featured first, then most recently updated (last push).

## Edit the personal text

Everything personal (name, tagline, about, research, experience, skills, links) is in **`src/content.js`**. Things still marked `TODO`:

- **Photo**: put a square image at `public/photo.jpg` and set `photo: '/photo.jpg'`.
- **Email**: set `links.email`.
- **Extra about paragraph** (optional): set `about.extra`.

Until you fill these in, the site shows a dashed placeholder box.

## Run it locally

```bash
npm install
npm run dev            # http://localhost:5173
npm test               # title formatting, filtering, sorting tests
npm run fetch-projects # refresh src/data/projects.json from the GitHub API
npm run build          # production build in dist/
```

## How it works

| Piece | File |
| --- | --- |
| Filter/sort/title logic (shared by build + browser) | `src/lib/projects.js` |
| Tests | `src/lib/projects.test.js` |
| Build-time fetch → `projects.json` | `scripts/fetch-projects.mjs` |
| Browser refresh with silent fallback | `src/lib/useProjects.js` |
| Deploy workflow (push, every 6 h, manual) | `.github/workflows/deploy.yml` |

Note: GitHub pauses scheduled workflows in repos with no activity for 60 days. If that happens, press **Run workflow** once (or push any commit) to wake it up.
