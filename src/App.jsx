import { useEffect, useRef, useState } from 'react';
import { content } from './content.js';
import { useProjects } from './lib/useProjects.js';
import { useReveal } from './lib/useReveal.js';
import Globe from './components/Globe.jsx';
import ProjectCard from './components/ProjectCard.jsx';
import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  CloseIcon,
  GitHubIcon,
  LinkedInIcon,
  MenuIcon,
} from './components/Icons.jsx';

const NAV = [
  ['projects', 'Projects'],
  ['about', 'About'],
  ['research', 'Research'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['contact', 'Contact'],
];

const ext = { target: '_blank', rel: 'noopener noreferrer' };

function Section({ id, index, title, children }) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <header className="section-head reveal">
        <span className="section-index mono" aria-hidden="true">{String(index).padStart(2, '0')} //</span>
        <h2 id={`${id}-title`}>{title}</h2>
        <span className="section-line" aria-hidden="true" />
      </header>
      {children}
    </section>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <nav className={`nav ${open ? 'is-open' : ''}`} aria-label="Main">
      <div className="nav-bar">
        <a href="#top" className="nav-brand mono" aria-label="Charilaos Stavrou, back to top">
          <span className="accent" aria-hidden="true">&gt;</span> cs<span className="accent blink" aria-hidden="true">_</span>
        </a>
        <button
          ref={btnRef}
          type="button"
          className="nav-toggle icon-btn"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
        </button>
        <ul id="nav-links" className="nav-links">
          {NAV.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function Hero() {
  const { name, tagline, links } = content;
  return (
    <header id="top" className="hero">
      <div className="hero-text">
        <p className="eyebrow mono reveal">
          <span className="dot" aria-hidden="true" />
          <span>Production engineering<span className="eyebrow-extra"> · Digital manufacturing</span></span>
        </p>
        <h1 className="reveal">{name}</h1>
        <p className="hero-tagline reveal">{tagline}</p>
        <div className="hero-actions reveal">
          <a className="btn btn--primary" href={links.github} {...ext}>
            <GitHubIcon /> GitHub
          </a>
          <a className="btn btn--ghost" href={links.linkedin} {...ext}>
            <LinkedInIcon /> LinkedIn
          </a>
          <a className="btn btn--text" href="#projects">
            View projects <ArrowDownIcon size={16} />
          </a>
        </div>
      </div>
      <div className="hero-visual">
        <Globe />
      </div>
    </header>
  );
}

function Projects() {
  const projects = useProjects();
  useReveal([projects]);
  return (
    <Section id="projects" index={1} title="Projects">
      <p className="section-lead reveal">
        Pulled live from my GitHub. Click a card to open its live demo, or the repo if there is none.
      </p>
      <div className="bento">
        {projects.map((p) => (
          <ProjectCard key={p.name} project={p} />
        ))}
      </div>
      <div className="more reveal">
        <a className="btn btn--text" href={`${content.links.github}?tab=repositories`} {...ext}>
          All repositories on GitHub <ArrowUpRightIcon size={16} />
        </a>
      </div>
    </Section>
  );
}

function About() {
  return (
    <Section id="about" index={2} title="About">
      <div className="about">
        <div className="card about-text reveal">
          {content.about.paragraphs.map((p) => <p key={p}>{p}</p>)}
        </div>
        <dl className="card facts reveal">
          <div><dt className="mono">BSc</dt><dd>Chemical Engineering<span>Cyprus University of Technology</span></dd></div>
          <div><dt className="mono">MSc</dt><dd>Production Engineering and Management<span>KTH</span></dd></div>
          <div><dt className="mono">Focus</dt><dd>Digital twins · Simulation · AI in manufacturing</dd></div>
        </dl>
      </div>
    </Section>
  );
}

function Research() {
  const r = content.research;
  return (
    <Section id="research" index={3} title="Research">
      <article className="card research reveal">
        <span className="kicker mono">{r.kind}</span>
        <h3>{r.title}</h3>
        <ul className="bullets">
          {r.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <ul className="tags" aria-label="Keywords">
          {r.tags.map((t) => <li key={t} className="tag mono">{t}</li>)}
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
            <div className="card">
              <h3>{e.org}</h3>
              {e.roles.map((r) => (
                <div key={(r.title || '') + r.period} className="role">
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
      <div className="skills">
        {content.skills.map((g) => (
          <div key={g.group} className="card reveal">
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
      <ul className="contact reveal">
        <li>
          <a className="card contact-link" href={links.github} {...ext}>
            <GitHubIcon size={22} />
            <span><strong>GitHub</strong><span className="mono">{pretty(links.github)}</span></span>
            <ArrowUpRightIcon className="contact-arrow" />
          </a>
        </li>
        <li>
          <a className="card contact-link" href={links.linkedin} {...ext}>
            <LinkedInIcon size={22} />
            <span><strong>LinkedIn</strong><span className="mono">{pretty(links.linkedin)}</span></span>
            <ArrowUpRightIcon className="contact-arrow" />
          </a>
        </li>
      </ul>
    </Section>
  );
}

export default function App() {
  useReveal();
  return (
    <>
      <a className="skip" href="#projects">Skip to content</a>
      <div className="bg" aria-hidden="true" />
      <Nav />
      <main className="container">
        <Hero />
        <Projects />
        <About />
        <Research />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="footer mono">
        © {new Date().getFullYear()} {content.shortName}
      </footer>
    </>
  );
}
