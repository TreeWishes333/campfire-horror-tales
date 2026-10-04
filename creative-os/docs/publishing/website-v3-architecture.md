# Website V3 Architecture

**Version:** 3.0
**Status:** Draft
**Last Updated:** 2026-09-20
**Owner:** Tree Wishes Publishing

---

## Language Routes

English remains at the existing root URLs, preserving published links. French uses a parallel `/fr/` directory:

```text
/index.html                         English home
/fr/index.html                      French home
/the-old-woman-in-the-mirror.html   English story
/fr/the-old-woman-in-the-mirror.html French story when approved
```

This keeps each language easy to find, works on a static host, and avoids changing existing URLs. The language control is generated from each page's `data-language-path`. When a French story does not yet exist, that control intentionally leads to `/fr/stories.html` rather than a false translation.

## Behind the Fire

Behind the Fire has no public index or navigation item. Source entries live in `assets/behind-the-fire/`; each entry has a matching static reader page that loads its Markdown via `data-behind-fire-source` and is linked only from its related story page.

To add an entry:

1. Copy `assets/behind-the-fire/the-old-woman-in-the-mirror.md` and complete its front matter and sections.
2. Create a matching reader page from `behind-the-fire-the-old-woman-in-the-mirror.html`, updating its title, description, heading, and Markdown path.
3. Add a Behind the Fire link to the related story page and a reciprocal link back to that story.
4. Confirm that the entry distinguishes inspiration from original fiction and credits any source or image.

Existing entries are intentionally independent of story publication. An entry may be marked `pending-author-review` while its approved source notes are safely organized. Do not add unreviewed autobiographical detail or imply that fictional supernatural events occurred.

## Original Story Publication

Every published English story needs an approved canonical Markdown manuscript before it receives a public story page, library card, or PDF. Store new stories in a dedicated folder:

```text
assets/stories/story-slug/
  manuscript.md
  metadata.json
  images/
  translations/
```

Use the same slug for the story page, PDF output, and any Behind the Fire relationship. Preserve legacy flat manuscripts; migrate them only as part of a separately approved maintenance task. Add the story to `scripts/generate-pdfs.js` only after the manuscript page is live and renders successfully.

## Discovery Channels

The YouTube channel URL and Instagram URL are configured only in `scripts/site-config.js`. The Follow page reads these values through `data-youtube-channel-link` and `data-instagram-link` hooks, keeping destination URLs out of individual story pages.

To add another discovery channel later, add its URL to `scripts/site-config.js`, add one `data-...-link` hook in the Follow page, and handle that hook in `scripts/main.js`. Keep story pages uncluttered and use the Follow page as the central destination.
