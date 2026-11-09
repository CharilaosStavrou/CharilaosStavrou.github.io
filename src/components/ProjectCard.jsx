import { useState } from 'react';
import { ExternalIcon, GitHubIcon } from './Icons.jsx';

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
  if (failed) {
    return (
      <div className="card-img card-img--fallback" aria-hidden="true">
        <span>{project.title}</span>
      </div>
    );
  }
  return (
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
  );
}

export default function ProjectCard({ project }) {
  const updated = formatDate(project.updatedAt);
  return (
    <article className={`card glass project ${project.featured ? 'project--featured' : ''} reveal`}>
      <div className="project-media">
        <CardImage project={project} />
        {project.featured && <span className="badge">Featured</span>}
      </div>
      <div className="project-body">
        <h3 className="project-title">{project.title}</h3>
        {project.description && <p className="project-desc">{project.description}</p>}
        {project.tags.length > 0 && (
          <ul className="tags" aria-label="Topics">
            {project.tags.map((t) => (
              <li key={t} className="tag">{t}</li>
            ))}
          </ul>
        )}
        <div className="project-meta mono">
          {project.language && (
            <span className="lang">
              <i style={{ background: LANG_COLORS[project.language] || '#22d3ee' }} />
              {project.language}
            </span>
          )}
          {updated && <span>Updated {updated}</span>}
        </div>
        <div className="project-actions">
          {project.homepage && (
            <a className="btn btn--primary btn--sm" href={project.homepage} target="_blank" rel="noopener noreferrer">
              <ExternalIcon /> Live demo
            </a>
          )}
          <a className="btn btn--ghost btn--sm" href={project.url} target="_blank" rel="noopener noreferrer">
            <GitHubIcon /> Source
          </a>
        </div>
      </div>
    </article>
  );
}
