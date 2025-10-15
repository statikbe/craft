const fs = require('fs');
const path = require('path');

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

  public static async checkFrontendForUpdates(basePath: string = './') {
    const config = this.getConfig(basePath);
    const configPath = path.resolve(process.cwd(), basePath, config.frontend.packagePath);

    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      const frontendPackage = JSON.parse(raw);
      const currentVersion = frontendPackage.version;
      let latestVersion = '';

      await fetch(config.frontend.packageGitUrl)
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
