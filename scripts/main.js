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

const languagePath = document.body.dataset.languagePath;
const headerInner = document.querySelector('.site-header__inner');

if (languagePath && headerInner) {
  const languageSwitcher = document.createElement('a');
  languageSwitcher.className = 'language-switcher';
  languageSwitcher.href = languagePath;
  languageSwitcher.setAttribute('hreflang', document.documentElement.lang === 'fr' ? 'en' : 'fr');
  languageSwitcher.setAttribute(
    'aria-label',
    document.documentElement.lang === 'fr' ? 'View this page in English' : 'Voir cette page en français'
  );
  languageSwitcher.innerHTML = document.documentElement.lang === 'fr'
    ? '<span>EN</span><span aria-hidden="true"> | </span><strong>FR</strong>'
    : '<strong>EN</strong><span aria-hidden="true"> | </span><span>FR</span>';
  headerInner.append(languageSwitcher);
}

function configureDiscoveryLinks(selector, url) {
  document.querySelectorAll(selector).forEach((link) => {
    if (url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.removeAttribute('aria-disabled');
    return;
  }

  link.removeAttribute('href');
  link.setAttribute('aria-disabled', 'true');
  link.classList.add('is-unavailable');
  const status = link.querySelector('[data-youtube-status]');
  if (status) status.textContent = 'Channel coming soon';
  });
}

configureDiscoveryLinks('[data-instagram-link]', window.CAMPFIRE_CONFIG?.instagramUrl);
configureDiscoveryLinks('[data-youtube-channel-link]', window.CAMPFIRE_CONFIG?.youtubeChannelUrl);

function formatInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function normalizeMarkdown(markdown) {
  return markdown
    .replace(/^#\s+Draft\s+\d+\s*$/gm, '')
    .replace(/^##\s+Story\s+\d+\s*$/gm, '')
    .replace(/^#\s+Campfire Horror Tales\s*$/gm, '')
    .replace(/^#\s+The Boy in the Bog\s*$/gm, '')
    .replace(/^#\s+Fleshy Findlay\s*$/gm, '')
    .replace(/^\*\*Status:\*\*.*$/gm, '')
    .replace(/^\*\*Version:\*\*.*$/gm, '')
    .replace(/^\*\*Notes:\*\*.*$/gm, '')
    .replace(/^\*\*(Series|Setting|Genre):\*\*.*$/gm, '')
    .replace(/^---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    // Remove a leading H1 (title) so the page's template headings are authoritative
    .replace(/^\s*#\s+[^\n]+\n/, '')
    .trim();
}

function renderMarkdown(markdown) {
  const lines = normalizeMarkdown(markdown).replace(/\r/g, '').split('\n');
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

const storyArticles = document.querySelectorAll('[data-story-source]');

storyArticles.forEach((storyArticle) => {
  const source = storyArticle.dataset.storySource;
  const readingTimeEl = storyArticle.closest('.story-read__content')?.querySelector('[data-reading-time]');

  fetch(source)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load story source: ${response.status}`);
      }
      return response.text();
    })
    .then((markdown) => {
      // Extract simple metadata from leading bolded lines (e.g. **Series:** ...)
      const metaContainer = storyArticle.closest('.story-read__content')?.querySelector('.story-metadata');
      if (metaContainer) {
        const meta = {};
        const metaRegex = /^\*\*(Series|Setting|Genre):\*\*\s*(.*)$/gim;
        let m;
        while ((m = metaRegex.exec(markdown))) {
          meta[m[1]] = m[2].trim();
        }

        if (Object.keys(meta).length) {
          const items = [];
          if (meta.Series) items.push(`<li><strong>Series:</strong> ${meta.Series}</li>`);
          if (meta.Setting) items.push(`<li><strong>Setting:</strong> ${meta.Setting}</li>`);
          if (meta.Genre) items.push(`<li><strong>Genre:</strong> ${meta.Genre}</li>`);
          metaContainer.innerHTML = `<ul class="story-meta-list">${items.join('')}</ul>`;
        }
      }

      const cleaned = normalizeMarkdown(markdown);

      if (!cleaned.trim()) {
        throw new Error('Story source is empty.');
      }

      storyArticle.innerHTML = renderMarkdown(cleaned);

      // Move the end-of-story link (if present) to follow the manuscript (helps when printing)
      const endLink = storyArticle.parentElement?.querySelector('.story-end');
      if (endLink) {
        storyArticle.after(endLink);
      }
    })
    .catch(() => {
      // Minimal fallback — avoid placeholder marketing copy on story pages
      storyArticle.innerHTML = '<p>Unable to load this story.</p>';
    });
});

const behindFireArticles = document.querySelectorAll('[data-behind-fire-source]');

behindFireArticles.forEach((article) => {
  fetch(article.dataset.behindFireSource)
    .then((response) => {
      if (!response.ok) throw new Error(`Unable to load Behind the Fire source: ${response.status}`);
      return response.text();
    })
    .then((markdown) => {
      const content = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
      article.innerHTML = renderMarkdown(content);
    })
    .catch(() => {
      article.innerHTML = '<p>This Behind the Fire entry is currently unavailable.</p>';
    });
});

const video = document.querySelector('.anthology-hero__video');
const ambience = document.querySelector('.anthology-ambience');
const soundButton = document.getElementById('audioToggle');

if (video && ambience && soundButton) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.pause();
  }

  const fadeTo = (target, duration) => {
    const start = ambience.volume;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      ambience.volume = start + (target - start) * progress;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  soundButton.addEventListener('click', () => {
    const soundIsOn = ambience.paused;

    if (soundIsOn) {
      ambience.volume = 0;
      ambience.play()
        .then(() => fadeTo(0.45, 2000))
        .catch(() => {});
    } else {
      fadeTo(0, 300);
      setTimeout(() => ambience.pause(), 320);
    }

    soundButton.textContent = soundIsOn
      ? 'Crackle: On'
      : 'Crackle: Off';

    soundButton.setAttribute('aria-pressed', String(soundIsOn));
    soundButton.setAttribute(
      'aria-label',
      soundIsOn
        ? 'Turn off campfire ambience'
        : 'Turn on campfire ambience'
    );
  });
}

// Print / Download PDF buttons on story pages (opens browser print dialog)
document.addEventListener('DOMContentLoaded', () => {
  const printButtons = document.querySelectorAll('.print-story');
  printButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      window.print();
    });
  });
});
