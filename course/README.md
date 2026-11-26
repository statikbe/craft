# Course: content management in Craft (Rectangle)

A series of short tutorial videos, each with a written guide, that walks clients through the control panel of a site built
on this base install. It was distilled from five live client trainings: the part that is the same on every site. The live
training then focuses on what is specific to a project. End goal: a step-by-step course on help.statik.be.

The texts are in Dutch. This folder isn't exported to new projects (`.gitattributes`).

## What's here

| Path | What |
|---|---|
| `INDEX.md` | Every video with its length, the word count of its guide and the number of open `[label?]` checks |
| `BRIEF.md` | Decisions, Rectangle facts and the format of the files. Read it before you change or add a video |
| `videos/<part>-<nr>-<slug>/script.md` | The video script: per scene a caption (`## n. …`), the voice-over (`Voice:`) and what happens on screen (`Screen:`). The screencast recorder reads the captions and voice lines from it |
| `videos/…/walkthrough.md` | The written guide for people who'd rather read: more detail, the why, FAQ from client questions, screenshot placeholders |
| `videos/…/transcript.md` | The voice-over as text, generated from `script.md` (don't edit by hand) |
| `videos/…/screenshots/` | Images used by the guide; placeholders name the file to capture |
| `tools/build-review.py` | Builds the review page (one view per video) from the files above |

The numbers in the folder names are a provisional order.

## Rules

- **Every video and guide stands on its own.** Never refer to "the next" or "the previous" video, and don't refer by number:
  the order and numbers will change. Refer to another topic by its title ("Meer daarover bij *Werken met een concept*").
- Write every text with The Kind Kids tone of voice skill (`the-kind-kids-tone-of-voice`). Dutch, jij-vorm, plain spoken language in `Voice:` lines (no abbreviations, symbols or parentheses). No company name;
  refer to the agency as "ons".
- Labels as they appear in the Dutch control panel, in bold. Mark a label you couldn't confirm with `[label?]`.
- Facts follow the base install: when the code or config changes (a field, a label, a plugin setting), update the videos
  and guides that mention it. `grep -rl "<label>" course/videos` finds them.

## When something changes

1. Edit `script.md` and/or `walkthrough.md`.
2. Regenerate the transcript: the title line, a blank line, then each `Voice:` text as a paragraph.
3. Rebuild the review page: `python3 course/tools/build-review.py /tmp/review.html`.
4. A changed script needs a new recording (making-screencasts skill); a changed guide may need new screenshots.
