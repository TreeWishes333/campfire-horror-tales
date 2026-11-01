# Translation Publishing

English manuscripts are the canonical creative source. French is a reviewed publication layer for readers; it does not replace or duplicate the English master.

For a folder-based story, place an approved translation at:

```text
assets/stories/story-name/
  manuscript.md
  metadata.json
  images/
  translations/
    fr/
      manuscript.md
```

Keep shared artwork and story-level metadata at the story root. Add French-only notes only when they are genuinely needed, such as a translator credit or translation-review status.

The current public route pattern is `/fr/story-name.html`. Create that page only after the French manuscript has been reviewed. Until then, the English story's language control routes to the French story library rather than an incomplete translation.

For legacy flat manuscripts, do not move the English file merely to add French. Create the translation directory when the story is ready for folder-based publishing, then update its French page to read the approved French manuscript.

See [the French translation style guide](french-translation-style-guide.md) and [the V3 website architecture](../website-v3-architecture.md).

