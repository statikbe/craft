# Demo site for the course videos

The videos and screenshots are recorded on a local install of this base install, filled with a fictional walking club,
**De Heidestappers**, and dressed in its own theme. Everything here is local only: never run it on staging or production,
and never commit the theme changes.

## Content

```bash
bash course/demo/run.sh               # create or update the demo content (idempotent)
bash course/demo/run.sh --cleanup     # first remove everything that isn't demo content (showcase, dummy entries, leftovers)
bash course/demo/run.sh --refresh     # write the base field values of the demo entries again
bash course/demo/run.sh --state=3.1   # put a page in the start state one video needs (see demo-content.php)
```

- `demo-content.php` builds the pages, news, events, team, partners, assets, menus and site settings; `cleanup.php`
  removes what isn't part of the demo. Both run inside DDEV from `storage/runtime/` (gitignored).
- `download-images.sh` downloads the photos (Unsplash) into `images/` and generates the maps, PDFs and logos; `run.sh`
  calls it when the images are missing. `upload/` holds files the videos upload during a take. Both folders and the
  check screenshots in `screens/` are gitignored.
- Take a snapshot first when in doubt: `ddev snapshot --name before-demo`.

The recordings log in with a local **Content Managers** account (never an admin), so the videos only show what a content
manager sees.

## Theme

```bash
course/demo/theme/apply.sh    # switch the demo theme on: colours and fonts (Wildgrond), logo, favicon; builds the frontend
course/demo/theme/revert.sh   # switch it off again and rebuild
```

`demo-theme.patch` holds the changes (with the fonts, hence its size); `files-tracked.txt` and `files-new.txt` list the
files it touches; `logo/` has the logo sources. `apply.sh` refuses to run when one of those files has other uncommitted
changes. Run the scripts directly (not with `sh`). The site must load the built files: `FRONTEND_DEV=false` in `.env`
(set it yourself; the scripts don't change `.env`).
