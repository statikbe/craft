import * as excel from 'node-excel-export';
import * as fs from 'fs';
import { HTMLErrorMessage, OutputTypeHTML } from './types';
import open, { apps } from 'open';

export class HeadingRenderer {
  private outputHTML: OutputTypeHTML[] = [];
  constructor(outputHTML) {
    this.outputHTML = outputHTML;
  }

  public renderHeadingOutputExcel(url: string) {
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
      },
    };

    const specification = {
      url: {
        displayName: 'URL',
        headerStyle: styles.headerDark,
        width: 300,
      },
      error: {
        displayName: 'Error',
        headerStyle: styles.headerDark,
        width: 200,
      },
      headingText: {
        displayName: 'Heading Text',
        headerStyle: styles.headerDark,
        width: 200,
      },
    };

    const dataset = [];

    this.outputHTML.forEach((outputType: OutputTypeHTML) => {
      outputType.errorMessages.forEach((message: HTMLErrorMessage) => {
        const row = {
          url: outputType.url,
          error: message.message,
          headingText: message.elementText,
        };
        dataset.push(row);
      });
    });

    const report = excel.buildExport([
      {
        name: 'Report',
        specification: specification,
        data: dataset,
      },
    ]);

    const fileName = `heading-test-${url.replace(/[^a-zA-Z0-9]/g, '')}.xlsx`;
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
