import colors from 'colors';
import * as fs from 'fs';
import mustache from 'mustache';
import open, { apps } from 'open';
import { Helper } from '../libs/helpers';
import { RefreshServer } from './refresh-server';
import { OutputTypeCO2 } from './types';
import bytes from 'bytes';

export class CO2Renderer {
  private outputCO2: OutputTypeCO2[] = [];
  constructor(outputHTML) {
    this.outputCO2 = outputHTML;
  }

  public renderCO2OutputConsole() {
    let output = '';
    this.outputCO2.forEach((outputType: OutputTypeCO2) => {
      output += colors.underline.cyan(
        `${outputType.url} - ${outputType.CO2Data.co2.toPrecision(3)} g CO² (${bytes(outputType.CO2Data.totalBytes)})\n`
      );
    });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }

  public renderCO2OutputHTML(url: string, snippet: boolean = false) {
    const now = new Date();
    const mainUrl = new URL(url);
    let fileName = '';
    let path = '';
    let body = '';
    const manifest = Helper.getFrontendManifest();
    this.outputCO2.map((output) => {
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, '');
      output.size = bytes(output.CO2Data.totalBytes);
      output.CO2Data.co2Formatted = output.CO2Data.co2.toPrecision(3);
    });

    fileName = `${now.getTime()}.html`;
    path = `./public/tmp/${fileName}`;
    Helper.clearDirectory('./public/tmp');

    const template = fs.readFileSync('./templates/co2Tester.html', 'utf8');
    body = mustache.render(template, {
      manifest: manifest,
      mainUrl: mainUrl.origin,
      testedUrls: this.outputCO2,
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
        refreshServer.listenForCO2Changes();
      });
    }

    if (snippet) {
      return body;
    } else {
      return fileName;
    }

    return fileName;
  }

  public renderCO2OutputExcel(url: string, compare: boolean = false) {
    this.outputCO2.map((output) => {
      output.size = bytes(output.CO2Data.totalBytes);
      output.CO2Data.co2Formatted = output.CO2Data.co2.toPrecision(3);
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
