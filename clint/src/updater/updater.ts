import ora from 'ora';
import colors from 'colors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { UpdateChecker, Manifest, ManifestUpdate } from './updateChecker';
import { GitActions } from './git';
import { AppliedState } from './appliedState';
import process from 'process';
import path from 'path';
import fs from 'fs';
import prompts from 'prompts';
import { replaceInFile } from 'replace-in-file';
import { Helper } from '../libs/helpers';
import { marked } from 'marked';
import mustache from 'mustache';
import open, { apps } from 'open';

export class Updater {
  private updateCli;
  private updateFrontend;
  private config;
  private cliVersion: string = 'clint';

  constructor(updateCli, updateFrontend) {
    this.updateCli = updateCli;
    this.updateFrontend = updateFrontend;
  }

  public runUpdates() {
    GitActions.hasLocalChanges().then((hasChanges) => {
      if (hasChanges) {
        console.log(colors.red('❌ You have local changes, please commit or stash them before updating.'));
        process.exit(1);
      } else {
        this.performUpdates();
      }
    });
  }

  private performUpdates() {
    this.config = UpdateChecker.getConfig();
    try {
      const cliPkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), this.config.cli.packagePath), 'utf8'));
      this.cliVersion = `clint@${cliPkg.version}`;
    } catch {
      // non-fatal
    }

    if (this.updateCli && this.updateCli.update) {
      // CLI self-update stays semver-based and orthogonal to the frontend manifest.
      const spinner = ora.default('Updating CLI ...').start();
      const execAsync = promisify(exec);
      spinner.color = 'green';
      spinner.text = 'Downloading update ...';
      GitActions.getRemoteFiles(this.config.cli.updateRepo, this.config.cli.cliPath, '../' + this.config.cli.cliPath).then(
        async () => {
          spinner.succeed('CLI updated successfully!');
          spinner.stop();
          spinner.clear();
          spinner.start('Building CLI ...');
          await execAsync('cd ../clint && yarn install');
          await execAsync('cd ../clint && yarn build');
          spinner.succeed('CLI built successfully!');
          spinner.stop();
          spinner.clear();
          if (this.updateFrontend && this.updateFrontend.update) {
            console.log(
              colors.yellow('⚠️ CLI updated successfully! Please restart the CLI to apply the frontend updates.')
            );
          } else {
            console.log(colors.green('✅ The CLI is now up to date!'));
          }
          process.exit(0);
        }
      );
    } else if (this.updateFrontend && this.updateFrontend.update) {
      this.runFrontendUpdates().catch((err) => {
        console.log(colors.red(`❌ Update failed: ${err?.message ?? err}`));
        process.exit(1);
      });
    }
  }

  private async runFrontendUpdates(): Promise<void> {
    const repo = this.config.frontend.updateRepo;
    const ref = this.config.frontend.updateRef || 'master';
    const updatePath = this.config.frontend.updatePath; // e.g. clint/updates

    const appliedState = new AppliedState();
    if (!appliedState.acquireLock()) {
      console.log(
        colors.red(
          '❌ Another clint update appears to be running (lock present). If that is wrong, remove the stale lock file and retry.'
        )
      );
      process.exit(1);
    }

    try {
      // Pin to one immutable SHA and read the manifest AT that SHA (not the raw-master URL),
      // so the manifest and the per-update file content can never skew mid-run.
      const sha = await GitActions.resolvePinnedSha(repo, ref);
      const { manifest, tmpDir } = await GitActions.getManifest(repo, sha, `${updatePath}/index.json`);

      try {
        // ---- resolve the applied set (migrate / reconcile if the log is absent) ----
        let applied = appliedState.read();
        if (applied === null) {
          const gitHead = appliedState.readFromGitHead();
          const bootstrapped = appliedState.getBootstrappedFromVersion();
          if (gitHead) {
            applied = gitHead;
            appliedState.writeSet(gitHead);
            console.log(
              colors.yellow('⚠️ Restored the applied-update log from git history. Review and commit it after this run.')
            );
          } else if (bootstrapped) {
            console.log(
              colors.red(
                `❌ The applied-update log is missing but this project was bootstrapped from ${bootstrapped}. ` +
                  `Restore it (e.g. "git checkout -- frontend/.clint-applied") and re-run — refusing to re-migrate blindly.`
              )
            );
            process.exit(1);
          } else {
            applied = await this.runMigration(manifest, appliedState);
          }
        }

        // ---- compute + order the pending set ----
        let pending = manifest.updates
          .filter((u) => !applied!.has(u.id))
          .sort((a, b) => a.seq - b.seq || (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id));

        if (pending.length === 0) {
          console.log(colors.green('✅ The frontend is already up to date!'));
          return;
        }

        // ---- folder/manifest drift on the pinned ref ----
        const folders = await GitActions.listTreeDir(tmpDir, sha, updatePath);
        const folderSet = new Set(folders.filter((f) => f !== 'index.json'));
        const manifestIds = new Set(manifest.updates.map((u) => u.id));
        for (const f of folderSet) {
          if (!manifestIds.has(f)) {
            console.log(colors.yellow(`⚠️ Folder "${f}" exists in the repo but is not in the manifest — ignoring it.`));
          }
        }
        const missingFolder = pending.filter((u) => !folderSet.has(u.id));
        if (missingFolder.length > 0) {
          console.log(
            colors.yellow(
              `⚠️ These pending updates have no folder at ${sha.slice(0, 8)}: ${missingFolder
                .map((u) => u.id)
                .join(', ')}`
            )
          );
          const cont = await prompts({
            type: 'select',
            name: 'value',
            message: 'How do you want to proceed?',
            choices: [
              { title: 'Skip the missing ones and continue', value: 'skip' },
              { title: 'Abort', value: 'abort' },
            ],
            initial: 0,
          });
          if (cont.value !== 'skip') {
            console.log('Aborting.');
            return;
          }
          const missingIds = new Set(missingFolder.map((u) => u.id));
          pending = pending.filter((u) => !missingIds.has(u.id));
          if (pending.length === 0) {
            console.log('Nothing left to apply.');
            return;
          }
        }

        // ---- no-gap prefix picker ----
        const pickChoices = [
          { title: `Apply all ${pending.length} pending update${pending.length === 1 ? '' : 's'}`, value: pending.length },
          ...pending.map((u, i) => ({ title: `Apply up to: ${u.title} (${u.id})`, value: i + 1 })),
        ];
        const pick = await prompts({
          type: 'select',
          name: 'value',
          message: 'Which updates do you want to apply? (always a no-gap prefix, in apply order)',
          choices: pickChoices,
          initial: 0,
        });
        if (pick.value === undefined) {
          console.log('Aborting.');
          return;
        }
        const selected = pending.slice(0, pick.value as number);

        // ---- requires validation over the selected batch ----
        const appliedOrEarlier = new Set(applied!);
        for (const u of selected) {
          const reqs = u.requires || [];
          const missing = reqs.filter((r) => !appliedOrEarlier.has(r));
          if (missing.length > 0) {
            console.log(
              colors.red(
                `❌ Update "${u.id}" requires ${missing.join(', ')}, which is neither applied nor included earlier in this batch. Aborting.`
              )
            );
            return;
          }
          appliedOrEarlier.add(u.id);
        }

        // ---- fetch only the selected update folders into the same pinned checkout ----
        await GitActions.addSparsePaths(
          tmpDir,
          selected.map((u) => `${updatePath}/${u.id}`),
          sha
        );

        console.log(
          colors.green(`\n🚀 Applying ${selected.length} update${selected.length === 1 ? '' : 's'} in order: ${selected.map((u) => u.id).join(' -> ')}\n`)
        );

        // ---- apply loop: each update is a transaction, recorded on success ----
        const recorded: ManifestUpdate[] = [];
        for (const u of selected) {
          const updateJsonPath = path.join(tmpDir, ...updatePath.split('/'), u.id, 'update.json');
          let updateJson: any = {};
          try {
            if (fs.existsSync(updateJsonPath)) {
              updateJson = JSON.parse(fs.readFileSync(updateJsonPath, 'utf8'));
            }
            await this.applyFrontendUpdate(u, updateJson, sha);
            appliedState.append(u.id, u.seq, this.cliVersion);
            recorded.push(u);
          } catch (err: any) {
            console.log(colors.red(`\n❌ Update "${u.id}" failed: ${err?.message ?? err}`));
            await this.restoreTargets(updateJson);
            console.log(
              colors.yellow(
                `Stopped. ${recorded.length} update(s) applied and recorded. The failed update's files were restored; re-run to resume from "${u.id}".`
              )
            );
            break;
          }
        }

        if (recorded.length > 0) {
          this.showChangelog(recorded, tmpDir, updatePath);
          console.log(colors.yellow('\n⚠️ Rebuild the frontend and retest the site!'));
        }
      } finally {
        await GitActions.cleanup(tmpDir);
      }
    } finally {
      appliedState.releaseLock();
    }
  }

  private async applyFrontendUpdate(update: ManifestUpdate, updateJson: any, sha: string): Promise<void> {
    console.log('\n----------------------------------------------------');
    console.log(`🛠️  ${update.title || update.id}`);
    if (updateJson.description) console.log(updateJson.description);
    console.log('----------------------------------------------------');

    let touched = false;

    if (updateJson.frontend) {
      console.log('🎨 Updating frontend ...');
      const frontendExcludeFromSync = this.config.frontend.frontendExcludeFromSync
        ? this.config.frontend.frontendExcludeFromSync.map((item) =>
            item.startsWith('/') && item.endsWith('/') ? new RegExp(item.slice(1, -1)) : item
          )
        : [];
      const syncOptions: any = { exclude: frontendExcludeFromSync, ref: sha };
      if (updateJson.frontend.modify) {
        syncOptions.forceSync = updateJson.frontend.modify;
      }
      await GitActions.getRemoteFiles(
        this.config.frontend.updateRepo,
        this.config.frontend.frontendPath,
        '../' + this.config.frontend.frontendPath,
        syncOptions
      );

      if (updateJson.frontend.findAndReplace) {
        const spinner = ora.default({ text: 'Applying find and replace operations ...' }).start();
        await this.findAndReplaceInFile(updateJson.frontend.findAndReplace);
        spinner.succeed('🔍 Find and replace operations applied successfully!');
      }
      console.log(colors.green('✅ Frontend updated successfully!'));
      touched = true;
    }

    if (updateJson.root) {
      console.log('🌳 Updating root files ...');
      if (updateJson.root.modify) {
        await GitActions.getRemoteFiles(this.config.frontend.updateRepo, '', '', {
          exclude: [/.*/],
          forceSync: updateJson.root.modify,
          ref: sha,
        });
        console.log(colors.green('✅ Root files updated successfully!'));
      }
      if (updateJson.root.findAndReplace) {
        const spinner = ora.default({ text: 'Applying find and replace operations ...' }).start();
        await this.findAndReplaceInFile(updateJson.root.findAndReplace);
        spinner.succeed('🔍 Find and replace operations applied successfully!');
      }
      touched = true;
    }

    if (!touched) {
      // Record-only update (no file operations) — the historical norm. Just record it.
      console.log('ℹ️  Record-only update (no file changes).');
    }
  }

  /** Scoped restore of an update's declared targets after a failure — never a blanket checkout. */
  private async restoreTargets(updateJson: any): Promise<void> {
    const execAsync = promisify(exec);
    const targets = new Set<string>();
    const add = (p: string, prefix: string) => targets.add(`${prefix}${p}`);

    if (updateJson.frontend) {
      (updateJson.frontend.modify || []).forEach((p: string) => add(p, '../' + this.config.frontend.frontendPath + '/'));
      (updateJson.frontend.findAndReplace || []).forEach((r: any) => (r.files || []).forEach((f: string) => targets.add(f)));
    }
    if (updateJson.root) {
      (updateJson.root.modify || []).forEach((p: string) => add(p, '../'));
      (updateJson.root.findAndReplace || []).forEach((r: any) => (r.files || []).forEach((f: string) => targets.add(f)));
    }

    for (const t of targets) {
      try {
        await execAsync(`git checkout -- "${t}"`);
      } catch {
        // best-effort; some targets may be globs or new files git can't restore
      }
    }
  }

  /**
   * Applies find/replace rules.
   *  - `from` of the form `/pattern/g` becomes a global RegExp; anything else is a literal string.
   *    (Plain-string replace is FIRST-occurrence only; use `/.../g` for all occurrences.)
   *  - `allowEmptyPaths` is intentionally NOT set, so a rule whose target files do not exist fails
   *    loudly and blocks recording, rather than silently succeeding.
   * Authors must write `from` so it matches only the pre-state, making a re-run a no-op.
   */
  private findAndReplaceInFile(options: any[]) {
    const prepared = options.map((item) => {
      const copy = { ...item };
      if (typeof copy.from === 'string' && copy.from.startsWith('/') && copy.from.endsWith('/g')) {
        copy.from = new RegExp(copy.from.slice(1, -2), 'g');
      }
      return copy;
    });
    return Promise.all(prepared.map((replacement) => replaceInFile(replacement)));
  }

  private async runMigration(manifest: Manifest, appliedState: AppliedState): Promise<Set<string>> {
    console.log(colors.yellow('\n🧭 No applied-update log found — running one-time migration from the legacy version.'));

    const pkgPath = path.resolve(process.cwd(), this.config.frontend.packagePath);
    if (!fs.existsSync(pkgPath)) {
      console.log(colors.red(`❌ Cannot locate ${this.config.frontend.packagePath} to read the legacy version. Aborting migration.`));
      process.exit(1);
    }
    let legacyVersion = '';
    try {
      legacyVersion = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
    } catch {
      // handled below
    }
    if (!legacyVersion) {
      console.log(colors.red('❌ No legacy version found in frontend package.json. Aborting (refusing to seed an empty set).'));
      process.exit(1);
    }

    const seed = manifest.updates.filter(
      (u) => u.legacyVersion != null && this.semverLte(u.legacyVersion, legacyVersion)
    );

    console.log(`\nThis project reports legacy version ${colors.green(legacyVersion)}.`);
    console.log('The following updates will be marked as already applied (no files will change):');
    seed.forEach((u) => console.log(`  • ${u.id} — ${u.title}`));
    console.log(
      colors.yellow(
        '\n⚠️ This trusts frontend/package.json "version" as ground truth for what code is already present. If that field was ever hand-edited, this seed will be wrong.'
      )
    );

    const confirm = await prompts({
      type: 'select',
      name: 'value',
      message: 'Seed the applied-update log with the above?',
      choices: [
        { title: 'Yes, seed and continue', value: 'yes' },
        { title: 'No, abort', value: 'no' },
      ],
      initial: 0,
    });
    if (confirm.value !== 'yes') {
      console.log('Aborting migration.');
      process.exit(0);
    }

    const ids = seed.map((u) => u.id);
    appliedState.writeSet(ids);
    appliedState.setBootstrappedFromVersion(legacyVersion);
    seed.forEach((u) => appliedState.append(u.id, u.seq, 'migrated'));
    console.log(
      colors.green(`\n✅ Seeded ${ids.length} update(s). Commit "${this.config.frontend.appliedStatePath}" before continuing in a shared project.`)
    );
    return new Set(ids);
  }

  private semverLte(a: string, b: string): boolean {
    const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
    const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const x = pa[i] || 0;
      const y = pb[i] || 0;
      if (x < y) return true;
      if (x > y) return false;
    }
    return true; // equal
  }

  private showChangelog(updates: ManifestUpdate[], tmpDir: string, updatePath: string) {
    const versions = [];
    updates.forEach((u) => {
      const changelog = this.getChangelogForId(u.id, tmpDir, updatePath);
      if (changelog) {
        versions.push({ version: u.title || u.id, id: u.id.replace(/[^a-zA-Z0-9]/g, '-'), changelog });
      }
    });
    if (versions.length === 0) return;

    console.log('\n📜 Showing changelog:\n');
    const now = new Date();
    const fileName = `changelog-${now.getTime()}.html`;
    const filePath = `./public/tmp/${fileName}`;
    if (!fs.existsSync('./public/tmp')) {
      fs.mkdirSync('./public/tmp', { recursive: true });
    }
    Helper.clearDirectory('./public/tmp');

    const manifestAssets = Helper.getFrontendManifest();
    const template = fs.readFileSync('./templates/changelog.html', 'utf8');
    const body = mustache.render(template, { manifest: manifestAssets, versions });

    fs.writeFile(filePath, body, (err: any) => {
      if (err) throw err;
      const fullPath = path.resolve(process.cwd(), filePath);
      open.default(`file://${fullPath}`, {
        app: { name: apps.chrome, arguments: ['--allow-file-access-from-files'] },
      });
    });
  }

  private getChangelogForId(id: string, tmpDir: string, updatePath: string) {
    const changelogPath = path.join(tmpDir, ...updatePath.split('/'), id, 'CHANGELOG.md');
    if (!fs.existsSync(changelogPath)) {
      return null;
    }
    return marked.parse(fs.readFileSync(changelogPath, 'utf8'));
  }
}
