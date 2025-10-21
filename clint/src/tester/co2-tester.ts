#!/usr/bin/env node
'use strict';

import { co2, hosting, averageIntensity } from '@tgwf/co2';
import colors from 'colors';
import { Helper } from '../libs/helpers';
import { Output } from './output';
import { RenderType, TestResult } from './types';
import puppeteer from 'puppeteer';

export class CO2Tester {
  private output: Output;
  private urls: string[] = [];
  private outputType: RenderType = 'cli';
  private verbose = true;
  private limitUrls = 0;
  private testPromise: Promise<any> | null = null;
  private testResolve: any;
  private currentUrl = 1;
  private totalUrls = 0;
  private isGreen = false;
  private gridIntensity = 0;
  private co2Emission: co2;

  constructor() {
    colors.enable();
    this.output = new Output('co2Tester', '');
  }

  public async test(
    sitemapUrl: string | null,
    url = '',
    output: RenderType = 'cli',
    verbose: boolean = true,
    limitUrls = 0
  ) {
    this.outputType = output;
    this.verbose = verbose;
    this.limitUrls = limitUrls;

    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(',');
    }

    const { data } = averageIntensity;
    const { BEL } = data;
    this.gridIntensity = BEL;
    this.co2Emission = new co2({ model: 'swd', version: 4 });

    if (sitemapUrl) {
      Promise.resolve()
        .then(() => {
          Helper.getUrlsFromSitemap(sitemapUrl, '', this.urls, this.limitUrls).then(async (urls) => {
            if (urls) {
              this.urls = urls;
              await this.testUrls();
            }
          });
        })
        .catch((error) => {
          // Handle any errors
          console.error(error.message);
          process.exit(1);
        });
    } else {
      await this.testUrls();
    }

    this.testPromise = new Promise((resolve, reject) => {
      this.testResolve = resolve;
    });
    return this.testPromise;
  }

  private async testUrls() {
    const greenUrl = new URL(this.urls[0]);
    const options = {
      verbose: false,
      userAgentIdentifier: 'Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)',
    };
    // Wait for green check to complete
    try {
      this.isGreen = await hosting.check(greenUrl.hostname, options);
      if (this.isGreen && this.verbose) {
        console.log(colors.green(`🌳 Detected green hosting for ${greenUrl.hostname}`));
      } else if (this.verbose) {
        console.log(colors.yellow(`🏭 No green hosting detected for ${greenUrl.hostname}`));
      }
    } catch (error) {
      console.error('Green hosting check failed:', error);
      // Continue with green = false
    }

    this.totalUrls = this.urls.length;
    this.currentUrl = 0;

    Promise.resolve()
      .then(() => {
        if (this.verbose) {
          console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS`));
        }
        this.output = new Output('co2Tester', new URL(this.urls[0]).origin);

        // Run the tests
        this.urls.forEach((url) => {
          this.testUrl(url);
        });
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
      .then(async (body) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        let totalBytes = 0;

        page.on('response', (response) => {
          const headers = response.headers();
          const contentLength = headers['content-length'];
          if (contentLength) {
            totalBytes += parseInt(contentLength, 10);
          }
        });

        await page.goto(url, { waitUntil: 'networkidle0' });
        await browser.close();

        let estimatedCO2 = 0;
        if (this.gridIntensity) {
          estimatedCO2 = this.co2Emission.perByteTrace(totalBytes, this.isGreen, {
            gridIntensity: {
              device: this.gridIntensity, // Here we have set the grid intensity at the device location using a number.
              dataCenter: { country: 'BEL' }, // Here we have set the data center grid intensity using a country code.
              networks: this.gridIntensity, // Here we have set the network grid intensity using a number.
            },
          }).co2;
        } else {
          estimatedCO2 = this.co2Emission.perByte(totalBytes, this.isGreen);
        }
        this.RenderUrl(url, estimatedCO2, totalBytes);
      })
      .catch((error) => {
        console.log(error);
        this.RenderUrl(url, 0, 0);
      });
  }

  private RenderUrl(url: string, co2: number = 0, totalBytes: number = 0) {
    this.currentUrl++;
    if (this.verbose) {
      process.stdout.write(colors.cyan(' > '));
      process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
      process.stdout.write(url);
      process.stdout.write(' - ');
      process.stdout.write(co2.toPrecision(3));
      process.stdout.write(' g CO² ');
      process.stdout.write(`(bytes: ${totalBytes})\n`);
    }

    if (co2) {
      this.output.add(url, { co2, totalBytes });
    }

    if (this.currentUrl == this.totalUrls) {
      const renderOutput = this.output.render(this.outputType);

      const testResult: TestResult = {
        filename: renderOutput,
        numberOfUrls: this.totalUrls,
        numberOfUrlsWithErrors: 0,
      };
      this.testResolve(testResult);
    }
  }
}
