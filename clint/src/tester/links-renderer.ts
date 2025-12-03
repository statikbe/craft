import colors from 'colors';
import * as excel from 'node-excel-export';
import * as fs from 'fs';
import mustache from 'mustache';
import open, { apps } from 'open';
import { Helper } from '../libs/helpers';
import { BrokenLink, OutputTypeLink } from './types';
import { RefreshServer } from './refresh-server';

export class LinksRenderer {
  constructor(private readonly outputLinks: OutputTypeLink[] = []) {}

  public renderBrokenLinkOutputConsole() {
    let output = '';
    this.outputLinks
      .filter((f) => f.brokenLinks.find((bl) => bl.status != '200'))
      .forEach((outputType: OutputTypeLink) => {
        output += colors.cyan(`> Errors for: ${outputType.url}\n\n`);
        outputType.brokenLinks
          .filter((bl) => bl.status != '200')
          .forEach((link: BrokenLink) => {
            output += ` ${colors.red('•')} ${colors.red(`${link.status}`)} : ${link.url}\n`;
            output += `   ${colors.yellow(
              link.linkText && link.linkText.length ? link.linkText : link.tag ?? ''
            )} : \n   ${colors.yellow(link.selector ?? '')}\n\n`;
          });
      });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }

  public renderBrokenLinkOutputHTML(url: string, snippet: boolean = false) {
    const now = new Date();
    let fileName = '';
    let path = '';
    let body = '';
    const manifest = Helper.getFrontendManifest();
    const mainUrl = new URL(url);
    this.outputLinks.map((output) => {
      output.numberOfErrors = output.brokenLinks.filter((bl) => bl.status != '200').length;
      output.numberOfOKLinks = output.brokenLinks.filter((bl) => bl.status == '200').length;
      output.okLinks = output.brokenLinks.filter((bl) => bl.status == '200');
      output.brokenLinks = output.brokenLinks.filter((bl) => bl.status != '200');
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, '');
    });

    fileName = `${now.getTime()}.html`;
    path = `./public/tmp/${fileName}`;
    if (!snippet) {
      Helper.clearDirectory('./public/tmp');
    }

    const template = fs.readFileSync('./templates/linkTester.html', 'utf8');
    body = mustache.render(template, {
      manifest: manifest,
      mainUrl: mainUrl.origin,
      date: now.toLocaleString(),
      local: true,
      testedUrls: this.outputLinks,
    });

    if (!snippet) {
      fs.writeFile(path, body, (err: any) => {
        if (err) throw err;
        open.default(`http://localhost:3030/tmp/${fileName}`, {
          app: {
            name: apps.chrome,
            arguments: ['--allow-file-access-from-files'],
          },
        });
        const refreshServer = new RefreshServer();
        refreshServer.listenForLinksChanges();
      });
    }

    if (snippet) {
      return body;
    } else {
      return fileName;
    }
  }

  public renderBrokenLinkOutputExcel(url: string, compare: boolean = false) {
    this.outputLinks.map((output) => {
      output.numberOfErrors = output.brokenLinks.filter((bl) => bl.status != '200').length;
      output.brokenLinks = output.brokenLinks.filter((bl) => bl.status != '200');
    });

    const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: 'FFCCCCCC',
          },
        },
        font: {
          color: {
            rgb: 'FF000000',
          },
          sz: 14,
          bold: true,
        },
        alignment: {
          vertical: 'top',
        },
      },
      cell: {
        alignment: {
          vertical: 'top',
        },
      },
    };

    const specification = {
      url: {
        displayName: 'URL',
        headerStyle: styles.headerDark,
        width: 300,
      },
      status: {
        displayName: 'Status',
        headerStyle: styles.headerDark,
        width: 200,
      },
      link: {
        displayName: 'Link',
        headerStyle: styles.headerDark,
        width: 200,
      },
      ...(compare
        ? {
            linkText: {
              displayName: 'Link Text',
              headerStyle: styles.headerDark,
              width: 200,
            },
          }
        : {}),
    };

    const dataset = [];
    const merges = [];
    let currentRow = 2;

    this.outputLinks.forEach((outputType) => {
      outputType.brokenLinks.forEach((output) => {
        const row = {
          url: {
            value: outputType.url,
            style: styles.cell,
          },
          status: output.status,
          link: output.url,
          ...(compare ? { linkText: output.linkText } : {}),
        };
        dataset.push(row);
      });
      const merge = {
        start: { row: currentRow, column: 1 },
        end: { row: currentRow + outputType.brokenLinks.length - 1, column: 1 },
      };
      merges.push(merge);
      currentRow += outputType.brokenLinks.length;
    });

    const report = excel.buildExport([
      {
        name: 'Report',
        merges: merges,
        specification: specification,
        data: dataset,
      },
    ]);

    const fileName = `link-test-${url.replace(/[^a-zA-Z0-9]/g, '')}.xlsx`;
    const path = `./public/excel/${fileName}`;
    fs.writeFileSync(path, report);

    open.default(path, {
      app: {
        name: apps.chrome,
        arguments: ['--allow-file-access-from-files'],
      },
    });
    return path;
  }
}
