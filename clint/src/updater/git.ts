import { UpdateChecker } from './updateChecker';

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class GitActions {
  constructor() {}

  public static async pullLatestChanges(): Promise<void> {
    const config = UpdateChecker.getConfig();
    return this.getRemoteFiles(config.cli.updateRepo, config.cli.updatePath, '../' + config.cli.updatePath);
  }

  public static async getRemoteFiles(repo, remotePath, localPath): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const execAsync = promisify(exec);
      const fsp = fs.promises;

      const sparsePath = remotePath;
      const targetDir = path.resolve(process.cwd(), localPath);

      async function copyDir(src: string, dest: string) {
        await fsp.mkdir(dest, { recursive: true });
        const entries = await fsp.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
          } else if (entry.isSymbolicLink()) {
            const link = await fsp.readlink(srcPath);
            try {
              await fsp.symlink(link, destPath);
            } catch {
              /* ignore */
            }
          } else {
            await fsp.copyFile(srcPath, destPath);
          }
        }
      }

      const tmpBase = os.tmpdir();
      const tmpPrefix = 'a11y-sparse-';
      const tmpDir = await fsp.mkdtemp(path.join(tmpBase, tmpPrefix));

      try {
        // clone without checkout and without blobs, then do sparse checkout of the folder we need
        await execAsync(`git clone --filter=blob:none --no-checkout ${repo} "${tmpDir}"`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout init --cone`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout set ${sparsePath}`);
        await execAsync(`git -C "${tmpDir}" checkout`);

        const srcFolder = path.join(tmpDir, ...sparsePath.split('/'));
        // remove existing target if present, then copy new files
        await fsp.rm(targetDir, { recursive: true, force: true });
        await copyDir(srcFolder, targetDir);
      } catch (err) {
        throw new Error(`Failed to pull updates from ${repo}: ${err && err.message ? err.message : err}`);
      } finally {
        // best-effort cleanup
        try {
          await fsp.rm(tmpDir, { recursive: true, force: true });
        } catch (err) {
          throw new Error(`Failed to remove ${tmpDir}: ${err && err.message ? err.message : err}`);
        }
      }
      resolve();
    });
  }
}
