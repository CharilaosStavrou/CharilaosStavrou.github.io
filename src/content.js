// ============================================================================
//  ALL PERSONAL CONTENT LIVES HERE. Edit this file to change the site text.
// ============================================================================

export const content = {
  name: 'Charilaos (Harris) Stavrou',
  shortName: 'Harris Stavrou',
  tagline:
    'Chemical engineer turned production engineer, building digital tools for factories and supply chains',

  links: {
    github: 'https://github.com/CharilaosStavrou',
    linkedin: 'https://www.linkedin.com/in/charilaos-p-stavrou-648a25249',
  },

  about: {
    paragraphs: [
      'I hold a BSc in Chemical Engineering from the Cyprus University of Technology and I am studying for an MSc in Production Engineering and Management at KTH Royal Institute of Technology.',
      'I am interested in digital twins, simulation and AI in manufacturing: using models and software to understand, plan and improve how factories and supply chains run.',
      'Before KTH, I worked on the factory floor at ELVAL, monitoring a coil coating line, and in a catalysis lab at the University of Milan, studying photocatalytic hydrogen production. That mix of process engineering, lab research and real production taught me that the best improvements come from understanding the whole system, which is why I now build simulation and planning tools that connect data with decisions.',
    ],
  },

  research: {
    title:
      'Photocatalytic hydrous hydrazine decomposition for hydrogen production over Rh-based catalysts',
    kind: 'BSc thesis',
    points: [
      'Experimental work at Università degli Studi di Milano (May–Jul 2025).',
      'A computational fluid dynamics (CFD) model built in COMSOL Multiphysics.',
    ],
    tags: ['Photocatalysis', 'Hydrogen', 'Rh catalysts', 'COMSOL', 'CFD'],
  },

  experience: [
    {
      org: 'ELVAL aluminium',
      roles: [
        { title: 'Chemical Engineering Intern', period: 'Jul – Sep 2025', detail: 'Coil coating line monitoring.' },
        { title: 'Assistant', period: 'Jun – Aug 2024' },
      ],
    },
    {
      org: 'Università degli Studi di Milano',
      roles: [{ title: 'Research Internship', period: 'May – Jul 2025' }],
    },
    {
      org: 'Youth Parliament of Cyprus',
      roles: [{ title: 'Environmental Committee', period: 'Oct 2024 – Aug 2026' }],
    },
    {
      org: 'Cyprus Youth DiplomaCY',
      roles: [{ title: null, period: 'Oct 2024 – Jun 2026' }],
    },
  ],

  skills: [
    { group: 'Programming', items: ['Python', 'NumPy', 'Pandas', 'TensorFlow', 'MATLAB', 'React / JavaScript'] },
    { group: 'Engineering software', items: ['COMSOL Multiphysics', 'Excel'] },
    { group: 'Production', items: ['Simulation', 'Lean', 'Production planning'] },
  ],

  // Optional nicer titles for specific repos (repo name -> title).
  // Repos not listed here get an automatic title, e.g. "kanban-calculator" -> "Kanban Calculator".
  projectTitleOverrides: {
    'line-simulatorv1': 'Production Line Simulator',
  },
};
