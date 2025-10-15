import ora from 'ora';
import { exec } from 'child_process';
import { UpdateChecker } from './updateChecker';
import { GitActions } from './git';

export class Updater {
  private updateCli;
  private updateFrontend;

  constructor(updateCli, updateFrontend) {
    this.updateCli = updateCli;
    this.updateFrontend = updateFrontend;
  }

  public runUpdates() {
    if (this.updateCli && this.updateCli.update) {
      const spinner = ora.default('Updating CLI ...').start();
      const config = UpdateChecker.getConfig();
      spinner.color = 'green';
      spinner.text = 'Downloading update ...';
      GitActions.pullLatestChanges().then(() => {
        spinner.succeed('CLI updated successfully!');
        exec(`yarn start`);
        process.exit(0);
      });
      // GitActions.getRemoteFiles(config.cli.updateRepo, config.cli.cliPath, '../' + config.cli.cliPath);
    } else if (this.updateFrontend && this.updateFrontend.update) {
      console.log('Updating Frontend...');
    }
  }
}
