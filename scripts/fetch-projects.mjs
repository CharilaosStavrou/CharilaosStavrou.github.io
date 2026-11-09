// Build-time fetch: GitHub API -> src/data/projects.json
// Run by the GitHub Actions workflow before `vite build`.
// Never fails the build: on any error, or if no repo has the "portfolio" topic yet,
// the existing projects.json is kept unchanged.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildProjects, filterRepos, GITHUB_USER } from '../src/lib/projects.js';
import { content } from '../src/content.js';

const OUT = fileURLToPath(new URL('../src/data/projects.json', import.meta.url));
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'portfolio-build',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function fetchAllRepos() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner&page=${page}`,
      { headers },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

// Custom social preview images are only exposed via GraphQL (needs a token).
async function fetchSocialImages(names) {
  if (!token || names.length === 0) return {};
  const fields = names
    .map((n, i) => `r${i}: repository(owner: "${GITHUB_USER}", name: ${JSON.stringify(n)}) { name openGraphImageUrl usesCustomOpenGraphImage }`)
    .join('\n');
  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { ${fields} }` }),
    });
    if (!res.ok) return {};
    const { data } = await res.json();
    const images = {};
    for (const r of Object.values(data || {})) {
      if (r?.openGraphImageUrl) images[r.name] = r.openGraphImageUrl;
    }
    return images;
  } catch {
    return {};
  }
}

async function main() {
  let repos;
  try {
    repos = await fetchAllRepos();
  } catch (err) {
    console.warn(`[fetch-projects] Could not reach GitHub API, keeping existing projects.json.\n  ${err.message}`);
    return;
  }

  const eligible = filterRepos(repos);
  if (eligible.length === 0) {
    console.warn('[fetch-projects] No public repo has the "portfolio" topic yet, keeping existing projects.json.');
    return;
  }

  const images = await fetchSocialImages(eligible.map((r) => r.name));
  const projects = buildProjects(repos, { titleOverrides: content.projectTitleOverrides, images });
  const json = JSON.stringify(projects, null, 2) + '\n';

  const previous = await readFile(OUT, 'utf8').catch(() => '');
  if (previous === json) {
    console.log(`[fetch-projects] ${projects.length} projects, unchanged.`);
    return;
  }
  await writeFile(OUT, json);
  console.log(`[fetch-projects] Wrote ${projects.length} projects: ${projects.map((p) => p.name).join(', ')}`);
}

main();
