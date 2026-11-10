import { useState } from 'react';
import { ClockIcon, ExternalIcon, GitHubIcon, StarIcon } from './Icons.jsx';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', HTML: '#e34c26',
  CSS: '#663399', MATLAB: '#e16737', 'Jupyter Notebook': '#DA5B0B', Java: '#b07219',
  'C++': '#f34b7d', C: '#555555', Go: '#00ADD8', Rust: '#dea584', Vue: '#41b883',
};

const dateFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

function formatDate(iso) {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? null : dateFmt.format(new Date(t));
}

function CardImage({ project }) {
  const [failed, setFailed] = useState(!project.image);
  return (
    <div className="project-media">
      {failed ? (
        <div className="card-img card-img--fallback" aria-hidden="true">
          <span>{project.title}</span>
        </div>
      ) : (
        <img
          className="card-img"
          src={project.image}
          alt=""
          loading="lazy"
          decoding="async"
          width="1200"
          height="600"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/**
 * The whole card is clickable through a "stretched" title link (opens the live demo when
 * there is one, otherwise the repo). The GitHub and Live demo buttons sit above it, so there
 * are no nested interactive elements.
 */
export default function ProjectCard({ project }) {
  const updated = formatDate(project.updatedAt);
  const primary = project.homepage || project.url;
  return (
    <article className={`project ${project.featured ? 'project--featured' : ''} reveal`}>
      <CardImage project={project} />
      <div className="project-body">
        {project.featured && (
          <span className="badge mono"><StarIcon size={13} /> Featured</span>
        )}
        <h3 className="project-title">
          <a className="card-link" href={primary} target="_blank" rel="noopener noreferrer">
            {project.title}
            <span className="sr-only"> ({project.homepage ? 'live demo' : 'GitHub repository'}, opens in a new tab)</span>
          </a>
        </h3>
        {project.description && <p className="project-desc">{project.description}</p>}
        {project.tags.length > 0 && (
          <ul className="tags" aria-label="Topics">
            {project.tags.map((t) => (
              <li key={t} className="tag mono">{t}</li>
            ))}
          </ul>
        )}
        <div className="project-foot">
          <div className="project-meta mono">
            {project.language && (
              <span className="lang">
                <i style={{ background: LANG_COLORS[project.language] || 'var(--accent)' }} aria-hidden="true" />
                {project.language}
              </span>
            )}
            {updated && (
              <span className="lang"><ClockIcon size={13} /> <span className="sr-only">Updated </span>{updated}</span>
            )}
          </div>
          <div className="project-actions">
            <a
              className="icon-btn"
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} source code on GitHub (opens in a new tab)`}
              title="Source on GitHub"
            >
              <GitHubIcon />
            </a>
            {project.homepage && (
              <a
                className="btn btn--primary btn--sm"
                href={project.homepage}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo (opens in a new tab)`}
              >
                <ExternalIcon size={16} /> Live demo
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
