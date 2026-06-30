document.addEventListener('DOMContentLoaded', () => {
  // ── Search ────────────────────────────────────────────────────
  const input = document.getElementById('search-input');
  if (!input) return;

  const noResults = document.getElementById('search-no-results');
  const onListPage = () => document.querySelector('.post-card') !== null;
  let posts = [];

  fetch('/search-index.json')
    .then(r => r.json())
    .then(data => {
      posts = data;
      const q = new URLSearchParams(location.search).get('q');
      if (q) { input.value = q; filter(q); }
    });

  function filter(q) {
    const term = q.trim().toLowerCase();
    const cards = document.querySelectorAll('.post-card');
    if (!term) {
      cards.forEach(c => c.style.display = '');
      if (noResults) noResults.hidden = true;
      return;
    }
    let visible = 0;
    cards.forEach(card => {
      const post = posts.find(p => p.url === card.dataset.url);
      if (!post) return;
      const haystack = [post.title, post.description, ...(post.tags || [])].join(' ').toLowerCase();
      const match = term.split(/\s+/).every(word => haystack.includes(word));
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
