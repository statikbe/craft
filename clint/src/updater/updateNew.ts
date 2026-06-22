import * as fs from 'fs';
import * as path from 'path';
import colors from 'colors';

/**
 * Scaffolds a new update folder `clint/updates/<YYYYMMDD>-<kebab-title>/` with a metadata-filled
 * update.json and a CHANGELOG.md template. Folder name == id. Run from clint/ (cwd).
 */
export class UpdateNew {
  public static scaffold(title: string): void {
    if (!title || !title.trim()) {
      console.log(colors.red('❌ Usage: clint update:new "<title>"'));
      process.exit(1);
    }
    const now = new Date();
    const dateStamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const dateIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;
    const slug = this.kebab(title);
    const id = `${dateStamp}-${slug}`;
    const folder = path.join('./updates', id);

    if (fs.existsSync(folder)) {
      console.log(colors.red(`❌ ${folder} already exists.`));
      process.exit(1);
    }
    fs.mkdirSync(folder, { recursive: true });

    const updateJson = {
      id,
      title: title.trim(),
      description: '',
      date: dateIso,
      issues: [],
      pr: null,
      requires: [],
      // Add a "frontend" and/or "root" block to make file changes. Omit both for a record-only update.
      // findAndReplace `from` must match ONLY the pre-state so a re-run is a no-op, e.g.:
      //   "findAndReplace": [{ "files": ["../templates/**/*.twig"], "from": "/old-class/g", "to": "new-class" }]
    };

    fs.writeFileSync(path.join(folder, 'update.json'), JSON.stringify(updateJson, null, 2) + '\n', 'utf8');
    fs.writeFileSync(
      path.join(folder, 'CHANGELOG.md'),
      `# ${title.trim()}\n\n**Release date:** ${dateIso}\n\n## Summary\n\nDescribe what this update changes.\n\n## Highlights\n\n- \n\n## Docs\n\n`,
      'utf8'
    );

    console.log(colors.green(`✅ Created ${folder}`));
    console.log('Next:');
    console.log('  1. Fill in update.json (description, issues/pr, and frontend/root operations if any).');
    console.log('  2. Write CHANGELOG.md.');
    console.log('  3. Do NOT edit index.json — CI regenerates it on merge.');
  }

  private static kebab(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }
}
