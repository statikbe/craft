/**
 * Runs the Clint CLI, building it first if it isn't there.
 *
 * `clint/dist/` is a build artifact and is gitignored, so a fresh clone has no `dist/cli.js`.
 * The frontend scripts used to call `node ../clint/dist/cli.js` directly, which meant `yarn watch`
 * died with MODULE_NOT_FOUND before Vite ever started. Building it on demand fixes that once.
 *
 * This never blocks the dev server: a missing or broken Clint is a warning, not a failure, so the
 * update check can never stop you from working on the frontend. Usage:
 *
 *   node ensure-clint.js --checkupdates
 */
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const clintDir = path.resolve(here, '..', 'clint');
const cliPath = path.join(clintDir, 'dist', 'cli.js');

// yarn resolves to yarn.cmd on Windows, which needs a shell to be spawnable.
const useShell = process.platform === 'win32';

function run(args, label) {
  process.stdout.write(`⚙️  Clint: ${label} ...\n`);
  const result = spawnSync('yarn', args, { cwd: clintDir, stdio: 'inherit', shell: useShell });
  return result.status === 0;
}

function build() {
  if (!existsSync(clintDir)) {
    process.stdout.write(`⚠️  Clint: no ${clintDir} directory — skipping the update check.\n`);
    return false;
  }
  process.stdout.write('⚙️  Clint: first run, building the CLI (this happens once) ...\n');

  if (!existsSync(path.join(clintDir, 'node_modules')) && !run(['install'], 'installing dependencies')) {
    return false;
  }
  // Full build: the CLI bundle plus the assets its changelog view renders from.
  return run(['build'], 'building');
}

if (!existsSync(cliPath) && !build()) {
  process.stdout.write('⚠️  Clint: could not build the CLI, skipping the update check.\n');
  process.stdout.write('   Build it manually with: cd ../clint && yarn install && yarn build\n');
  process.exit(0); // Never block the frontend build or dev server on this.
}

const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], { stdio: 'inherit' });
if (result.status !== 0) {
  process.stdout.write('⚠️  Clint: the update check did not complete — continuing anyway.\n');
}
process.exit(0);
