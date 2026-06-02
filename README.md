# Portfolio Website

A formal, responsive personal portfolio built with HTML, CSS, and JavaScript. Designed for **free static hosting** (Netlify, GitHub Pages, or Vercel) with **Netlify Forms** for contact messages.

## Features

- Single-page layout: Hero, About, Education, Skills, Projects, Contact
- Futuristic animations: moving grid, hero stagger, typewriter role line, particle network, scroll reveals
- Respects `prefers-reduced-motion`
- Fully responsive mobile navigation with active section highlighting
- Resume view/download (PDF in `assets/`)
- Contact form via Netlify Forms (no backend required)

## Local preview

This site is **static HTML/CSS/JS** — do not use `mvn spring-boot:run` (Maven/Spring Boot was removed).

From the project root, use any of these:

```bash
./run.sh
```

```bash
npm start
```

```bash
python3 -m http.server 8080 --directory src/main/resources/static
```

Open [http://localhost:8080](http://localhost:8080)

**VS Code / Cursor:** Run and Debug → **Open portfolio in Chrome** (starts the server automatically).

If port 8080 is busy, stop the old process: `fuser -k 8080/tcp`

> Contact form submissions only work after deploy to Netlify (or with `netlify dev`).

## Deploy to Netlify (recommended)

1. Push this repo to GitHub.
2. Sign in at [Netlify](https://www.netlify.com/) → **Add new site** → **Import from Git**.
3. Build settings are read from [`netlify.toml`](netlify.toml):
   - **Publish directory:** `src/main/resources/static`
   - **Build command:** none (static site)
4. Deploy. Netlify auto-detects the contact form from `data-netlify="true"` on the form in `index.html`.
5. **Custom domain:** Site settings → Domain management → Add your domain → set DNS at your registrar (Netlify docs show A/CNAME records).
6. HTTPS is enabled automatically.

### Form notifications

In Netlify: **Site configuration** → **Forms** → enable email notifications for new submissions.

## Deploy to GitHub Pages

1. Repo → **Settings** → **Pages** → Source: GitHub Actions (or branch `main`, folder `/src/main/resources/static` if your plan allows).
2. Use a workflow that publishes `src/main/resources/static` (or copy files to `docs/`).
3. For a custom domain, add a `CNAME` file and configure DNS.
4. Contact form: switch to [Formspree](https://formspree.io) (GitHub Pages has no built-in forms).

## Customize content

Edit [`src/main/resources/static/index.html`](src/main/resources/static/index.html) for your name, bio, education, skills, projects, and social links.

Place assets:

| File | Path |
|------|------|
| Resume PDF | `src/main/resources/static/assets/resume.pdf` |
| Profile photo | `src/main/resources/static/assets/images/profile-placeholder.jpg` |
| Project images | `src/main/resources/static/assets/images/projects/` |

## Project structure

```
netlify.toml                          # Netlify publish path
src/main/resources/static/
  index.html                          # Main page
  css/                                # styles, gradients, animations, futuristic
  js/                                 # main, animations, particles, contact
  assets/                             # resume, images
```

## Animation files

| File | Purpose |
|------|---------|
| `css/gradients.css` | Animated background orbs |
| `css/animations.css` | Scroll reveal |
| `css/futuristic.css` | Grid overlay, hero entrance, nav underline, card glow |
| `js/animations.js` | Reveal observer, hero typewriter |
| `js/particles.js` | Hero particle network (disabled when reduced motion) |
