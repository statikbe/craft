import { UpdateChecker } from './updateChecker';

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

  public static async pullLatestChanges(): Promise<void> {
    const config = UpdateChecker.getConfig();
    return this.getRemoteFiles(config.cli.updateRepo, config.cli.updatePath, '../' + config.cli.updatePath);
  }

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

  public static async getRemoteFiles(repo, remotePath, localPath): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const execAsync = promisify(exec);
      const fsp = fs.promises;
      const sparsePath = remotePath;
      const targetDir = path.resolve(process.cwd(), localPath);
      const tmpBase = os.tmpdir();
      const tmpPrefix = 'clint-sparse-';
      const tmpDir = await fsp.mkdtemp(path.join(tmpBase, tmpPrefix));

      try {
        const spinner = ora.default({ text: 'Getting remote files...', spinner: 'binary' }).start();
        // clone without checkout and without blobs, then do sparse checkout of the folder we need
        await execAsync(`git clone --filter=blob:none --no-checkout ${repo} "${tmpDir}"`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout init --cone`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout set ${sparsePath}`);
        await execAsync(`git -C "${tmpDir}" checkout`);

        spinner.succeed('Remote files downloaded');
        spinner.stop();
        spinner.clear();
        spinner.start('Syncing files...');
        const srcFolder = path.join(tmpDir, ...sparsePath.split('/'));
        // remove existing target if present, then copy new files
        // await fsp.rm(targetDir, { recursive: true, force: true });
        // await copyDir(srcFolder, targetDir);
        syncDirectory(srcFolder, targetDir, {
          exclude: [/node_modules/],
          afterEachSync({ eventType, nodeType, relativePath, srcPath, targetPath }) {
            spinner.text = `Syncing file(s)... ${relativePath}`;
          },
        });
        spinner.succeed('Files synced');
        spinner.stop();
        spinner.clear();
      } catch (err) {
        throw new Error(`Failed to pull updates from ${repo}: ${err && err.message ? err.message : err}`);
      } finally {
        // best-effort cleanup
        try {
          await fsp.rm(tmpDir, { recursive: true, force: true });
        } catch (err) {
          throw new Error(`Failed to remove ${tmpDir}: ${err && err.message ? err.message : err}`);
        }
        resolve();
      }
    });
  }
}
