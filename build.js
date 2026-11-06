const path = require('path');
const yaml = require('js-yaml');
const { marked } = require('marked');

const BASE_DIR = __dirname;

// Parse CMS frontmatter while preserving the multiline Markdown body verbatim.
function parseCmsFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.startsWith('---')) {
    return { data: {}, body: '' };
  }
  
  const lines = content.split(/\r?\n/);
  if (lines.at(-1) === '') {
    lines.pop();
  }
  const closingDelimiterIndex = lines.findIndex((line, index) => index > 0 && line === '---');
  const bodyLineIndex = lines.findIndex((line, index) => index > 0 && /^body:\s*/.test(line));

  if (bodyLineIndex === -1) {
    if (closingDelimiterIndex === -1) {
      const frontmatter = lines.slice(1).join('\n');
      return { data: yaml.load(frontmatter, { schema: yaml.JSON_SCHEMA }) || {}, body: '' };
    }

    const frontmatter = lines.slice(1, closingDelimiterIndex).join('\n');
    const data = yaml.load(frontmatter, { schema: yaml.JSON_SCHEMA }) || {};
    return { data, body: lines.slice(closingDelimiterIndex + 1).join('\n') };
  }

  const frontmatter = lines.slice(1, bodyLineIndex).join('\n');
  const data = yaml.load(frontmatter, { schema: yaml.JSON_SCHEMA }) || {};
  const bodyLine = lines[bodyLineIndex].replace(/^body:\s*/, '');
  const bodyLines = [bodyLine, ...lines.slice(bodyLineIndex + 1)];

  if (bodyLines.at(-1) === '---') {
    bodyLines.pop();
  }

  let body = bodyLines.join('\n');
  if (body.startsWith('"')) {
    body = body.slice(1);
    if (body.endsWith('"')) {
      body = body.slice(0, -1);
    }
  }

  return { data, body };
}

// Load YAML file
function readYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content) || {};
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return {};
  }
}

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function htmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderMarkdown(body) {
  return marked.parse(body, {
    gfm: true,
    breaks: false,
    html: false
  });
}

function replaceDivContents(html, className, contents) {
  const openingTagPattern = /<div\b[^>]*\bclass="([^"]*)"[^>]*>/gi;
  let openingTag;

  while ((openingTag = openingTagPattern.exec(html)) !== null) {
    if (!openingTag[1].split(/\s+/).includes(className)) continue;

    const tags = /<\/?div\b[^>]*>/gi;
    tags.lastIndex = openingTagPattern.lastIndex;
    let depth = 1;
    let tag;

    while ((tag = tags.exec(html)) !== null) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        return `${html.slice(0, openingTagPattern.lastIndex)}${contents}${html.slice(tag.index)}`;
      }
    }

    throw new Error(`Could not find closing </div> for "${className}"`);
  }

  throw new Error(`Could not find <div> with class "${className}"`);
}

function replaceSectionContents(html, sectionId, contents) {
  const openingTagPattern = /<section\b([^>]*)>/gi;
  let openingTag;

  while ((openingTag = openingTagPattern.exec(html)) !== null) {
    if (!new RegExp(`\\bid="${sectionId}"`).test(openingTag[1])) continue;

    const tags = /<\/?section\b[^>]*>/gi;
    tags.lastIndex = openingTagPattern.lastIndex;
    let depth = 1;
    let tag;

    while ((tag = tags.exec(html)) !== null) {
      depth += tag[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        return `${html.slice(0, openingTagPattern.lastIndex)}${contents}${html.slice(tag.index)}`;
      }
    }

    throw new Error(`Could not find closing </section> for "${sectionId}"`);
  }

  throw new Error(`Could not find <section> with id "${sectionId}"`);
}

function generateProjectsHTML() {
  if (projects.length === 0) return '';
  return projects.map((project, index) => {
    const techList = project.tech ? project.tech.split(',').map(t => t.trim()).filter(t => t) : ['HTML', 'CSS', 'JavaScript'];
    const hasGithub = project.github_url && project.github_url !== '';
    const hasDemo = project.demo_url && project.demo_url !== '';
    const hasVideo = project.video_url && project.video_url !== '';
    return `
    <article class="project-card project-card--has-bg reveal reveal-delay-${index + 1}" style="--project-bg: url('${htmlEscape(project.image || '../assets/images/projects/project-1.png')}');">
      <div class="project-card__media" role="img" aria-label="${htmlEscape(project.title)} preview"></div>
      <div class="project-card__body">
        <h3 class="project-card__title">${htmlEscape(project.title)}</h3>
        <p class="project-card__desc">${htmlEscape(project.description)}</p>
        <ul class="chip-list chip-list--sm">
          ${techList.map(tech => `<li class="chip">${htmlEscape(capitalizeFirstLetter(tech))}</li>`).join('')}
        </ul>
        <div class="project-card__links">
          ${hasGithub ? `<a href="${htmlEscape(project.github_url)}" class="project-link" target="_blank" rel="noopener noreferrer">Source Code</a>` : ''}
          ${hasDemo ? `<a href="${htmlEscape(project.demo_url)}" class="project-link" target="_blank" rel="noopener noreferrer">Demo</a>` : ''}
          ${hasVideo ? `<a href="${htmlEscape(project.video_url)}" class="project-link" target="_blank" rel="noopener noreferrer">Video</a>` : ''}
        </div>
      </div>
    </article>`;
  }).join('');
}

function generateBlogCardsHTML() {
  const displayPosts = blogPosts.slice(0, 3);
  return displayPosts.map((post, index) => {
    const tags = post.tags ? post.tags.slice(0, 3).map(tag => `<span class="blog-tag">${htmlEscape(tag)}</span>`).join('') : '';
    return `
    <article class="blog-card reveal reveal-delay-${index + 1}">
      <div class="blog-card__header">
        <span class="blog-card__badge">${htmlEscape(post.badge)}</span>
        <h3 class="blog-card__title">${htmlEscape(post.title)}</h3>
        <time class="blog-card__date" datetime="${htmlEscape(post.date)}">${post.date.split('-').slice(1).join('/')}</time>
      </div>
      <p class="blog-card__excerpt">${htmlEscape(post.excerpt)}</p>
      <div class="blog-card__tags">
        ${tags}
      </div>
      <a href="./${htmlEscape(post.filename)}.html" class="blog-card__link">Read More <span aria-hidden="true">→</span></a>
    </article>`;
  }).join('');
}

console.log('Loading content files...');
const siteContent = readYaml(path.join(BASE_DIR, 'content/site.yml'));
const resumeContent = readYaml(path.join(BASE_DIR, 'content/resume.yml'));

const projectsDir = path.join(BASE_DIR, 'content/projects');
const projectFiles = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'));
const projects = projectFiles.map(f => {
  const { data } = parseCmsFrontmatter(path.join(projectsDir, f));
  return {
    filename: f.replace('.md', ''),
    title: data.title,
    description: data.description,
    tech: data.tech,
    github_url: data.github_url,
    demo_url: data.demo_url,
    video_url: data.video_url,
    image: data.image,
    order: data.order || 0
  };
});
projects.sort((a, b) => a.order - b.order);

const blogDir = path.join(BASE_DIR, 'content/blog');
const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.md')).sort();
const blogPosts = blogFiles.map(f => {
  const { data, body } = parseCmsFrontmatter(path.join(blogDir, f));
  return {
    filename: f.replace('.md', ''),
    title: data.title,
    date: data.date || new Date().toISOString().split('T')[0],
    badge: data.badge || 'Article',
    excerpt: data.excerpt || '',
    tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : [],
    cover: data.cover || '',
    body: body || ''
  };
});

const blogIndexPath = path.join(BASE_DIR, 'pages/blogs/index.html');
let blogIndexContent = fs.readFileSync(blogIndexPath, 'utf8');

function updateBlogIndexCards() {
  blogIndexContent = replaceSectionContents(blogIndexContent, 'blog-posts', `
    <div class="container">
      <header class="section__header reveal">
        <h2 class="section__title">Latest Articles</h2>
        <p class="section__subtitle">Recent posts and tutorials</p>
      </header>
      <div class="blog-grid">
        ${generateBlogCardsHTML()}
      </div>
    </div>
  `);
}

updateBlogIndexCards();

const indexPath = path.join(BASE_DIR, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

function updateHeroSection(content, html = indexContent) {
  let result = html;
  result = result.replace(
    /<p class="hero__eyebrow">[\s\S]*?<\/p>/,
    `<p class="hero__eyebrow"><span class="hero__eyebrow-dot" aria-hidden="true"></span>${htmlEscape(content.hero_eyebrow || 'Open to AI/ML Internships')}</p>`
  );
  result = result.replace(
    /<h1 class="hero__title">[\s\S]*?<\/h1>/,
    `<h1 class="hero__title"><span class="hero__title-text">${htmlEscape(content.hero_title || 'Abid Hasan')}</span></h1>`
  );
  const roleText = content.hero_role || 'Computer Science Student & Aspiring AI/ML Engineer';
  result = result.replace(
    /<p class="hero__role" data-role-text="[^"]*">[\s\S]*?<\/p>/,
    `<p class="hero__role" data-role-text="${htmlEscape(roleText)}">${htmlEscape(roleText)}</p>`
  );
  const taglineText = content.hero_tagline || 'Building intelligent systems with a focus on Deep Learning and clean software engineering. Passionate about solving complex problems and continuous learning in the AI space.';
  result = result.replace(
    /<p class="hero__tagline">[\s\S]*?<\/p>/,
    `<p class="hero__tagline">${htmlEscape(taglineText)}</p>`
  );
  return result;
}

function updateAboutSection(content, html = indexContent) {
  let result = html;
  const p1 = content.about?.p1 || 'I am a third-year Computer Science and Engineering undergraduate at Southeast University and a 100% merit-based scholarship recipient. I have developed a strong foundation in C++, Data Structures, and Algorithms, which fuels my passion for software engineering and technical problem-solving.';
  const p2 = content.about?.p2 || 'My experience includes building versatile applications, such as a Movie Ticket Management System using JavaFX and a BMI & BMR Calculator for Android integrated with Firebase. I am proficient in Java, Python, and SQL, and I enjoy creating well-structured software that bridge the gap between complex backend logic and user-friendly interfaces.';
  const p3 = content.about?.p3 || 'Currently, I am specializing in Artificial Intelligence and Deep Learning, with hands-on experience in neural network architectures like ANN, CNN, and RNN. My goal is to contribute to AI research and build intelligent systems that solve real-world challenges through continuous learning and collaboration. My main goal is to secure a internship in the field of AI/ML.';
  
  const aboutContent = `
      <p>${htmlEscape(p1)}</p>
      <p>${htmlEscape(p2)}</p>
      <p>${htmlEscape(p3)}</p>
    `;

  result = replaceDivContents(result, 'about__content', aboutContent);
  return result;
}

function updateEducationSection(content, html = indexContent) {
  let result = html;
  const educationList = content.education || [];
  const educationItems = educationList.map((edu) => {
    const detailsHtml = (edu.details || []).map(detail => `<li>${htmlEscape(detail)}</li>`).join('');
    return `
    <article class="education-card education-card--large reveal">
      <span class="education-card__badge">${htmlEscape(edu.badge || 'University')}</span>
      <div class="education-card__header">
        <h3 class="education-card__degree">${htmlEscape(edu.degree || 'Bachelor of Science in Computer Science and Engineering')}</h3>
        <span class="education-card__dates">${htmlEscape(edu.dates || 'October 2023 — Present')}</span>
      </div>
      <p class="education-card__school">${htmlEscape(edu.school || 'Southeast University')}</p>
      <ul class="education-card__list">
        ${detailsHtml}
      </ul>
    </article>`;
  }).join('');
  
  result = replaceDivContents(result, 'education-timeline', educationItems);
  return result;
}

function updateSkillsSection(content, html = indexContent) {
  let result = html;
  const skillsList = content.skills || [];
  const skillsItems = skillsList.map((skillCat) => {
    const items = skillCat?.items ? skillCat.items.split(',').map(i => i.trim()).filter(i => i) : [];
    return `
    <div class="skills-grid__item">
      <span class="skills-grid__category">${htmlEscape(capitalizeFirstLetter(skillCat?.category || 'Skills'))}</span>
      <div class="skills-grid__list">
        ${items.map(item => `<span class="skill-chip">${htmlEscape(item)}</span>`).join('')}
      </div>
    </div>`;
  }).join('');
  
  result = replaceDivContents(result, 'skills-grid', skillsItems);
  return result;
}

function updateCertificationsSection(content, html = indexContent) {
  let result = html;
  const certList = content.certifications || [];
  const certItems = certList.map((cert) => `
    <article class="cert-card reveal">
      <span class="cert-card__platform">${htmlEscape(cert.platform || 'Coursera')}</span>
      <h3 class="cert-card__title">${htmlEscape(cert.title || 'Data Science Math Skills - Duke University')}</h3>
      <p class="cert-card__desc">${htmlEscape(cert.description || 'Algebra, calculus, and statistics for data science.')}</p>
      <span class="cert-card__date">${htmlEscape(cert.date || '2025')}</span>
    </article>`).join('');
  
  result = replaceDivContents(result, 'cert-grid', certItems);
  return result;
}

function updateTestimonialsSection(content, html = indexContent) {
  let result = html;
  const testimonialList = content.testimonials || [];
  const testimonialItems = testimonialList.map((test, i) => `
    <article class="testimonial-card reveal reveal-delay-${i + 1}">
      ${test.image ? `<img class="testimonial-card__photo" src="${htmlEscape(test.image)}" alt="${htmlEscape(test.name || 'Testimonial author')}" width="72" height="72" loading="lazy">` : ''}
      <blockquote class="testimonial-card__quote">
        <p>&ldquo;${htmlEscape(test.quote || 'Abid is an exceptional developer with deep understanding of algorithms and clean code practices.')}&rdquo;</p>
      </blockquote>
      <cite class="testimonial-card__cite">
        <span class="testimonial-card__name">${htmlEscape(test.name || 'Dr. Sarah Mitchell')}</span>
        <span class="testimonial-card__role">${htmlEscape(test.role || 'Professor, Computer Science, Southeast University')}</span>
      </cite>
    </article>`).join('');
  
  result = replaceDivContents(result, 'testimonials-scroll', testimonialItems);
  return result;
}

function updateContactSection(content, html = indexContent) {
  let result = html;
  
  const contactEmail = content.contact?.email || 'abid.hasan.tng@gmail.com';
  const redirectUrl = content.contact?.redirect_url || 'https://abidhasan27.me/#contact';
  const formEndpoint = content.contact?.form_endpoint || 'https://formsubmit.co/abid.hasan.tng@gmail.com';
  
  result = result.replace(
    /<p class="contact-info__email">[\s\S]*?<\/p>/,
    `<p class="contact-info__email"><strong>Email:</strong> <a href="mailto:${htmlEscape(contactEmail)}">${htmlEscape(contactEmail)}</a></p>`
  );
  
  result = result.replace(
    /<input type="hidden" name="_next" value="[^"]*">/,
    `<input type="hidden" name="_next" value="${htmlEscape(redirectUrl)}">`
  );
  
  result = result.replace(
    /<form class="contact-form" id="contact-form" name="contact" method="POST" action="[^"]*" novalidate>/,
    `<form class="contact-form" id="contact-form" name="contact" method="POST" action="${htmlEscape(formEndpoint)}" novalidate>`
  );
  
  return result;
}

function updateProjectsOnMainPage(content, html = indexContent) {
  let result = html;
  const projectsGrid = generateProjectsHTML();
  result = replaceSectionContents(result, 'projects', `
    <div class="container">
      <header class="section__header reveal">
        <h2 class="section__title">Projects</h2>
        <p class="section__subtitle">Selected work and experiments</p>
      </header>
      <div class="projects-grid">${projectsGrid}</div>
    </div>
  `);
  return result;
}

let finalIndex = updateHeroSection(siteContent);
finalIndex = updateAboutSection(siteContent, finalIndex);
finalIndex = updateEducationSection(siteContent, finalIndex);
finalIndex = updateSkillsSection(siteContent, finalIndex);
finalIndex = updateCertificationsSection(siteContent, finalIndex);
finalIndex = updateTestimonialsSection(siteContent, finalIndex);
finalIndex = updateContactSection(siteContent, finalIndex);
finalIndex = updateProjectsOnMainPage(siteContent, finalIndex);

fs.writeFileSync(path.join(BASE_DIR, 'index.html'), finalIndex);
fs.writeFileSync(path.join(BASE_DIR, 'pages/blogs/index.html'), blogIndexContent);

const blogPostsDir = path.join(BASE_DIR, 'pages/blogs');
if (!fs.existsSync(blogPostsDir)) {
  fs.mkdirSync(blogPostsDir, { recursive: true });
}

blogPosts.forEach(post => {
  const postPath = path.join(blogPostsDir, `${post.filename}.html`);
  const tagsHtml = post.tags ? post.tags.map(tag => `<span class="blog-tag">${htmlEscape(tag)}</span>`).join('') : '';
  const blogPostHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${htmlEscape(post.title)} - Abid Hasan | Portfolio</title>
  <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../css/styles.css">
  <link rel="stylesheet" href="../../css/gradients.css">
  <link rel="stylesheet" href="../../css/animations.css">
  <link rel="stylesheet" href="../../css/futuristic.css">
  <link rel="stylesheet" href="../../css/blog.css">
</head>
<body>
  <div class="bg-gradient" aria-hidden="true">
    <div class="bg-gradient__layer"></div>
    <div class="bg-gradient__layer bg-gradient__layer--secondary"></div>
    <div class="gradient-orb gradient-orb--1"></div>
    <div class="gradient-orb gradient-orb--2"></div>
    <div class="gradient-orb gradient-orb--3"></div>
  </div>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" id="top">
    <nav class="nav container" aria-label="Main navigation">
      <a class="nav__logo" href="../../">Abid Hasan</a>
      <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="nav-menu" aria-label="Open menu">
        <span class="nav__toggle-bar"></span>
        <span class="nav__toggle-bar"></span>
        <span class="nav__toggle-bar"></span>
      </button>
      <ul class="nav__menu" id="nav-menu">
        <li><a class="nav__link" href="../../#hero">Home</a></li>
        <li><a class="nav__link" href="../../#about">About</a></li>
        <li><a class="nav__link" href="../../#education">Education</a></li>
        <li><a class="nav__link" href="../../#achievements">Awards</a></li>
        <li><a class="nav__link" href="../../#certifications">Certs</a></li>
        <li><a class="nav__link" href="../../#skills">Skills</a></li>
        <li><a class="nav__link" href="../../#projects">Projects</a></li>
        <li><a class="nav__link" href="./index.html">Blog</a></li>
        <li><a class="nav__link" href="../../#testimonials">Reviews</a></li>
        <li><a class="nav__link" href="../../assets/resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a></li>
      </ul>
    </nav>
  </header>
  <main id="main">
    <section class="section">
      <div class="container">
        <article class="blog-post reveal">
          <header class="blog-post__header">
            <h1 class="blog-post__title">${htmlEscape(post.title)}</h1>
            <div class="blog-post__meta">
              <span class="blog-post__date">${htmlEscape(post.date)}</span>
              <span class="blog-post__badge">${htmlEscape(post.badge)}</span>
            </div>
          </header>
          ${post.cover ? `<img src="${htmlEscape(post.cover)}" alt="${htmlEscape(post.title)} cover" class="blog-post__cover">` : ''}
          <div class="blog-post__content">
            ${post.body ? renderMarkdown(post.body) : '<p>Content will be added via CMS.</p>'}
          </div>
          <footer class="blog-post__footer">
            <div class="blog-post__tags">
              ${tagsHtml}
            </div>
            <a href="./index.html" class="blog-post__back">← Back to Blog</a>
          </footer>
        </article>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p>&copy; <span id="year"></span> Abid Hasan. All rights reserved.</p>
      <div class="site-footer__links">
        <a href="../../#hero" class="footer-link">Back to top</a>
        <a href="https://github.com/hasan2733" target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
        <a href="https://www.linkedin.com/in/abidhasan720" target="_blank" rel="noopener noreferrer" class="footer-link">LinkedIn</a>
      </div>
    </div>
  </footer>
  <script src="../../js/main.js"></script>
  <script src="../../js/animations.js"></script>
  <script src="../../js/particles.js"></script>
</body>
</html>`;
  
  fs.writeFileSync(postPath, blogPostHTML);
});

const summary = {
  timestamp: new Date().toISOString(),
  projectCount: projects.length,
  blogPostCount: blogPosts.length,
  resumeFilename: resumeContent?.filename
};

fs.writeFileSync(
  path.join(BASE_DIR, 'content/build-summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log('Build completed successfully!');
console.log(`- Updated index.html (hero, about, education, skills, certifications, testimonials, contact, projects)`);
console.log(`- Updated blog index page`);
console.log(`- Generated ${blogPosts.length} individual blog post pages`);
console.log(`- Summary: content/build-summary.json`);
