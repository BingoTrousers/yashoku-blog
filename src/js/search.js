document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  if (!input) return;

  const noResults = document.getElementById('search-no-results');
  const onHomePage = () => document.querySelector('.post-card') !== null;
  let posts = [];

  fetch('/search-index.json')
    .then(r => r.json())
    .then(data => {
      posts = data;
      const q = new URLSearchParams(location.search).get('q');
      if (q) {
        input.value = q;
        filter(q);
      }
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

  input.addEventListener('input', () => {
    if (onHomePage()) filter(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !onHomePage()) {
      const q = input.value.trim();
      if (q) location.href = `/?q=${encodeURIComponent(q)}`;
    }
  });
});
