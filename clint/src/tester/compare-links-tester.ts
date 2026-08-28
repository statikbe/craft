#!/usr/bin/env node
'use strict';

import colors from 'colors';
import { Helper } from '../libs/helpers';
import { Output } from './output';
import { RenderType, TestResult } from './types';

export class CompareLinksTester {
  private output: Output;
  private outputType: RenderType = 'cli';
  private baseUrlDestination = '';
  private urls: string[] = [];
  private verbose = true;
  private testPromise: Promise<any> | null = null;
  private testResolve: any;
  private currentUrl = 1;
  private totalUrls = 0;
  private totalErrorUrls = 0;

  constructor() {
    colors.enable();
    this.output = new Output('compareLinksTester', '');
  }

  public test(sitemapUrl: string | null, url = '', output: string = 'cli', verbose: boolean = true) {
    sitemapUrl ?? '';
    this.baseUrlDestination = url;
    if (sitemapUrl.length == 0 || this.baseUrlDestination.length == 0) {
      console.error('You need to provide both the sitemap of the origin site and the base URL of the destination site');
      process.exit(1);
    }
    this.outputType = output as RenderType;
    this.verbose = verbose;

    if (sitemapUrl) {
      Promise.resolve()
        .then(() => {
          Helper.getUrlsFromSitemap(sitemapUrl, '', this.urls).then((urls) => {
            if (urls) {
              this.urls = urls;
              this.totalUrls = urls.length;
              this.testUrls();
            }
          });
        })
        .catch((error) => {
          // Handle any errors
          console.error(error.message);
          process.exit(1);
        });
    }

    this.testPromise = new Promise((resolve, reject) => {
      this.testResolve = resolve;
    });
    return this.testPromise;
  }

  private testUrls() {
    this.output = new Output('compareLinksTester', new URL(this.urls[0]).origin);
    Promise.resolve()
      .then(() => {
        if (this.verbose) {
          console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS\n`));
        }
        // Run the tests
        this.testLinks(this.baseUrlDestination);
      })
      .catch((error) => {
        // Handle any errors
        console.error(error.message);
        process.exit(1);
      });
  }

  private testLinks(baseUrl: string) {
    this.testLink(this.urls[0], baseUrl).then((result: any) => {
      this.urls.shift();
      this.currentUrl++;
      if (this.urls.length > 0) {
        setTimeout(() => {
          this.testLinks(baseUrl);
        }, 100);
      } else {
        const renderOutput = this.output.render(this.outputType, false);
        const testResult: TestResult = {
          filename: renderOutput,
          numberOfUrls: this.totalUrls,
          numberOfUrlsWithErrors: this.totalErrorUrls,
        };

        this.testResolve(testResult);
      }
    });
  }

  private testLink(url: string, baseUrl: string) {
    const link = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    const testUrl = baseUrlObj.origin + link.pathname + link.search;

    if (this.verbose) {
      process.stdout.write(colors.cyan(' > '));
      process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
    }
    return new Promise((resolveTest, rejectTest) => {
      Promise.resolve()
        .then(() =>
          fetch(testUrl, {
            signal: AbortSignal.timeout(10000),
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)',
            },
          })
        )
        .then((response) => {
          if (response.status == 404) {
            this.output.add(url, {
              url: testUrl,
              status: response.status.toString(),
            });
            if (this.verbose) {
              console.log(colors.red(`✖`), `${url} -> ${testUrl} (${response.status})`);
            }
            this.totalErrorUrls++;
          } else {
            if (this.verbose) {
              if (response.status >= 200 && response.status < 300) {
                console.log(colors.green(`✔`), `${url} -> ${testUrl} (${response.status})`);
              } else {
                console.log(colors.yellow(`●`), `${url} -> ${testUrl} (${response.status})`);
              }
            }
          }
          resolveTest(true);
        })
        .catch((error) => {
          this.output.add(url, {
            url: testUrl,
            status: error.cause ? error.cause.code : error,
          });
          this.totalErrorUrls++;
          resolveTest(true);
        });
    });
  }
}
