import ora from 'ora';
import colors from 'colors';
import { exec } from 'child_process';
import { promisify } from 'util';
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
      const execAsync = promisify(exec);
      spinner.color = 'green';
      spinner.text = 'Downloading update ...';
      GitActions.getRemoteFiles(config.cli.updateRepo, config.cli.cliPath, '../' + config.cli.cliPath).then(
        async () => {
          spinner.succeed('CLI updated successfully!');
          spinner.stop();
          spinner.clear();
          spinner.start('Building CLI ...');
          await execAsync('yarn install');
          await execAsync('yarn build');
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
      console.log('Updating Frontend...');
    }
  }
}
