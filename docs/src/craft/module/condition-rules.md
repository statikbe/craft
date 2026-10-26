# Condition rules

## Page section

A condition rule for field layouts of **nested entry types** (entry types used in a Matrix field only, such as a content row
cell): it matches on the section of the page the entry is on. Use it to show a field only where it makes sense, e.g. the
Overview column's Related news only on news items.

### How it works

- The rule walks up the owners of the entry (cell → row → content builder → page, at most 5 levels) to the first entry that
  is in a section: that's the page. It matches when the page's section is one of the chosen sections.
- A nested entry that isn't on a page yet (a new entry, not saved) has no section and only matches a "not" condition.
- It's a multi-select of all sections, stored by UID, so renaming a section doesn't break the condition.

### Where it's offered

Only in the field conditions of an entry type that no section uses. In the field layout designer: a field's settings →
*Current entry condition* → *Page section*. It isn't offered elsewhere (entry sources, relation field conditions) because it
doesn't filter element queries: it can only check an entry that's already loaded.

### Example

The Overview column's Config Values field `relatedNews` (Related news) has these conditions:

| Rule                     | Operator  | Value       |
| ------------------------ | --------- | ----------- |
| Overview options         | is one of | News        |
| Dynamically fill         | is        | on          |
| Page section             | is one of | News items  |

So editors only see Related news on an Overview column of news, filled dynamically, on a news item.

## Source

- `modules/statik/src/conditions/PageSectionConditionRule.php`
- `modules/statik/src/Statik.php` (registers it for nested entry types only)
