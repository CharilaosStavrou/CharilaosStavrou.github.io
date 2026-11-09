import { content } from './content.js';
import { useProjects } from './lib/useProjects.js';
import { useReveal } from './lib/useReveal.js';
import Background from './components/Background.jsx';
import ProjectCard from './components/ProjectCard.jsx';
import { ArrowIcon, GitHubIcon, LinkedInIcon, MailIcon } from './components/Icons.jsx';

const NAV = [
  ['about', 'About'],
  ['projects', 'Projects'],
  ['research', 'Research'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
];

function Placeholder({ children }) {
  return <div className="placeholder mono">{children}</div>;
}

function Section({ id, index, title, children }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <header className="section-head reveal">
        <span className="section-index mono">{String(index).padStart(2, '0')} //</span>
        <h2 id={`${id}-title`}>{title}</h2>
        <span className="section-line" />
      </header>
      {children}
    </section>
  );
}

function Nav() {
  return (
    <nav className="nav glass" aria-label="Main">
      <a href="#top" className="nav-brand mono">
        <span className="accent">&gt;</span> cs<span className="accent blink">_</span>
      </a>
      <ul className="nav-links">
        {NAV.map(([id, label]) => (
          <li key={id}><a href={`#${id}`}>{label}</a></li>
        ))}
      </ul>
    </nav>
  );
}

function Hero() {
  const { name, tagline, photo, links } = content;
  return (
    <header id="top" className="hero">
      <div className="hero-text">
        <p className="eyebrow mono reveal">
          <span className="dot" /> Production Engineering · Digital Manufacturing
        </p>
        <h1 className="reveal">{name}</h1>
        <p className="hero-tagline reveal">{tagline}</p>
        <div className="hero-actions reveal">
          <a className="btn btn--primary" href={links.github} target="_blank" rel="noopener noreferrer">
            <GitHubIcon /> GitHub
          </a>
          <a className="btn btn--ghost" href={links.linkedin} target="_blank" rel="noopener noreferrer">
            <LinkedInIcon /> LinkedIn
          </a>
          <a className="btn btn--text" href="#projects">
            See projects <ArrowIcon />
          </a>
        </div>
      </div>
      <div className="hero-photo reveal">
        <div className="photo-frame">
          {photo ? (
            <img src={photo} alt={`Portrait of ${name}`} width="320" height="320" />
          ) : (
            <div className="photo-placeholder mono">
              <span className="ph-icon" aria-hidden="true">◎</span>
              <strong>TODO: your photo</strong>
              <span>public/photo.jpg<br />+ set <code>photo</code> in content.js</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function About() {
  const { paragraphs, extra } = content.about;
  return (
    <Section id="about" index={1} title="About">
      <div className="card glass about reveal">
        {paragraphs.map((p) => <p key={p}>{p}</p>)}
        {extra ? <p>{extra}</p> : <Placeholder>TODO: optional extra paragraph · set <code>about.extra</code> in src/content.js</Placeholder>}
        <ul className="facts mono">
          <li><span>BSc</span> Chemical Engineering · Cyprus University of Technology</li>
          <li><span>MSc</span> Production Engineering and Management · KTH</li>
          <li><span>Focus</span> Digital twins · Simulation · AI in manufacturing</li>
        </ul>
      </div>
    </Section>
  );
}

function Projects() {
  const projects = useProjects();
  useReveal([projects]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return (
    <Section id="projects" index={2} title="Projects">
      <p className="section-lead reveal">
        Pulled live from my GitHub. Repos tagged <code>portfolio</code> show up here automatically.
      </p>
      {featured.length > 0 && <div className="grid grid--featured">{featured.map((p) => <ProjectCard key={p.name} project={p} />)}</div>}
      {rest.length > 0 && <div className="grid grid--projects">{rest.map((p) => <ProjectCard key={p.name} project={p} />)}</div>}
      <div className="reveal more">
        <a className="btn btn--text" href={`${content.links.github}?tab=repositories`} target="_blank" rel="noopener noreferrer">
          All repositories on GitHub <GitHubIcon />
        </a>
      </div>
    </Section>
  );
}

function Research() {
  const r = content.research;
  return (
    <Section id="research" index={3} title="Research">
      <article className="card glass research reveal">
        <span className="kicker mono">{r.kind}</span>
        <h3>{r.title}</h3>
        <ul className="bullets">
          {r.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <ul className="tags">
          {r.tags.map((t) => <li key={t} className="tag">{t}</li>)}
        </ul>
      </article>
    </Section>
  );
}

function Experience() {
  return (
    <Section id="experience" index={4} title="Experience">
      <ol className="timeline">
        {content.experience.map((e) => (
          <li key={e.org} className="timeline-item reveal">
            <span className="timeline-dot" aria-hidden="true" />
            <div className="card glass">
              <h3>{e.org}</h3>
              {e.roles.map((r) => (
                <div key={r.title + r.period} className="role">
                  <div className="role-head">
                    {r.title && <span className="role-title">{r.title}</span>}
                    <span className="role-period mono">{r.period}</span>
                  </div>
                  {r.detail && <p>{r.detail}</p>}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Skills() {
  return (
    <Section id="skills" index={5} title="Skills">
      <div className="grid grid--skills">
        {content.skills.map((g) => (
          <div key={g.group} className="card glass reveal">
            <h3 className="kicker mono">{g.group}</h3>
            <ul className="chips">
              {g.items.map((s) => <li key={s} className="chip">{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Contact() {
  const { links } = content;
  const pretty = (u) => u.replace(/^https?:\/\/(www\.)?/, '');
  return (
    <Section id="contact" index={6} title="Contact">
      <div className="card glass contact reveal">
        <p className="contact-lead">The best ways to reach me:</p>
        <ul className="contact-list">
          <li>
            <a href={links.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /><span className="mono">{pretty(links.github)}</span></a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /><span className="mono">{pretty(links.linkedin)}</span></a>
          </li>
          <li>
            {links.email ? (
              <a href={`mailto:${links.email}`}><MailIcon /><span className="mono">{links.email}</span></a>
            ) : (
              <span className="contact-ph"><MailIcon /><Placeholder>TODO: email · set <code>links.email</code> in src/content.js</Placeholder></span>
            )}
          </li>
        </ul>
      </div>
    </Section>
  );
}

export default function App() {
  useReveal();
  return (
    <>
      <a className="skip" href="#about">Skip to content</a>
      <Background />
      <Nav />
      <main className="container">
        <Hero />
        <About />
        <Projects />
        <Research />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="footer mono">
        © {new Date().getFullYear()} {content.shortName} · Built with React + Vite · Hosted on GitHub Pages
      </footer>
    </>
  );
}
