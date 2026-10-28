// Small enhancements for the blog pages. Everything works without them.

/* Code blocks: a header with the language and a copy button. --------------- */

for (const block of document.querySelectorAll('.prose div.highlighter-rouge')) {
  const lang = [...block.classList].find((c) => c.startsWith('language-'))?.slice(9);
  const head = document.createElement('div');
  head.className = 'code__head';
  const name = document.createElement('span');
  name.textContent = lang && lang !== 'plaintext' ? lang : 'code';
  head.append(name);

  if (navigator.clipboard) {
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'code__copy';
    copy.textContent = 'Copy';
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.querySelector('code').innerText);
        copy.textContent = 'Copied';
      } catch {
        copy.textContent = 'Failed';
      }
      setTimeout(() => (copy.textContent = 'Copy'), 1600);
    });
    head.append(copy);
  }
  block.prepend(head);
}

/* Table of contents for posts: built from the h2/h3 headings. --------------- */

const toc = document.querySelector('[data-toc]');
const prose = document.querySelector('[data-prose]');
if (toc && prose) {
  const headings = [...prose.querySelectorAll('h2[id], h3[id]')];
  if (headings.length >= 3) {
    const list = toc.querySelector('ol');
    const links = new Map();
    for (const h of headings) {
      const li = document.createElement('li');
      if (h.tagName === 'H3') li.className = 'is-sub';
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      li.append(a);
      list.append(li);
      links.set(h, a);
    }
    toc.hidden = false;

    // Highlight the last heading that has scrolled past the top third.
    const update = () => {
      const line = window.innerHeight / 3;
      let current = headings[0];
      for (const h of headings) if (h.getBoundingClientRect().top < line) current = h;
      for (const [h, a] of links) a.classList.toggle('is-active', h === current);
    };
    document.addEventListener('scroll', update, { passive: true });
    update();
  }
}

/* Filter on the blog index. -------------------------------------------------- */

const filter = document.querySelector('[data-filter]');
if (filter) {
  const rows = [...document.querySelectorAll('.row[data-search]')];
  const years = [...document.querySelectorAll('[data-year]')];
  const empty = document.querySelector('[data-empty]');
  filter.addEventListener('input', () => {
    const terms = filter.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const row of rows) {
      const match = terms.every((t) => row.dataset.search.includes(t));
      row.hidden = !match;
      if (match) shown++;
    }
    for (const year of years) year.hidden = !year.querySelector('.row:not([hidden])');
    empty.hidden = shown > 0;
  });
}
