# 夜食 Yashoku

A fast, dark-themed blog built with [Eleventy](https://www.11ty.dev/) — themed around Japan's nocturnal street food scene. Built as a portfolio demonstration of a modern static site with no frameworks or build complexity.

**Live site → [yashoku-blog.vercel.app](https://yashoku-blog.vercel.app)**

---

## Features

- **Zero-JS page loads** — Eleventy generates all pages at build time; JavaScript is strictly progressive enhancement
- **Client-side search** — instant filtering across all posts without a backend, driven by a generated JSON index
- **SPA-style pagination** — page navigation fetches and swaps only the post grid in-place, preserving the hero and header without any layout shift
- **Tag system** — each tag generates its own archive page automatically
- **Responsive images** — `srcset` at multiple widths with `fetchpriority="high"` on the LCP image; Lighthouse performance score 93+
- **Non-render-blocking fonts** — Google Fonts loaded via `preload` + async swap, saving ~880ms on first paint
- **Minified CSS** — `clean-css` post-build transform, no preprocessor required
- **SVG favicon** — inline, theme-matched, no PNG fallbacks needed

## Stack

| Layer | Tool |
|---|---|
| Static site generator | Eleventy 3 |
| Templating | Nunjucks |
| Styling | Vanilla CSS with custom properties |
| Fonts | Google Fonts (Rajdhani, Lora, Noto Sans JP) |
| Deployment | Vercel (auto-deploy from `main`) |

## Getting started

```bash
npm install
npm start        # dev server at http://localhost:8082
npm run build    # production build → _site/
```

## Adding a post

Create `src/posts/your-slug.md`:

```yaml
---
layout: post.njk
title: "Post title"
description: One-sentence summary shown on cards and in meta.
date: YYYY-MM-DD
author: Author Name
readingTime: 5
thumbnail: "https://…"
tags:
  - posts
  - TagName
---

Post body in Markdown.
```

The `"posts"` tag is required for the post to appear in collections. Any additional tags automatically generate archive pages at `/tags/tag-name/`.

## Site configuration

Edit `src/_data/site.json` to update the site title, description, author bio, and navigation links.

## Project structure

```
src/
├── _data/site.json          # Global site config
├── _includes/
│   ├── base.njk             # Outer HTML shell (head, header, footer)
│   └── post.njk             # Individual post layout with hero image
├── css/style.css            # Single stylesheet, design-token driven
├── js/search.js             # Search + client-side pagination
├── posts/                   # Markdown blog posts
├── index.njk                # Homepage + pagination
├── tagpage.njk              # Tag archive pages
└── search-index.11ty.js     # Generates /search-index.json at build time
```
