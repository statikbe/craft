import { HtmlValidate } from 'html-validate/node';
import colors from 'colors';
import { Helper } from '../libs/helpers';
import { Output } from './output';
import { HTMLErrorMessage, OutputTypeHTML, RenderType, TestResult } from './types';
import * as cheerio from 'cheerio';
import * as uniqueSelector from 'cheerio-get-css-selector';

export class HeadingErrorExporter {
  private output: Output;
  private currentUrl = 1;
  private totalUrls = 0;
  private totalErrorUrls = 0;
  private htmlvalidate: HtmlValidate;
  private external = false;
  private urls: string[] = [];
  private verbose = true;
  private testPromise: Promise<any> | null = null;
  private testResolve: any;
  private exportType: RenderType = 'cli';

  constructor() {
    colors.enable();
    this.output = new Output('headingTester', '');
    this.htmlvalidate = new HtmlValidate({
      elements: ['html5'],
      extends: ['html-validate:document'],
      rules: {
        'input-missing-label': 'off',
        'missing-doctype': 'off',
        'no-missing-references': 'off',
        'require-sri': 'off',
      },
    });
  }

  public test(sitemapUrl: string | null, url = '', external: boolean = false, exportType: RenderType = 'cli') {
    this.external = external;
    this.exportType = exportType;

    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(',');
    }

    if (sitemapUrl) {
      Promise.resolve()
        .then(() => {
          Helper.getUrlsFromSitemap(sitemapUrl, '', this.urls).then((urls) => {
            if (urls) {
              this.urls = urls;
              this.testUrls();
            }
          });
        })
        .catch((error) => {
          // Handle any errors
          console.error(error.message);
          process.exit(1);
        });
    } else {
      this.testUrls();
    }

    this.testPromise = new Promise((resolve, reject) => {
      this.testResolve = resolve;
    });
    return this.testPromise;
  }

  private testUrls() {
    Promise.resolve()
      .then(() => {
        if (this.verbose) {
          console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS`));
        }
        this.output = new Output('headingTester', new URL(this.urls[0]).origin);
        this.totalUrls = this.urls.length;
        this.currentUrl = 0;

        // Run the tests
        if (this.external && this.urls.length > 0) {
          this.testUrl(this.urls.pop() as string);
        } else {
          this.urls.forEach((url) => {
            this.testUrl(url);
          });
        }
      })
      .catch((error) => {
        // Handle any errors
        console.error(error.message);
        process.exit(1);
      });
  }

  private testUrl(url: string) {
    Promise.resolve()
      .then(() =>
        fetch(url, {
          signal: AbortSignal.timeout(10000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)',
          },
        })
      )
      .then((response) => response.text())
      .then((body) => {
        this.htmlvalidate
          .validateString(body)
          .then((result: any) => {
            const $ = cheerio.load(body);
            uniqueSelector.init($);

            if (result.valid) {
              this.RenderUrl(url, 0);
            } else {
              result.results[0].messages.forEach((message: any) => {
                if (message.selector) {
                  const text = $(message.selector).text();
                  message.elementText = text;
                }
                this.output.add(url, message);
              });
              this.RenderUrl(url, result.results[0].errorCount);
            }
          })
          .catch((error: string) => {
            this.RenderUrl(url, 1, {
              message: error,
            });
          });
      })
      .catch((error) => {
        console.log(error);

        this.RenderUrl(url, 1, {
          message: error,
        });
      });
  }

  private RenderUrl(url: string, errors: number, message?: HTMLErrorMessage) {
    this.currentUrl++;
    if (this.verbose) {
      process.stdout.write(colors.cyan(' > '));
      process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
      process.stdout.write(url);
      process.stdout.write(' - ');
      if (errors == 0) {
        console.log(colors.green('0 errors'));
      } else {
        console.log(colors.red(`${errors} errors`));
        this.totalErrorUrls++;
      }
    }

    if (message) {
      this.output.add(url, message);
    }

    if (this.currentUrl == this.totalUrls) {
      const renderOutput = this.output.render(this.exportType, false);

      const testResult: TestResult = {
        filename: renderOutput,
        numberOfUrls: this.totalUrls,
        numberOfUrlsWithErrors: this.totalErrorUrls,
      };
      this.testResolve(testResult);
    }

    if (this.external && this.urls.length > 0) {
      setTimeout(() => {
        this.testUrl(this.urls.pop() as string);
      }, 100);
    }
  }
}
