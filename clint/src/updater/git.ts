import ora from 'ora';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import process from 'process';
import syncDirectory from 'sync-directory';

export class GitActions {
  constructor() {}

  public static async hasLocalChanges(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const execAsync = promisify(exec);
      try {
        const { stdout, stderr } = await execAsync('git status --porcelain');
        if (stderr) {
          reject(new Error(stderr));
        }
        if (stdout && stdout.length > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Resolve a ref (branch/tag) on a remote to one immutable commit SHA. Every fetch in a single
   * update run pins to this SHA so the manifest and the per-update file content can never come
   * from trees taken at different moments (the content-skew bug in the old getRemoteFiles).
   */
  public static async resolvePinnedSha(repo: string, ref: string = 'master'): Promise<string> {
    const execAsync = promisify(exec);
    const { stdout } = await execAsync(`git ls-remote ${repo} ${ref}`);
    const line = stdout.split(/\r?\n/).find((l) => l.trim().length > 0);
    if (!line) {
      throw new Error(`Could not resolve ref "${ref}" on ${repo}`);
    }
    return line.split(/\s+/)[0];
  }

  /** Blobless, no-checkout clone into a fresh temp dir with cone sparse-checkout initialised. */
  private static async prepareCheckout(repo: string): Promise<string> {
    const execAsync = promisify(exec);
    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'clint-sparse-'));
    await execAsync(`git clone --filter=blob:none --no-checkout ${repo} "${tmpDir}"`);
    await execAsync(`git -C "${tmpDir}" sparse-checkout init --cone`);
    return tmpDir;
  }

  /**
   * One pinned clone that materialises only `manifestPath`, then reads + parses it.
   * Leaves the clone open in `tmpDir` so the caller can add the pending update folders to the
   * SAME checkout via {@link addSparsePaths}. Caller must {@link cleanup} the tmpDir when done.
   */
  public static async getManifest(
    repo: string,
    sha: string,
    manifestPath: string
  ): Promise<{ manifest: any; tmpDir: string }> {
    const execAsync = promisify(exec);
    const tmpDir = await this.prepareCheckout(repo);
    const spinner = ora.default({ text: 'Fetching update manifest...', spinner: 'binary' }).start();
    try {
      await execAsync(`git -C "${tmpDir}" sparse-checkout set ${manifestPath}`);
      await execAsync(`git -C "${tmpDir}" checkout ${sha}`);
      const full = path.join(tmpDir, ...manifestPath.split('/'));
      if (!fs.existsSync(full)) {
        throw new Error(`Manifest ${manifestPath} not found at ${sha}`);
      }
      const manifest = JSON.parse(fs.readFileSync(full, 'utf8'));
      spinner.succeed('Manifest fetched');
      return { manifest, tmpDir };
    } catch (err: any) {
      spinner.fail('Failed to fetch manifest');
      await this.cleanup(tmpDir);
      throw new Error(`Failed to fetch manifest from ${repo}@${sha}: ${err?.message ?? err}`);
    }
  }

  /** Add more paths to an existing pinned checkout and materialise them. */
  public static async addSparsePaths(tmpDir: string, paths: string[], sha: string): Promise<void> {
    if (!paths.length) return;
    const execAsync = promisify(exec);
    const spinner = ora.default({ text: 'Fetching update files...', spinner: 'binary' }).start();
    try {
      await execAsync(`git -C "${tmpDir}" sparse-checkout add ${paths.map((p) => `"${p}"`).join(' ')}`);
      await execAsync(`git -C "${tmpDir}" checkout ${sha}`);
      spinner.succeed('Update files fetched');
    } catch (err: any) {
      spinner.fail('Failed to fetch update files');
      throw new Error(`Failed to fetch ${paths.join(', ')} from ${tmpDir}@${sha}: ${err?.message ?? err}`);
    }
  }

  /**
   * List the folder names directly under `dir` of an already-open pinned checkout (used for
   * folder/manifest drift detection). Reuses the manifest clone — no extra clone.
   */
  public static async listTreeDir(tmpDir: string, sha: string, dir: string): Promise<string[]> {
    const execAsync = promisify(exec);
    const { stdout } = await execAsync(`git -C "${tmpDir}" ls-tree --name-only ${sha} "${dir}/"`);
    return stdout
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
      .map((l) => l.replace(new RegExp(`^${dir}/`), '').replace(/\/$/, ''));
  }

  public static async cleanup(tmpDir: string): Promise<void> {
    try {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    } catch {
      // best-effort
    }
  }

  /**
   * Sync a folder of a remote repo into the local working tree. Pins to `syncOptions.ref` when
   * given so the synced content matches the run's manifest SHA. Used for the CLI self-update and
   * for syncing an update's declared frontend/root targets.
   */
  public static async getRemoteFiles(repo, remotePath, localPath, syncOptions: any = {}): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const execAsync = promisify(exec);
      const fsp = fs.promises;
      const { ref, ...syncDirOptions } = syncOptions;
      const sparsePath = remotePath;
      const targetDir = path.resolve(process.cwd(), localPath);
      const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'clint-sparse-'));

      try {
        const spinner = ora.default({ text: 'Getting remote files...', spinner: 'binary' }).start();
        await execAsync(`git clone --filter=blob:none --no-checkout ${repo} "${tmpDir}"`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout init --cone`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout set ${sparsePath}`);
        await execAsync(`git -C "${tmpDir}" checkout ${ref ? ref : ''}`.trim());

        spinner.succeed('Remote files downloaded');
        spinner.stop();
        spinner.clear();
        spinner.start('Syncing files...');
        const srcFolder = path.join(tmpDir, ...sparsePath.split('/'));
        syncDirectory(srcFolder, targetDir, {
          exclude: [/node_modules/],
          afterEachSync({ relativePath }) {
            spinner.text = `Syncing file(s)... ${relativePath}`;
          },
          ...syncDirOptions,
        });
        spinner.succeed('Files synced');
        spinner.stop();
        spinner.clear();
      } catch (err) {
        reject(new Error(`Failed to pull updates from ${repo}: ${err && err.message ? err.message : err}`));
        return;
      } finally {
        await this.cleanup(tmpDir);
      }
      resolve();
    });
  }
}
