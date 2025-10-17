import ora from 'ora';
import colors from 'colors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { UpdateChecker } from './updateChecker';
import { GitActions } from './git';
import process from 'process';
import path from 'path';
import fs from 'fs';
import prompts from 'prompts';

export class Updater {
  private updateCli;
  private updateFrontend;
  private config;

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
    this.config = UpdateChecker.getConfig();
    if (this.updateCli && this.updateCli.update) {
      const spinner = ora.default('Updating CLI ...').start();
      const execAsync = promisify(exec);
      spinner.color = 'green';
      spinner.text = 'Downloading update ...';
      GitActions.getRemoteFiles(
        this.config.cli.updateRepo,
        this.config.cli.cliPath,
        '../' + this.config.cli.cliPath
      ).then(async () => {
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
      });
    } else if (this.updateFrontend && this.updateFrontend.update) {
      const spinner = ora.default('Updating Frontend ...').start();
      const configPath = path.resolve(process.cwd(), './', this.config.frontend.packagePath);

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

            if (updateFolders.length > 1) {
              const whatToUpdate = await prompts({
                type: 'select',
                name: 'value',
                message: `Which update do you want to apply?`,
                choices: [
                  ...updateFolders.map((folder) => ({ title: folder, value: folder })),
                  { title: 'All updates in sequence', value: 'all' },
                ],
                initial: 0,
              });

              if (whatToUpdate.value !== 'all') {
                console.log(colors.green(`🚀 We are about to update from ${currentVersion} to ${whatToUpdate.value}.`));
                // update only selected
                await this.applyFrontendUpdate(whatToUpdate.value);
              } else {
                console.log(
                  colors.green(`🚀 We are about to update from ${currentVersion} to ${updateFolders.join(' -> ')}.`)
                );
                for (const folder of updateFolders) {
                  const updateFolderPath = path.resolve(process.cwd(), './updates/' + folder);
                  if (fs.existsSync(updateFolderPath)) {
                    //update
                    await this.applyFrontendUpdate(folder);
                  }
                }
              }
            }
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

  private async applyFrontendUpdate(version: string): Promise<void> {
    console.log('Updating frontend to version ' + version);
    const updateData = fs.readFileSync(path.resolve(process.cwd(), './updates/' + version + '/update.json'), 'utf8');
    const update = JSON.parse(updateData);

    return new Promise(async (resolve, reject) => {
      console.log('----------------------------------------------------');
      console.log(update.description);
      console.log('----------------------------------------------------\n');

      if (update.frontend) {
        console.log('Updating frontend ...');
        const frontendExcludeFromSync = this.config.frontend.frontendExcludeFromSync
          ? this.config.frontend.frontendExcludeFromSync.map((item) =>
              item.startsWith('/') && item.endsWith('/') ? new RegExp(item.slice(1, -1)) : item
            )
          : [];
        const syncOptions = {
          exclude: frontendExcludeFromSync,
        };
        if (update.frontend.modify) {
          syncOptions['forceSync'] = update.frontend.modify;
        }
        await GitActions.getRemoteFiles(
          this.config.frontend.updateRepo,
          this.config.frontend.frontendPath,
          '../' + this.config.frontend.frontendPath,
          syncOptions
        );
        console.log(colors.green('✅ Frontend updated successfully!'));
      }

      if (update.root) {
        console.log('Updating root files ...');
        if (update.root.modify) {
          const syncOptions = {
            exclude: [/.*/],
            forceSync: update.root.modify,
          };
          await GitActions.getRemoteFiles(this.config.frontend.updateRepo, '', '', syncOptions);
          console.log(colors.green('✅ Root files updated successfully!'));
        }
      }

      resolve();
    });
  }
}
