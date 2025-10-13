/// <reference types="vite/client" />
import colors from 'colors';
import prompts from 'prompts';
import { TesterFlow } from './tester/testerflow';
import { UpdaterFlow } from './updater/updaterflow';
import { UpdateChecker } from './updater/updateChecker';

export class Start {
  constructor() {
    this.runInit();
  }

  private async runInit() {
    console.clear();
    console.log('Welcome to the Statik Craft Base CLI');
    console.log('=============================');
    console.log('');

    const startChoice: prompts.PromptObject = {
      type: 'select',
      name: 'value',
      message: 'What do you want to run?',
      choices: [
        { title: 'Test', value: 'test' },
        { title: 'Exit', value: 'exit' },
      ],
      initial: 0,
    };

    try {
      const updateCli = await UpdateChecker.checkCliForUpdates();
      const updateFrontend = await UpdateChecker.checkFrontendForUpdates();
      if (updateCli.update || updateFrontend.update) {
        process.stdout.write('---------------------------------------------------------------------------\n');
      }

      if (updateCli.update) {
        process.stdout.write(
          `| 🐦‍🔥 There is an update available for the CLI: ${colors.yellow(
            updateCli.currentVersion
          )} -> ${colors.green(updateCli.latestVersion)}\n`
        );
      }
      if (updateFrontend.update) {
        process.stdout.write(
          `| 🎨 There is an update available for the Frontend: ${colors.yellow(
            updateFrontend.currentVersion
          )} -> ${colors.green(updateFrontend.latestVersion)}\n`
        );
      }

      if (updateCli.update || updateFrontend.update) {
        (startChoice.choices as prompts.Choice[]).unshift({ title: 'Update', value: 'update' });
        process.stdout.write('---------------------------------------------------------------------------\n\n');
      }
    } catch (error) {
      console.error(`Failed to check for updates: ${error?.message ?? error}`);
    }

    const choice = await prompts(startChoice);

    switch (choice.value) {
      case 'update':
        new UpdaterFlow();
        break;
      case 'test':
        new TesterFlow();
        break;
      default:
        console.log('No valid choice made, exiting.');
        process.exit(0);
    }
  }
}

async function main() {
  let startPrompt = true;
  for (const val of process.argv) {
    if (val === '--checkupdates') {
      try {
        const updateCli = await UpdateChecker.checkCliForUpdates('./cli/');
        const updateFrontend = await UpdateChecker.checkFrontendForUpdates('./cli/');
        if (updateCli.update || updateFrontend.update) {
          process.stdout.write('---------------------------------------------------------------------------\n');
        }

        if (updateCli.update) {
          process.stdout.write(
            `| 🐦‍🔥 There is an update available for the CLI: ${colors.yellow(
              updateCli.currentVersion
            )} -> ${colors.green(updateCli.latestVersion)}\n`
          );
        }
        if (updateFrontend.update) {
          process.stdout.write(
            `| 🎨 There is an update available for the Frontend: ${colors.yellow(
              updateFrontend.currentVersion
            )} -> ${colors.green(updateFrontend.latestVersion)}\n`
          );
        }

        if (updateCli.update || updateFrontend.update) {
          process.stdout.write('---------------------------------------------------------------------------\n\n');
        }
      } catch (error) {
        console.error(`Failed to check for updates: ${error?.message ?? error}`);
      }
      startPrompt = false;
    }
  }

  if (startPrompt) {
    new Start();
  }
}

main();
