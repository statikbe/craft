/// <reference types="vite/client" />
import prompts from 'prompts';
import { TesterFlow } from './tester/testerflow';

export class Start {
  constructor() {
    this.runInit();
  }

  private async runInit() {
    console.clear();
    console.log('Welcome to the Statik Craft Base CLI');
    console.log('=============================');
    console.log('');
    const choice = await prompts({
      type: 'select',
      name: 'value',
      message: 'What do you want to run?',
      choices: [
        { title: 'Update', value: 'update' },
        { title: 'Test', value: 'test' },
        { title: 'Exit', value: 'exit' },
      ],
      initial: 0,
    });

    switch (choice.value) {
      case 'update':
        console.log('Update not implemented yet.');
        process.exit(0);
      case 'test':
        new TesterFlow();
        break;
      default:
        console.log('No valid choice made, exiting.');
        process.exit(0);
    }
  }
}

new Start();
