import { describe, expect, it } from 'vitest';
import fallback from '../data/projects.json';
import {
  buildProjects,
  filterRepos,
  formatTitle,
  repoToProject,
  sortProjects,
} from './projects.js';

const repo = (name, extra = {}) => ({
  name,
  full_name: `CharilaosStavrou/${name}`,
  html_url: `https://github.com/CharilaosStavrou/${name}`,
  description: `${name} description`,
  homepage: '',
  fork: false,
  private: false,
  visibility: 'public',
  topics: ['portfolio'],
  language: 'JavaScript',
  pushed_at: '2026-01-01T00:00:00Z',
  ...extra,
});

describe('formatTitle', () => {
  it.each([
    ['line-simulatorv1', 'Line Simulator'],
    ['world-pulse', 'World Pulse'],
    ['hypersonic-flight-lab', 'Hypersonic Flight Lab'],
    ['aggregate-planning', 'Aggregate Planning'],
    ['kanban-calculator', 'Kanban Calculator'],
    ['vsm-tool', 'VSM Tool'],
    ['line_simulator_v2', 'Line Simulator'],
    ['line-simulator-v12', 'Line Simulator'],
    ['digitalTwinDemo', 'Digital Twin Demo'],
    ['ai-3d-viewer', 'AI 3D Viewer'],
    ['UPPER-case', 'Upper Case'],
  ])('%s -> %s', (input, expected) => {
    expect(formatTitle(input)).toBe(expected);
  });

  it('does not strip "v" from normal words', () => {
    expect(formatTitle('dev-tools')).toBe('Dev Tools');
    expect(formatTitle('mv2-reactor')).toBe('Mv2 Reactor');
  });

  it('handles empty input', () => {
    expect(formatTitle('')).toBe('');
    expect(formatTitle(undefined)).toBe('');
  });
});

describe('filterRepos', () => {
  it('keeps only public, non-fork repos with the portfolio topic', () => {
    const repos = [
      repo('keep'),
      repo('no-topic', { topics: ['featured'] }),
      repo('fork', { fork: true }),
      repo('private', { private: true, visibility: 'private' }),
      repo('internal', { visibility: 'internal' }),
      repo('no-topics', { topics: undefined }),
    ];
    expect(filterRepos(repos).map((r) => r.name)).toEqual(['keep']);
  });

  it('never shows the portfolio site repo itself, in any letter case', () => {
    const repos = [
      repo('CharilaosStavrou.github.io'),
      repo('charilaosstavrou.github.io'),
      repo('other'),
    ];
    expect(filterRepos(repos).map((r) => r.name)).toEqual(['other']);
  });

  it('returns [] for bad input', () => {
    expect(filterRepos(null)).toEqual([]);
    expect(filterRepos({ message: 'API rate limit exceeded' })).toEqual([]);
  });
});

describe('repoToProject', () => {
  it('maps fields and hides portfolio/featured topics from tags', () => {
    const p = repoToProject(
      repo('line-simulatorv1', {
        topics: ['portfolio', 'featured', 'simulation'],
        homepage: 'line-simulatorv1.vercel.app',
        language: 'Python',
      }),
    );
    expect(p).toMatchObject({
      name: 'line-simulatorv1',
      title: 'Line Simulator',
      featured: true,
      tags: ['simulation'],
      homepage: 'https://line-simulatorv1.vercel.app',
      language: 'Python',
      url: 'https://github.com/CharilaosStavrou/line-simulatorv1',
      image: 'https://opengraph.githubassets.com/1/CharilaosStavrou/line-simulatorv1',
    });
  });

  it('uses null homepage when empty and respects overrides and custom images', () => {
    const p = repoToProject(repo('vsm-tool'), {
      titleOverrides: { 'vsm-tool': 'Value Stream Mapper' },
      image: 'https://example.com/img.png',
    });
    expect(p.homepage).toBeNull();
    expect(p.title).toBe('Value Stream Mapper');
    expect(p.image).toBe('https://example.com/img.png');
  });
});

describe('sortProjects', () => {
  const mk = (title, featured, updatedAt) => ({ title, featured, updatedAt });

  it('puts featured first, then newest update first', () => {
    const sorted = sortProjects([
      mk('Old', false, '2025-01-01T00:00:00Z'),
      mk('New', false, '2026-06-01T00:00:00Z'),
      mk('FeatOld', true, '2024-01-01T00:00:00Z'),
      mk('FeatNew', true, '2026-01-01T00:00:00Z'),
    ]);
    expect(sorted.map((p) => p.title)).toEqual(['FeatNew', 'FeatOld', 'New', 'Old']);
  });

  it('puts unknown dates last, keeps original order on ties, and does not mutate input', () => {
    const input = [mk('B', false, null), mk('A', false, null), mk('C', false, '2025-01-01')];
    const sorted = sortProjects(input);
    expect(sorted.map((p) => p.title)).toEqual(['C', 'B', 'A']);
    expect(input.map((p) => p.title)).toEqual(['B', 'A', 'C']);
  });
});

describe('buildProjects', () => {
  it('filters, maps and sorts end to end', () => {
    const out = buildProjects([
      repo('kanban-calculator', { pushed_at: '2026-03-01T00:00:00Z' }),
      repo('world-pulse', { topics: ['portfolio', 'featured'], pushed_at: '2025-01-01T00:00:00Z' }),
      repo('aggregate-planning', { pushed_at: '2026-05-01T00:00:00Z' }),
      repo('random-fork', { fork: true }),
      repo('CharilaosStavrou.github.io'),
    ]);
    expect(out.map((p) => p.title)).toEqual(['World Pulse', 'Aggregate Planning', 'Kanban Calculator']);
  });
});

describe('fallback projects.json', () => {
  it('has the six fallback projects, featured first', () => {
    expect(fallback).toHaveLength(6);
    const sorted = sortProjects(fallback);
    expect(sorted.slice(0, 2).every((p) => p.featured)).toBe(true);
    expect(sorted.slice(2).some((p) => p.featured)).toBe(false);
  });
});
