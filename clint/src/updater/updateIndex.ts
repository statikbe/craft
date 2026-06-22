import * as fs from 'fs';
import * as path from 'path';
import colors from 'colors';
import { ManifestUpdate } from './updateChecker';

/**
 * Generates clint/updates/index.json from the update folders on disk. Authoritative ordering
 * (`seq`) is assigned here over a (date, id) sort so it never depends on the version string and
 * is regenerated wholesale on every run (immune to a hand-reordered JSON array).
 *
 * Run from clint/ (cwd). On statikbe/craft this is wired into a CI action that fails the PR on any
 * validation error below. Never hand-edit index.json.
 */
export class UpdateIndex {
  private static UPDATES_DIR = './updates';

  public static generate(): void {
    const dir = this.UPDATES_DIR;
    if (!fs.existsSync(dir)) {
      console.log(colors.red(`❌ No updates directory at ${dir}`));
      process.exit(1);
    }

    const folders = fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const errors: string[] = [];
    const updates: ManifestUpdate[] = [];

    for (const id of folders) {
      const folderPath = path.join(dir, id);
      const updateJsonPath = path.join(folderPath, 'update.json');
      const changelogPath = path.join(folderPath, 'CHANGELOG.md');

      if (!fs.existsSync(updateJsonPath)) {
        errors.push(`${id}: missing update.json`);
        continue;
      }
      if (!fs.existsSync(changelogPath)) {
        errors.push(`${id}: missing CHANGELOG.md`);
      }

      let uj: any = {};
      try {
        uj = JSON.parse(fs.readFileSync(updateJsonPath, 'utf8'));
      } catch (err: any) {
        errors.push(`${id}: update.json is not valid JSON (${err?.message ?? err})`);
        continue;
      }

      if (uj.id && uj.id !== id) {
        errors.push(`${id}: update.json "id" (${uj.id}) does not match the folder name`);
      }

      const changelog = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
      const isLegacySemver = /^\d+\.\d+\.\d+$/.test(id);

      updates.push({
        id,
        seq: 0, // assigned after sort
        title: uj.title || uj.description || this.titleFromChangelog(changelog) || id,
        date: uj.date || this.dateFromChangelog(changelog) || '',
        issues: uj.issues || [],
        pr: uj.pr ?? null,
        requires: uj.requires || [],
        legacyVersion: uj.legacyVersion ?? (isLegacySemver ? id : null),
        hasOps: !!(uj.frontend || uj.root),
      });
    }

    if (errors.length > 0) {
      console.log(colors.red('❌ index generation failed:'));
      errors.forEach((e) => console.log('  • ' + e));
      process.exit(1);
    }

    updates.sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id));
    updates.forEach((u, i) => (u.seq = i + 1));

    const manifest = {
      schema: 1,
      generatedAt: new Date().toISOString(),
      updates,
    };

    const outPath = path.join(dir, 'index.json');
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    console.log(colors.green(`✅ Wrote ${outPath} with ${updates.length} update(s).`));
    updates.forEach((u) => console.log(`  ${String(u.seq).padStart(3)}  ${u.id}  —  ${u.title}`));
  }

  private static titleFromChangelog(md: string): string | null {
    const m = md.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : null;
  }

  private static dateFromChangelog(md: string): string | null {
    const m = md.match(/Release date:\**\s*(\d{4}-\d{2}-\d{2})/i);
    return m ? m[1] : null;
  }
}
