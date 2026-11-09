import { useEffect, useState } from 'react';
import fallback from '../data/projects.json';
import { content } from '../content.js';
import { buildProjects, filterRepos, GITHUB_USER, sameProjects, sortProjects } from './projects.js';

const API = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`;

/**
 * Starts with the build-time projects.json, then refreshes from the GitHub API in the
 * browser. Any failure (offline, rate limit, no "portfolio" topics yet) is silent and
 * the build-time data stays on screen.
 */
export function useProjects() {
  const [projects, setProjects] = useState(() => sortProjects(fallback));

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(API, { signal: ctrl.signal, headers: { Accept: 'application/vnd.github+json' } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((repos) => {
        if (filterRepos(repos).length === 0) return;
        // Keep custom social-preview URLs found at build time (the public API doesn't expose them).
        const images = Object.fromEntries(fallback.map((p) => [p.name, p.image]));
        const next = buildProjects(repos, { titleOverrides: content.projectTitleOverrides, images });
        setProjects((current) => (sameProjects(current, next) ? current : next));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  return projects;
}
