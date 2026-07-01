document.addEventListener('DOMContentLoaded', () => {
  // ── Search ────────────────────────────────────────────────────
  const input = document.getElementById('search-input');
  if (!input) return;

  const noResults = document.getElementById('search-no-results');
  const onListPage = () => document.querySelector('.post-card') !== null;
  let posts = [];

  // The homepage paginates posts (6 per page), so a search may need to surface
  // matches that aren't among the currently-rendered cards. When that grid is
  // present, rebuild it from the full search index instead of just toggling
  // the cards already on the page.
  const pagedGrid = document.getElementById('post-grid');
  const originalGridHTML = pagedGrid ? pagedGrid.innerHTML : null;

  fetch('/search-index.json')
    .then(r => r.json())
    .then(data => {
      posts = data;
      const q = new URLSearchParams(location.search).get('q');
      if (q) { input.value = q; filter(q); }
    });

  function imgSrc(url, w, q) {
    if (!url) return '';
    try {
      const u = new URL(url);
      u.searchParams.set('w', String(w));
      u.searchParams.set('q', String(q));
      return u.toString();
    } catch { return url; }
  }

  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function slugify(str) {
    return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function renderCard(post) {
    const tags = post.tags || [];
    const tagsHtml = tags.map(t =>
      `<a href="/tags/${slugify(t)}/" class="tag">${esc(t)}</a>`
    ).join('');
    const src    = imgSrc(post.thumbnail, 600, 60);
    const src400 = imgSrc(post.thumbnail, 400, 55);
    const src800 = imgSrc(post.thumbnail, 800, 60);
    const thumb  = post.thumbnail
      ? `<img src="${esc(src)}" srcset="${esc(src400)} 400w, ${esc(src800)} 800w" sizes="(max-width:600px) calc(100vw - 2rem), 380px" alt="${esc(post.title)}" loading="lazy" />`
      : '';
    return `
      <article class="post-card" data-url="${esc(post.url)}">
        <div class="post-card-thumb">${thumb}</div>
        <div class="post-card-body">
          ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
          <h2 class="post-card-title"><a href="${esc(post.url)}">${esc(post.title)}</a></h2>
          ${post.author ? `<p class="post-card-author">${esc(post.author)}</p>` : ''}
          ${post.description ? `<p class="post-card-excerpt">${esc(post.description)}</p>` : ''}
          <div class="post-meta">
            <time>${formatDate(post.date)}</time>
            ${post.readingTime ? `<span class="post-meta-sep">·</span><span>${post.readingTime} min read</span>` : ''}
            <a href="${esc(post.url)}" class="post-card-cta" tabindex="-1" aria-hidden="true">Read post →</a>
          </div>
        </div>
      </article>`;
  }

  function matches(post, term) {
    const haystack = [post.title, post.description, ...(post.tags || [])].join(' ').toLowerCase();
    return term.split(/\s+/).every(word => haystack.includes(word));
  }

  function filter(q) {
    const term = q.trim().toLowerCase();

    const pagination = document.getElementById('post-pagination');

    if (!term) {
      if (pagedGrid && originalGridHTML !== null) pagedGrid.innerHTML = originalGridHTML;
      if (pagination) pagination.hidden = false;
      document.querySelectorAll('.post-card').forEach(c => c.style.display = '');
      if (noResults) noResults.hidden = true;
      return;
    }

    // Paginated homepage grid: search across every post, not just the visible page.
    if (pagedGrid) {
      const matched = posts
        .filter(p => matches(p, term))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      if (pagination) pagination.hidden = true;
      pagedGrid.innerHTML = matched.map(renderCard).join('');
      if (noResults) noResults.hidden = matched.length > 0;
      return;
    }

    // Unpaginated pages (e.g. tag archives): all matching posts are already rendered.
    let visible = 0;
    document.querySelectorAll('.post-card').forEach(card => {
      const post = posts.find(p => p.url === card.dataset.url);
      if (!post) return;
      const match = matches(post, term);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (noResults) noResults.hidden = visible > 0;
  }

  input.addEventListener('input', () => { if (onListPage()) filter(input.value); });
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    if (onListPage()) {
      // Close overlay so filtered results are visible, then scroll to them
      if (typeof window.closeSearch === 'function') window.closeSearch(false);
      const postList = document.querySelector('.post-list');
      if (postList) {
        const header = document.querySelector('.site-header');
        const top = postList.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight + 12 : 12);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    } else {
      const q = input.value.trim();
      if (q) location.href = `/?q=${encodeURIComponent(q)}`;
    }
  });

  // ── Client-side pagination ────────────────────────────────────
  async function loadPage(url) {
    const postList = document.querySelector('.post-list');
    if (!postList) return;

    const grid = postList.querySelector('.post-grid');
    if (grid) {
      grid.style.transition = 'opacity 0.15s ease';
      grid.style.opacity = '0.3';
    }

    try {
      const doc = new DOMParser().parseFromString(
        await (await fetch(url)).text(), 'text/html'
      );
      const newList = doc.querySelector('.post-list');
      if (!newList) { location.href = url; return; }

      // Swap grid content
      const newGrid = newList.querySelector('.post-grid');
      if (grid && newGrid) {
        grid.innerHTML = newGrid.innerHTML;
        grid.style.opacity = '1';
      }

      // Swap pagination
      const oldPag = postList.querySelector('.pagination');
      const newPag = newList.querySelector('.pagination');
      if (oldPag) oldPag.replaceWith(newPag ? newPag.cloneNode(true) : document.createDocumentFragment());
      else if (newPag) postList.appendChild(newPag.cloneNode(true));

      history.pushState(null, doc.title, url);

      // Scroll post list into view, clear of the sticky header
      const header = document.querySelector('.site-header');
      const top = postList.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight + 12 : 12);
      window.scrollTo({ top, behavior: 'smooth' });

    } catch {
      location.href = url;
    }
  }

  // Event delegation — works even after pagination DOM is swapped
  document.addEventListener('click', e => {
    const link = e.target.closest('.pagination-page, .pagination-btn');
    if (!link || link.classList.contains('pagination-btn--disabled')) return;
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    loadPage(href);
  });

  window.addEventListener('popstate', () => loadPage(location.pathname));
});
