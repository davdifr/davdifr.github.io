# davdifr.com

Personal site of Davide Di Francesco: a landing page and a blog, built with
Jekyll and deployed to GitHub Pages by `.github/workflows/pages-deploy.yml`.

## Structure

- `index.html` + `assets/home/`: the landing page and its WebGL dot grid,
  laid out on the page's own columns.
- `_layouts/`, `_includes/`, `assets/css/`, `assets/js/`: the site's own theme
  for the blog (`/blog/`), posts, archive, tags and categories, with a light
  particle sky (`assets/js/stars.js`).
- `_posts/`: articles, served at `/posts/:title/`. Comments come from Giscus,
  keyed on that path.
- `_tabs/`: Archive, Tags and Categories. `about.md` only redirects old links to
  the landing page, which now holds the About content.
- `feed.xml`, `robots.txt`, `404.html`: generated at the site root.
- `sw.min.js`: removes the service worker the previous theme installed for
  returning visitors.

## Local development

```bash
bundle install
bundle exec jekyll serve
```

`bash tools/test.sh` builds the site for production and checks it with
html-proofer, as CI does.
