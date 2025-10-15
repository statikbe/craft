#!/usr/bin/env node
'use strict';

import colors from 'colors';
import { Helper } from '../libs/helpers';
import * as cheerio from 'cheerio';
import * as uniqueSelector from 'cheerio-get-css-selector';
import * as cliProgress from 'cli-progress';
import { Output } from './output';
import { OutputTypeLink, RenderType, TestResult } from './types';

export class LinkTester {
  private output: Output;
  private external = false;
  private urls: string[] = [];
  private outputType: RenderType = 'cli';
  private verbose = true;
  private testPromise: Promise<any> | null = null;
  private testResolve: any;
  private totalUrls = 0;
  private totalErrorUrls = 0;

  constructor() {
    colors.enable();
    this.output = new Output('linkTester', '');
  }

  public test(
    sitemapUrl: string | null,
    url = '',
    external: boolean = false,
    output: string = 'cli',
    verbose: boolean = true
  ) {
    this.external = external;
    this.outputType = output as RenderType;
    this.verbose = verbose;

    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(',');
    }

    this.totalUrls = this.urls.length;

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
    } else {
      this.testUrls();
    }

    this.testPromise = new Promise((resolve, reject) => {
      this.testResolve = resolve;
    });
    return this.testPromise;
  }

  private testUrls() {
    this.output = new Output('linkTester', new URL(this.urls[0]).origin);
    Promise.resolve()
      .then(() => {
        if (this.verbose) {
          console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS\n`));
        }

        let uniqueLinks: string[] = [];
        const baseUrl = this.urls[0].split('/')[0] + '//' + this.urls[0].split('/')[2];

        // Run the tests
        this.testLinks(baseUrl, uniqueLinks);
      })
      .catch((error) => {
        // Handle any errors
        console.error(error.message);
        process.exit(1);
      });
  }

  private testLinks(baseUrl: string, uniqueLinks: string[]) {
    this.testLink(this.urls[0], baseUrl, uniqueLinks).then((result: any) => {
      uniqueLinks = result.uniqueLinks;
      this.urls.shift();
      if (this.urls.length > 0) {
        if (this.external) {
          setTimeout(() => {
            this.testLinks(baseUrl, uniqueLinks);
          }, 100);
        } else {
          this.testLinks(baseUrl, uniqueLinks);
        }
      } else {
        const renderOutput = this.output.render(this.outputType);
        const testResult: TestResult = {
          filename: renderOutput,
          numberOfUrls: this.totalUrls,
          numberOfUrlsWithErrors: this.totalErrorUrls,
        };

        this.testResolve(testResult);
      }
    });
  }

  private testLink(url: string, baseUrl: string, uniqueLinks: string[]) {
    let output = '';
    return new Promise((resolveTest, rejectTest) => {
      Promise.resolve()
        .then(() =>
          fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)',
            },
          })
        )
        .then((response) => response.text())
        .then((body) => {
          //Do the test
          Promise.resolve().then(() => {
            let totalErrors = 0;
            let urlsChecked = 0;
            // let urlErrors = colors.cyan(`> Errors for: ${url}\n\n`);

            const $ = cheerio.load(body);
            uniqueSelector.init($);
            const elementsAnchors = $('a[href]')
              .toArray()
              .filter((element: any) => {
                const href = $(element).attr('href');
                return href && href.startsWith('http');
              });
            const elementsLinks = $('link[href]')
              .toArray()
              .filter(
                (element: any) =>
                  $(element).attr('rel') != 'canonical' &&
                  $(element).attr('rel') != 'alternate' &&
                  $(element).attr('rel') != 'preconnect'
              )
              .map((element: any) => {
                const href = $(element).attr('href');
                if (href && href.startsWith('http')) return element;
                else
                  return $(element)
                    .attr('href', baseUrl + href)
                    .get(0);
              });
            const elementsScripts = $('script[src]').toArray();
            const elementsImages = $('img[src]')
              .toArray()
              .map((element: any) => {
                const src = $(element).attr('src');
                if (src && src.startsWith('http')) return element;
                else if (src && src.startsWith('data')) return element;
                else
                  return $(element)
                    .attr('src', baseUrl + src)
                    .get(0);
              });
            let elements = [...elementsAnchors, ...elementsLinks, ...elementsScripts, ...elementsImages];

            elements = elements.map((element) => {
              let link = '';
              if (!element) return element;
              if (element.tagName == 'a' || element.tagName == 'link') link = $(element).attr('href') ?? '';
              else if (element.tagName == 'script' || element.tagName == 'img') link = $(element).attr('src') ?? '';
              if (element.tagName == 'img' && link.startsWith('data')) {
                const srcset = $(element).attr('srcset');
                if (srcset) {
                  link = srcset.split(' ')[0];
                }
                if (link.indexOf('http') == -1) {
                  link = baseUrl + link;
                }
              }
              $(element).attr('data-url', link);
              return element;
            });

            elements = elements.filter((element) => {
              const dataUrl = $(element).attr('data-url');
              if (dataUrl) {
                if (uniqueLinks.indexOf(dataUrl) >= 0) return false;
                else {
                  uniqueLinks.push(dataUrl);
                  return true;
                }
              } else return false;
            });

            let bar: cliProgress.SingleBar | null = null;
            if (this.verbose) {
              bar = new cliProgress.SingleBar(
                {
                  clearOnComplete: false,
                  hideCursor: true,
                  format: (options: any, params: any, payload: any) => {
                    // bar grows dynamically by current progress - no whitespaces are added
                    const bar = options.barCompleteString.substr(0, Math.round(params.progress * options.barsize));
                    const barIncomplete = options.barIncompleteString.substr(
                      Math.round(params.progress * options.barsize) + 1
                    );
                    return (
                      bar +
                      barIncomplete +
                      ' | ' +
                      payload.url +
                      ' | Links checked: ' +
                      params.value +
                      '/' +
                      params.total +
                      ' | ' +
                      (payload.errors == 0
                        ? colors.green(payload.errors + ' errors')
                        : colors.red(payload.errors + ' errors'))
                    );
                  },
                },
                cliProgress.Presets.shades_grey
              );
              bar.start(elements.length, 0, {
                url: url,
                errors: totalErrors,
              });
            }

            if (elements.length == 0) {
              if (this.verbose && bar) {
                bar.stop();
              }
              resolveTest({
                uniqueLinks: uniqueLinks,
              });
            }

            const totalElements = elements.length;

            const checkLink = (element: any) => {
              const dataUrl = $(element).attr('data-url');
              if (!dataUrl) return;
              if (!element) return;
              fetch(dataUrl, {
                signal: AbortSignal.timeout(10000),
                headers: {
                  'User-Agent': 'Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)',
                },
              })
                .then((response) => {
                  if (response.status >= 400) {
                    this.output.add(url, {
                      url: dataUrl,
                      status: response.status.toString(),
                      tag: `<${element.tagName}>`,
                      selector: ($(element) as any).getUniqueSelector(),
                      linkText: $(element).text(),
                    });
                    totalErrors++;
                  } else {
                    this.output.add(url, {
                      url: dataUrl,
                      status: response.status.toString(),
                    });
                  }
                  urlsChecked++;
                  if (this.verbose && bar) {
                    bar.update(urlsChecked, { errors: totalErrors });
                  }
                  if (urlsChecked == totalElements) {
                    if (this.verbose && bar) {
                      bar.stop();
                    }
                    if (totalErrors > 0) {
                      this.totalErrorUrls++;
                    }
                    resolveTest({
                      uniqueLinks: uniqueLinks,
                    });
                  }
                })
                .catch((error) => {
                  this.output.add(url, {
                    url: dataUrl,
                    status: error.cause ? error.cause.code : error,
                    tag: `<${element.tagName}>`,
                    selector: ($(element) as any).getUniqueSelector(),
                    linkText: $(element).text(),
                  });
                  totalErrors++;
                  urlsChecked++;
                  if (this.verbose && bar) {
                    bar.update(urlsChecked, { errors: totalErrors });
                  }
                  if (urlsChecked == totalElements) {
                    if (this.verbose && bar) {
                      bar.stop();
                    }
                    if (totalErrors > 0) {
                      this.totalErrorUrls++;
                    }
                    resolveTest({
                      uniqueLinks: uniqueLinks,
                    });
                  }
                });
            };

            if (this.external) {
              const slowCheck = () => {
                checkLink(elements.pop());
                if (elements.length > 0) {
                  setTimeout(slowCheck, 100);
                }
              };
              if (elements.length > 0) {
                slowCheck();
              }
            } else {
              elements.map((element) => {
                checkLink(element);
              });
            }
          });
        })
        .catch((error) => {
          rejectTest(error);
        });
    });
  }
}
