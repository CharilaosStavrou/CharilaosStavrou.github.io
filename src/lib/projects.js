// Pure logic for turning GitHub repos into portfolio project cards.
// Shared by the build-time script (scripts/fetch-projects.mjs) and the browser.

export const GITHUB_USER = 'CharilaosStavrou';
export const PORTFOLIO_TOPIC = 'portfolio';
export const FEATURED_TOPIC = 'featured';
export const HIDDEN_TOPICS = [PORTFOLIO_TOPIC, FEATURED_TOPIC];

// Words that should stay upper-case in titles.
const ACRONYMS = new Set([
  'ai', 'api', 'cfd', 'csv', 'ds', 'erp', 'iot', 'iss', 'kpi', 'lp', 'ml', 'mrp',
  'oee', 'pce', 'pid', 'qr', 'spc', 'ui', 'ux', 'vsm', '2d', '3d',
]);

/**
 * Turn a repo name into a readable title.
 *   "line-simulatorv1" -> "Line Simulator"
 *   "vsm-tool"         -> "VSM Tool"
 *   "worldPulse_v2"    -> "World Pulse"
 */
export function formatTitle(name) {
  if (!name) return '';
  const words = String(name)
    .replace(/\.(github\.io|js|py)$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2') // camelCase -> camel Case
    .split(/[\s\-_.]+/)
    .filter(Boolean)
    // strip version suffixes: "simulatorv1" -> "simulator", standalone "v2" removed
    .map((w) => (/^v\d+$/i.test(w) ? '' : w.replace(/([a-z]{2,})v\d+$/i, '$1')))
    .filter(Boolean);

  return words
    .map((w) => {
      const lower = w.toLowerCase();
      if (ACRONYMS.has(lower)) return lower.toUpperCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/** Is this repo the portfolio site itself? */
export function isPortfolioSiteRepo(repo, user = GITHUB_USER) {
  return String(repo?.name || '').toLowerCase() === `${user}.github.io`.toLowerCase();
}

/** Keep only public, non-fork, non-archived-site repos that carry the "portfolio" topic. */
export function filterRepos(repos, user = GITHUB_USER) {
  if (!Array.isArray(repos)) return [];
  return repos.filter(
    (r) =>
      r &&
      !r.fork &&
      !r.private &&
      (r.visibility === undefined || r.visibility === 'public') &&
      Array.isArray(r.topics) &&
      r.topics.includes(PORTFOLIO_TOPIC) &&
      !isPortfolioSiteRepo(r, user),
  );
}

/** Default social-preview image (GitHub's generated card). */
export function socialImageUrl(fullName) {
  return `https://opengraph.githubassets.com/1/${fullName}`;
}

/** Map a GitHub API repo object to the shape the site uses. */
export function repoToProject(repo, { titleOverrides = {}, image } = {}) {
  const topics = Array.isArray(repo.topics) ? repo.topics : [];
  const fullName = repo.full_name || `${repo.owner?.login || GITHUB_USER}/${repo.name}`;
  return {
    name: repo.name,
    title: titleOverrides[repo.name] || formatTitle(repo.name),
    description: repo.description || '',
    url: repo.html_url || `https://github.com/${fullName}`,
    homepage: repo.homepage ? normalizeUrl(repo.homepage) : null,
    tags: topics.filter((t) => !HIDDEN_TOPICS.includes(t)),
    featured: topics.includes(FEATURED_TOPIC),
    language: repo.language || null,
    updatedAt: repo.pushed_at || repo.updated_at || null,
    image: image || socialImageUrl(fullName),
  };
}

function normalizeUrl(u) {
  const s = String(u).trim();
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
}

/** Featured first, then most recently updated. Ties keep their original order. */
export function sortProjects(projects) {
  const time = (p) => {
    const t = p.updatedAt ? Date.parse(p.updatedAt) : NaN;
    return Number.isNaN(t) ? -Infinity : t;
  };
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const ta = time(a), tb = time(b);
    if (ta !== tb) return tb > ta ? 1 : -1;
    return 0; // stable: keep original order on ties
  });
}

/**
 * Full pipeline: raw GitHub repos -> sorted project cards.
 * `images` lets the caller supply custom social preview URLs keyed by repo name.
 */
export function buildProjects(repos, { titleOverrides = {}, images = {}, user = GITHUB_USER } = {}) {
  return sortProjects(
    filterRepos(repos, user).map((r) =>
      repoToProject(r, { titleOverrides, image: images[r.name] }),
    ),
  );
}

/** Cheap structural comparison, used to skip re-rendering when nothing changed. */
export function sameProjects(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
