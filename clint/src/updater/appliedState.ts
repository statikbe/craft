import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export interface AppliedMeta {
  schema: number;
  // Set once at migration so we can tell "genuine first run" from "log was deleted".
  bootstrappedFromVersion: string | null;
  // Per-application audit data. Never a correctness input — the applied SET lives in the line file.
  applied: { [id: string]: { seq?: number; appliedAt: string; byCli: string } };
}

/**
 * Single owner of the consumer-side applied-update state.
 *
 *  - `frontend/.clint-applied`            committed, newline-delimited sorted list of update ids.
 *                                         `.gitattributes: ... merge=union` makes two devs' appends merge cleanly.
 *  - `frontend/.clint-applied.meta.json`  gitignored sidecar holding per-checkout audit data + the
 *                                         migration bootstrap marker. Never merged, never trusted for correctness.
 *  - `frontend/.clint.lock`               O_EXCL lock so two concurrent clint runs can't race the write.
 *
 * `seq` is NEVER stored in the line file — apply order is always recomputed from the freshly
 * fetched manifest, so a CI renumber can never make the local state stale.
 */
export class AppliedState {
  private basePath: string;
  private appliedPath: string;
  private metaPath: string;
  private lockPath: string;
  private lockFd: number | null = null;

  constructor(basePath: string = './') {
    this.basePath = basePath;
    const configPath = path.resolve(process.cwd(), basePath, 'cli.config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const rel = config.frontend.appliedStatePath || '../frontend/.clint-applied';
    this.appliedPath = path.resolve(process.cwd(), basePath, rel);
    this.metaPath = this.appliedPath + '.meta.json';
    this.lockPath = path.join(path.dirname(this.appliedPath), '.clint.lock');
  }

  public getAppliedPath(): string {
    return this.appliedPath;
  }

  public exists(): boolean {
    return fs.existsSync(this.appliedPath);
  }

  /** Returns the applied id set, or `null` when the file does not exist (caller decides migrate vs reconcile). */
  public read(): Set<string> | null {
    if (!fs.existsSync(this.appliedPath)) return null;
    const raw = fs.readFileSync(this.appliedPath, 'utf8');
    return this.parse(raw);
  }

  private parse(raw: string): Set<string> {
    const ids = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));
    return new Set(ids);
  }

  public isApplied(id: string): boolean {
    const set = this.read();
    return set ? set.has(id) : false;
  }

  /** Atomic, sorted write of the line file (temp + rename). */
  public writeSet(ids: Set<string> | string[]): void {
    const arr = Array.from(ids).sort();
    const body = arr.length ? arr.join('\n') + '\n' : '';
    const tmp = this.appliedPath + '.tmp';
    fs.writeFileSync(tmp, body, 'utf8');
    fs.renameSync(tmp, this.appliedPath);
  }

  /** Record one applied id immediately (per-update, so a resume re-runs only the unfinished tail). */
  public append(id: string, seq?: number, byCli: string = 'unknown'): void {
    const set = this.read() ?? new Set<string>();
    set.add(id);
    this.writeSet(set);
    this.recordMeta(id, seq, byCli);
  }

  // ---- meta sidecar (gitignored) ----

  public readMeta(): AppliedMeta {
    if (fs.existsSync(this.metaPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.metaPath, 'utf8'));
      } catch {
        // corrupt sidecar is non-fatal: it carries no correctness state.
      }
    }
    return { schema: 1, bootstrappedFromVersion: null, applied: {} };
  }

  private writeMeta(meta: AppliedMeta): void {
    const tmp = this.metaPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(meta, null, 2), 'utf8');
    fs.renameSync(tmp, this.metaPath);
  }

  private recordMeta(id: string, seq: number | undefined, byCli: string): void {
    const meta = this.readMeta();
    meta.applied[id] = { seq, appliedAt: new Date().toISOString(), byCli };
    this.writeMeta(meta);
  }

  public getBootstrappedFromVersion(): string | null {
    return this.readMeta().bootstrappedFromVersion;
  }

  public setBootstrappedFromVersion(version: string): void {
    const meta = this.readMeta();
    meta.bootstrappedFromVersion = version;
    this.writeMeta(meta);
  }

  // ---- concurrency lock ----

  /** Returns false if another clint run already holds the lock. */
  public acquireLock(): boolean {
    try {
      this.lockFd = fs.openSync(this.lockPath, 'wx');
      fs.writeSync(this.lockFd, String(process.pid));
      return true;
    } catch (err: any) {
      if (err && err.code === 'EEXIST') return false;
      throw err;
    }
  }

  public releaseLock(): void {
    try {
      if (this.lockFd !== null) {
        fs.closeSync(this.lockFd);
        this.lockFd = null;
      }
      if (fs.existsSync(this.lockPath)) fs.unlinkSync(this.lockPath);
    } catch {
      // best-effort cleanup
    }
  }

  // ---- reconcile ----

  /**
   * Best-effort recovery of the applied set from committed git history, used when the local
   * line file was deleted but a prior bootstrap/meta shows it once existed. Returns null when
   * git history is unavailable (caller falls back to a confirmed manifest reconcile).
   */
  public readFromGitHead(): Set<string> | null {
    try {
      const dir = path.dirname(this.appliedPath);
      const repoRoot = execSync('git rev-parse --show-toplevel', { cwd: dir }).toString().trim();
      const relToRepo = path.relative(repoRoot, this.appliedPath).split(path.sep).join('/');
      const raw = execSync(`git show HEAD:${relToRepo}`, { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      return this.parse(raw);
    } catch {
      return null;
    }
  }
}
