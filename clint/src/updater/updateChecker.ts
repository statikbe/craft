import { AppliedState } from './appliedState';

const fs = require('fs');
const path = require('path');

export interface ManifestUpdate {
  id: string;
  seq: number;
  title: string;
  date: string;
  issues?: number[];
  pr?: number | null;
  requires?: string[];
  legacyVersion?: string | null;
  hasOps?: boolean;
}

export interface Manifest {
  schema: number;
  generatedAt?: string;
  updates: ManifestUpdate[];
}

export interface FrontendUpdateStatus {
  update: boolean;
  pending: ManifestUpdate[];
  manifest: Manifest | null;
  // The local applied log is absent — a legacy project that predates this system. Migration first.
  appliedMissing: boolean;
}

export class UpdateChecker {
  constructor() {}

  public static async checkCliForUpdates(basePath: string = './') {
    const config = this.getConfig(basePath);
    const configPath = path.resolve(process.cwd(), basePath, config.cli.packagePath);

    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const cliPackage = JSON.parse(raw);
      const currentVersion = cliPackage.version;
      let latestVersion = '';

      await fetch(config.cli.packageGitUrl)
        .then((response) => response.json())
        .then((data) => {
          latestVersion = data.version;
        })
        .catch((err) => {
          console.error(`Failed to fetch latest version: ${err?.message ?? err}`);
        });

      if (currentVersion !== latestVersion) {
        return { update: true, currentVersion: currentVersion, latestVersion: latestVersion };
      }
    }

    return { update: false };
  }

  /**
   * Frontend updates are no longer driven by a linear semver. We fetch the published manifest
   * (fail closed on any error — never silently report "up to date") and compute the pending set
   * as `manifest.updates` whose id is not in the local applied log.
   */
  public static async checkFrontendForUpdates(basePath: string = './'): Promise<FrontendUpdateStatus> {
    const config = this.getConfig(basePath);
    const manifest = await this.fetchManifest(config.frontend.indexGitUrl);

    const appliedState = new AppliedState(basePath);
    const applied = appliedState.read();

    if (applied === null) {
      // No local applied log: a legacy project. Defer to migration; surface as "update available".
      return { update: manifest.updates.length > 0, pending: [], manifest, appliedMissing: true };
    }

    const pending = manifest.updates.filter((u) => !applied.has(u.id));
    return { update: pending.length > 0, pending, manifest, appliedMissing: false };
  }

  /** Raw-fetch the manifest. Throws on any non-2xx, network, or parse error (fail closed). */
  public static async fetchManifest(indexGitUrl: string): Promise<Manifest> {
    if (!indexGitUrl) {
      throw new Error('No frontend.indexGitUrl configured in cli.config.json');
    }
    let response: Response;
    try {
      response = await fetch(indexGitUrl, { cache: 'no-store' as RequestCache });
    } catch (err: any) {
      throw new Error(`Could not reach the update manifest at ${indexGitUrl}: ${err?.message ?? err}`);
    }
    if (!response.ok) {
      throw new Error(`Update manifest request failed (${response.status}) for ${indexGitUrl}`);
    }
    const text = await response.text();
    let manifest: Manifest;
    try {
      manifest = JSON.parse(text);
    } catch (err: any) {
      throw new Error(`Update manifest at ${indexGitUrl} is not valid JSON: ${err?.message ?? err}`);
    }
    if (!manifest || !Array.isArray(manifest.updates)) {
      throw new Error(`Update manifest at ${indexGitUrl} is missing an "updates" array`);
    }
    return manifest;
  }

  public static getConfig(basePath: string = './') {
    try {
      const configPath = path.resolve(process.cwd(), basePath, 'cli.config.json');
      const raw = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to read or parse cli.config.json: ${err?.message ?? err}`);
    }
  }
}
