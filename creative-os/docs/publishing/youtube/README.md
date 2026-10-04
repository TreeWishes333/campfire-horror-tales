# YouTube Publishing System

**Version:** 1.0
**Status:** Draft
**Last Updated:** 2026-09-20
**Owner:** Tree Wishes Publishing

---

## Purpose

This system turns approved Campfire Horror Tales material and properly sourced Québec research into reviewable YouTube packages. YouTube and Instagram are discovery channels; CampfireHorrorTales.com remains the owned destination for published stories.

This is a Markdown-first planning system. It does not upload videos, connect external APIs, or replace editorial approval.

## Content Categories

| Category | Editorial rule | Attribution rule |
| --- | --- | --- |
| Original Campfire Horror Tales | Identify as original fiction by Dawn Hill. Never imply it is a true account. | Credit original artwork and licensed assets. |
| Québec Ghost Stories | Present documented accounts, local reports, and paranormal claims with careful attribution. | Name the source; distinguish reported events from confirmed fact. |
| Québec Dark Folklore | Present legend, oral tradition, and historical context without treating folklore as verified history. | Preserve sources and avoid broad cultural attribution without a specific source. |

## Content Architecture

Existing story manuscripts remain where they are. The static website and PDF generator currently reference individual pages and assets directly, so `metadata.json` is an additive convention for new, folder-based original stories; it is not yet consumed by the website or PDF script.

```text
assets/stories/
  future-story/
    manuscript.md
    metadata.json
    images/
    video/
    translations/

creative-os/docs/
  research/ghost-stories/            # Source-backed Instagram and research entries
  research/folklore/                 # Source-backed Folklore Friday entries
  publishing/youtube/
    templates/
    workflows/
    drafts/
```

Use the manuscript as the creative source for original fiction. For research-based posts, use the research entry and its citations as the source of truth. Do not migrate legacy stories merely to fit this layout.

## Publishing Outputs

One approved subject can produce a coordinated package:

```text
Manuscript or sourced research entry
  -> website destination or research reference
  -> Instagram caption and artwork
  -> Reel / short-form visual plan
  -> YouTube Short
  -> narrated long-form video
  -> PDF or audio edition when applicable
  -> publishing checklist and archive
```

Each output remains its own reviewed draft. A shorter video may adapt an approved source, but it must not add historical details, witnesses, photographs, or claims that are not supported by that source.

## Workflow Overview

1. Classify the subject and identify its source of truth.
2. Create a short or long-form draft from the applicable template.
3. Confirm narration, claims, location, visual credits, and website destination.
4. Prepare visuals, voice, sound, thumbnail, description, and tags.
5. Perform the editorial review described in the YouTube workflow.
6. Publish manually only after approval, then record the public URL and outcome in the draft.

See [the YouTube story workflow](workflows/youtube-story-workflow.md), [the Short template](templates/youtube-short.md), and [the long-form template](templates/youtube-video.md).
