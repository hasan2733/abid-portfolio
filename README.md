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
python3 -m http.server 8080 --directory docs
```

Open [http://localhost:8080](http://localhost:8080)

**VS Code / Cursor:** Run and Debug → **Open portfolio in Chrome** (starts the server automatically).

If port 8080 is busy, stop the old process: `fuser -k 8080/tcp`

> Contact form submissions only work after deploy to Netlify (or with `netlify dev`).

## Deploy to Netlify (recommended)

1. Push this repo to GitHub.
2. Sign in at [Netlify](https://www.netlify.com/) → **Add new site** → **Import from Git**.
3. Build settings are read from [`netlify.toml`](netlify.toml):
   - **Publish directory:** `docs`
   - **Build command:** none (static site)
4. Deploy. Netlify auto-detects the contact form from `data-netlify="true"` on the form in `index.html`.
5. **Custom domain:** Site settings → Domain management → Add your domain → set DNS at your registrar (Netlify docs show A/CNAME records).
6. HTTPS is enabled automatically.

### Form notifications

In Netlify: **Site configuration** → **Forms** → enable email notifications for new submissions.

## Deploy to GitHub Pages

The live site files are in [`docs/`](docs/) (`index.html`, `css/`, `js/`, `assets/`).

**If you only see this README on your site:** Pages is publishing the **repo root** (`/`), which has no `index.html`. GitHub then shows `README.md` instead of the portfolio.

### Option A — Deploy from branch (simplest)

1. Push this repo to GitHub.
2. **Settings** → **Pages** → **Build and deployment**
3. **Source:** Deploy from a branch
4. **Branch:** `main` · **Folder:** `/docs` (not `/ (root)`)
5. Save. After a minute, open your Pages URL — you should see the portfolio.

**Custom domain** (`abidhasan27.me`): [`docs/CNAME`](docs/CNAME) is included. In Pages settings, set the custom domain and configure DNS as GitHub instructs.

### Option B — GitHub Actions

1. **Settings** → **Pages** → **Source:** **GitHub Actions**
2. Push to `main` (workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml))
3. Check the **Actions** tab for a green **Deploy GitHub Pages** run

### Contact form on GitHub Pages

Netlify Forms do not run on GitHub Pages. Use [Formspree](https://formspree.io) or keep Netlify for hosting.

## Customize content

Edit [`docs/index.html`](docs/index.html) for your name, bio, education, skills, projects, and social links.

Place assets:

| File | Path |
|------|------|
| Resume PDF | `docs/assets/resume.pdf` |
| Profile photo | `docs/assets/images/profile-placeholder.jpg` |
| Project images | `docs/assets/images/projects/` |

## Project structure

```
docs/                                 # Site root (GitHub Pages / Netlify)
  index.html
  css/
  js/
  assets/
netlify.toml                          # Netlify publish path → docs
.github/workflows/pages.yml           # Optional GitHub Actions deploy
```

## Animation files

| File | Purpose |
|------|---------|
| `docs/css/gradients.css` | Animated background orbs |
| `docs/css/animations.css` | Scroll reveal |
| `docs/css/futuristic.css` | Grid overlay, hero entrance, nav underline, card glow |
| `docs/js/animations.js` | Reveal observer, hero typewriter |
| `docs/js/particles.js` | Hero particle network (disabled when reduced motion) |
