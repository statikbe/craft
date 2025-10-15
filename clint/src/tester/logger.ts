import * as fs from 'fs';

import { NewError, OutputTypeA11y, OutputTypeHTML, OutputTypeLink } from './types';

export class Logger {
  constructor() {}

  public static GetNewErrors(
    type: 'html' | 'links' | 'a11y',
    output: OutputTypeHTML | OutputTypeLink | OutputTypeA11y
  ) {
    if (fs.existsSync(`./data/logs/${type}-${output[0].id}.json`)) {
      try {
        const previousData = JSON.parse(fs.readFileSync(`./data/logs/${type}-${output[0].id}.json`, 'utf8'));
        let newErrors = [];
        switch (type) {
          case 'html':
            newErrors = output[0].errorMessages.filter(
              (error) =>
                !previousData.errorMessages.some(
                  (previousError) =>
                    previousError.message === error.message &&
                    (previousError.selector === error.selector || error.ruleId == 'form-dup-name')
                )
            );
            break;

          case 'a11y':
            newErrors = output[0].errorMessages.filter(
              (error) =>
                !previousData.errorMessages.some(
                  (previousError) =>
                    previousError.message === error.message && previousError.selector === error.selector
                )
            );
            break;

          case 'links':
            newErrors = output[0].brokenLinks.filter(
              (error) =>
                !previousData.brokenLinks.some(
                  (previousError) => previousError.url === error.url && previousError.selector === error.selector
                )
            );
            break;
        }
        fs.writeFile(`./data/logs/${type}-${output[0].id}.json`, JSON.stringify(output[0]), (err: any) => {
          if (err) throw err;
        });
        return newErrors;
      } catch (error) {
        console.log(error);
      }
    } else {
      fs.writeFile(`./data/logs/${type}-${output[0].id}.json`, JSON.stringify(output[0]), (err: any) => {
        if (err) throw err;
      });
      switch (type) {
        case 'html':
          return output[0].errorMessages;

        case 'a11y':
          return output[0].errorMessages;

        case 'links':
          return output[0].brokenLinks;
      }
    }
  }

  public static reportNewErrors(errors: NewError[], slackChannel: string) {
    console.log('New errors:', errors, slackChannel);
  }
}
