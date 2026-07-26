const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');

if (navToggle && siteNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 700) {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function formatInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const html = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${formatInlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      return;
    }

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushParagraph();
      const level = Math.min(trimmed.match(/^#+/)[0].length, 3);
      const text = trimmed.replace(/^#{1,3}\s+/, '');
      html.push(`<h${level}>${formatInlineMarkdown(text)}</h${level}>`);
      return;
    }

    if (/^---$/.test(trimmed)) {
      flushParagraph();
      html.push('<hr />');
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  return html.join('');
}

const storyArticle = document.querySelector('[data-story-source]');
const readingTimeEl = document.querySelector('[data-reading-time]');

if (storyArticle && readingTimeEl) {
  const source = storyArticle.dataset.storySource;

  fetch(source)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load story source: ${response.status}`);
      }
      return response.text();
    })
    .then((markdown) => {
      storyArticle.innerHTML = renderMarkdown(markdown);
      const words = markdown.trim().split(/\s+/).filter(Boolean).length;
      const minutes = Math.max(2, Math.ceil(words / 170));
      readingTimeEl.textContent = `${minutes} minute${minutes === 1 ? '' : 's'}`;
    })
    .catch(() => {
      storyArticle.innerHTML = '<p>The story is being prepared for reading.</p>';
    });
}
