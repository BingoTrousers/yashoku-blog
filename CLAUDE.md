# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start       # dev server with hot reload at http://localhost:8082
npm run build   # production build to _site/
```

No linter or test suite is configured.

## Architecture

This is an [Eleventy (11ty)](https://www.11ty.dev/) static site — a Japanese food blog called **夜食 Yashoku**. Source lives in `src/`, output in `_site/`. Never edit `_site/` directly.

**Template hierarchy:**
- `src/_includes/base.njk` — outer HTML shell (head, sticky nav, footer). All pages use this.
- `src/_includes/post.njk` — extends `base.njk`; wraps individual blog posts. Renders a hero header with the post's `thumbnail` as a background image when present.
- Page templates (`index.njk`, `tagpage.njk`, `tags.njk`, `about.njk`) extend `base.njk` directly.

**Data:**
- `src/_data/site.json` — global site metadata (title, description, author, nav links). Available in all templates as `site.*`.
- Post frontmatter fields: `title`, `description`, `date`, `author`, `readingTime`, `thumbnail` (URL), `tags` (array — must include `"posts"` to appear in collections).

**Collections defined in `.eleventy.js`:**
- `collections.posts` — all `src/posts/*.md` files, newest first.
- `collections.tagList` — deduplicated sorted tag list (excludes `"posts"` and `"all"`).

**Pagination:** `index.njk` paginates `collections.posts` at 6 per page. Page 0 renders at `/`, subsequent pages at `/page/N/`.

**Search:** Client-side only. `src/search-index.11ty.js` generates `/search-index.json` at build time (title, description, url, tags per post). `src/js/search.js` fetches this and filters `.post-card` elements by `data-url` attribute. On non-home pages, Enter redirects to `/?q=…`.

**Static assets:** `src/css/style.css` is the single stylesheet (no preprocessor). `src/favicon.svg` is passed through as-is. Adding new passthrough paths requires updating `.eleventy.js`.

**Fonts:** Loaded from Google Fonts — Rajdhani (UI/display), Lora (serif body), Noto Sans JP (Japanese text). CSS variables: `--font-sans`, `--font-serif`, `--font-jp`.

## Adding a post

Create `src/posts/your-slug.md` with frontmatter:

```yaml
---
layout: post.njk
title: "Post Title"
description: One-sentence summary shown on cards and in meta.
date: YYYY-MM-DD
author: Author Name
readingTime: 5
thumbnail: "https://…"
tags:
  - posts
  - TagName
---
```

Tags become routed pages automatically via `tagpage.njk` — no extra config needed.
