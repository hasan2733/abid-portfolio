---
title: "Getting Started with GitHub Pages"
date: 2024-11-15
badge: "Tutorial"
excerpt: "Learn how to create a free portfolio website using GitHub Pages and host your projects online with a custom domain."
tags: "GitHub, Web Development, Tutorial"
cover: ""
body: "# Getting Started with GitHub Pages

Learn how to create a free portfolio website using GitHub Pages and host your projects online with a custom domain. GitHub Pages is a fantastic way to showcase your work, and it's completely free.

## What is GitHub Pages?

GitHub Pages is a static site hosting service from GitHub to hosts your websites directly from your GitHub repository. Just name, branch, and directory, and you're good to go!

## Step-by-Step Setup

### 1. Create Your Repository

Create a new GitHub repository. For user or organization pages, the repository name should be your username (e.g., `hasan2733.github.io`). For project pages, you can name it anything.

### 2. Fork a Template or Use Your Existing Project

You can:
- Start with a boilerplate like [HTML5 UP](https://html5up.net/) or [Bootstrap](https://getbootstrap.com/)
- Use your existing local project
- Fork this portfolio template

### 3. Push Your Files

Push your `index.html`, `css/`, `js/`, `assets/` to your repository.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/hasan2733/abid-portfolio.git
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository settings
2. Scroll down to "Pages" section
3. Select source: `main` branch, `/ (root)`
4. Click save

GitHub Pages takes a minute to deploy. Your site will be available at `https://username.github.io/repository-name`.

## Custom Domain

To use a custom domain:

1. Buy a domain from a registrar
2. In repository settings → Pages, enter your custom domain
3. Configure DNS records at your registrar:
   - For `CNAME`: Add `CNAME` record pointing to `username.github.io`
   - For `A` records: Use GitHub's recommended IPs for apex domains

## Jekyll and Build Tools

GitHub Pages supports Jekyll by default, which allows you to add Markdown posts and compile SCSS. If you want to stick with plain HTML/CSS/JS, just commit those files directly.

## Tips for Success

1. **Keep it lightweight** - GitHub Pages has bandwidth limits, optimize images
2. **Use HTTPS** - GitHub Pages provides free SSL certificates
3. **Add a `.nojekyll` file** - If you have files/folders starting with `_` that shouldn't be processed by Jekyll
4. **Use GitHub Actions** - For custom build processes or to automate deployments

## Conclusion

GitHub Pages is an excellent choice for personal portfolios, project showcases, and small websites. It's reliable, free, and integrates seamlessly with GitHub's ecosystem. With a bit of setup, your work can be live on the internet in minutes.

*This is part of my ongoing learning journey in building robust, performant web experiences.*

**Further Reading:**
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Setting up a custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
