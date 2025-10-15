import ora from 'ora';
import colors from 'colors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { UpdateChecker } from './updateChecker';
import { GitActions } from './git';
import process from 'process';
import path from 'path';
import fs from 'fs';

export class Updater {
  private updateCli;
  private updateFrontend;

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
    if (this.updateCli && this.updateCli.update) {
      const spinner = ora.default('Updating CLI ...').start();
      const config = UpdateChecker.getConfig();
      const execAsync = promisify(exec);
      spinner.color = 'green';
      spinner.text = 'Downloading update ...';
      GitActions.getRemoteFiles(config.cli.updateRepo, config.cli.cliPath, '../' + config.cli.cliPath).then(
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
      const spinner = ora.default('Updating Frontend ...').start();
      const config = UpdateChecker.getConfig();
      const configPath = path.resolve(process.cwd(), './', config.frontend.packagePath);

      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        const frontendPackage = JSON.parse(raw);
        const currentVersion = frontendPackage.version;

        spinner.color = 'green';
        spinner.text = 'Downloading updates ...';
        GitActions.pullLatestChanges().then(async () => {
          spinner.succeed('Updates downloaded successfully!');
          spinner.stop();
          spinner.clear();
          const updatesPath = path.resolve(process.cwd(), './updates');
          if (fs.existsSync(updatesPath)) {
            const updateFolders = fs
              .readdirSync(updatesPath, { withFileTypes: true })
              .filter((dir) => dir.isDirectory())
              .map((dir) => dir.name)
              .filter((folderName) => folderName > currentVersion)
              .sort();

            console.log(
              colors.green(`🚀 We are about to update from ${currentVersion} to ${updateFolders.join(', ')}.`)
            );
            // Process updateFolders as needed
          } else {
            console.log(colors.yellow('⚠️ Updates directory not found.'));
          }
        });
      } else {
        spinner.color = 'red';
        spinner.text = 'Could not find frontend package.json, please update manually.';
        spinner.fail();
        spinner.stop();
        process.exit(1);
      }
    }
  }
}
