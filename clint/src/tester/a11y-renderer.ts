import colors from 'colors';
import * as fs from 'fs';
import mustache from 'mustache';
import open from 'open';
import { Helper } from '../libs/helpers';
import { A11yErrorMessage, OutputTypeA11y } from './types';
import { RefreshServer } from './refresh-server';

export class A11yRenderer {
  private outputA11y: OutputTypeA11y[] = [];
  constructor(outputA11y) {
    this.outputA11y = outputA11y;
  }

  public renderA11yOutputConsole() {
    let output = '';
    this.outputA11y.forEach((outputType: OutputTypeA11y) => {
      output += colors.cyan(`\n> Errors for: ${outputType.url}\n\n`);
      outputType.errorMessages.forEach((message: A11yErrorMessage) => {
        output += `------------------------\n\n`;
        output += `${colors.red(`${message.message}`)}\n\n`;
        if (message.selector) {
          output += `${colors.yellow(message.selector)}\n\n`;
        }
        if (message.context) {
          output += `${colors.gray(message.context)}\n\n`;
        }
      });
    });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }

  public renderA11yOutputHTML(url: string, snippet: boolean = false) {
    const now = new Date();
    let fileName = '';
    let path = '';
    let body = '';
    const manifest = Helper.getFrontendManifest();
    const mainUrl = new URL(url);
    this.outputA11y.map((output) => {
      output.numberOfErrors = output.errorMessages.length;
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, '');
    });

    fileName = `${now.getTime()}.html`;
    path = `./public/tmp/${fileName}`;
    if (!snippet) {
      Helper.clearDirectory('./public/tmp');
    }

    const template = fs.readFileSync('./templates/a11yTester.html', 'utf8');

    body = mustache.render(template, {
      manifest: manifest,
      mainUrl: mainUrl.origin,
      date: now.toLocaleString(),
      local: true,
      testedUrls: this.outputA11y,
    });

    if (!snippet) {
      fs.writeFile(path, body, (err: any) => {
        if (err) throw err;

        open.default(`http://localhost:3030/tmp/${fileName}`, {
          app: {
            name: 'google chrome',
            arguments: ['--allow-file-access-from-files'],
          },
        });
        const refreshServer = new RefreshServer();
        refreshServer.listenForA11yChanges();
      });
    }

    if (snippet) {
      return body;
    } else {
      return fileName;
    }
  }
}
