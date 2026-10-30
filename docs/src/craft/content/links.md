# Broken links

The [Link Checker](https://github.com/statikbe/craft-link-checker) plugin finds broken links in the content of the pages and
lists the pages that contain them in the **Broken links** dashboard widget. Its README explains every check and setting. This
page describes how the base install uses it.

## What it checks

It reads every link in the content: Link fields (the CTAs), CKEditor texts, and Hyper fields on older projects, also in the
content rows, the hero and other nested entries. Each link is stored with where it is, e.g. *Content builder 2 (Content row) ›
Columns 1 (Text) › Text*.

| Severity | Links |
| -------- | ----- |
| Broken   | to an entry that was deleted, is in the trash, disabled, expired, not in the page's site or has no page of its own (a nested entry); to a deleted asset; to a URL of the site that no longer exists |
| Warning  | to an entry that isn't published yet; to a URL that a redirect of SEO Fields sends on (link to the page itself); to an anchor (`#…`) that isn't on the target page; an invalid email address or phone number |

Links to entries are stored by ID, so renaming an entry or changing its slug doesn't break them. Whether a link is broken is
worked out when the widget is shown, so a deleted or disabled entry shows up straight away.

External links (to other websites) are found but not checked yet.

## The widget

Add **Broken links** to the dashboard. It lists the pages with broken links, with a link to edit each one and every broken
link with its reason and where it is. Each user only sees the pages in sections they may edit. Its settings: the number of
pages shown, and whether to also list the pages with only warnings.

## The base install's settings

`config/link-checker.php`:

| Setting         | Value                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| `sections`      | `'*'`: every section                                                        |
| `knownAnchors`  | `main`, `results`, `filterResults`: ids the templates render, so links to them are never reported as missing anchors. Add the ids a project's templates add |
| `internalHosts` | empty. On a project, add the production domain (`www.example.be`), so links to it count as links to the site on a local or staging install |

## Console

```bash
ddev craft link-checker/report             # the pages with broken links
ddev craft link-checker/report --warnings  # with the warnings
ddev craft link-checker/rebuild            # read every page again (--queue: as a queue job)
```

Installing the plugin queues a rebuild; on a project with a lot of content, run `rebuild` once after installing.

## Source

- `config/link-checker.php`
- [statikbe/craft-link-checker](https://github.com/statikbe/craft-link-checker)
