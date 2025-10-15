#!/usr/bin/env node
'use strict';

import colors from 'colors';
import { Helper } from '../libs/helpers';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export class ScreenshotTool {
  private urls: string[] = [];
  private verbose = true;
  private siteVersion = 'original';
  private limitUrls = 0;
  private path: string = '';

  constructor() {
    colors.enable();
  }

  public index(
    sitemapUrl: string | null,
    url = '',
    siteVersion: string = 'original',
    verbose: boolean = true,
    limitUrls = 0
  ) {
    this.verbose = verbose;
    this.limitUrls = limitUrls;
    this.siteVersion = siteVersion;

    console.log(sitemapUrl);

    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(',');
    }

    if (sitemapUrl) {
      Promise.resolve()
        .then(() => {
          Helper.getUrlsFromSitemap(sitemapUrl, '', this.urls, this.limitUrls).then((urls) => {
            if (urls) {
              this.urls = urls;
              this.indexUrls();
            }
          });
        })
        .catch((error) => {
          // Handle any errors
          console.error(error.message);
          process.exit(1);
        });
    } else {
      this.indexUrls();
    }
  }

  private indexUrls() {
    const urlObj = new URL(this.urls[0]);
    this.path = urlObj.hostname;
    const screenshotsDir = path.join(`./public/screenshots`, this.path);
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    Promise.resolve()
      .then(() => {
        if (this.verbose) {
          console.log(colors.cyan.underline(`Indexing: ${this.urls.length}`));
        }

        // Run the tests
        if (this.urls.length > 0) {
          this.indexUrl(this.urls.pop() as string);
        }
      })
      .catch((error) => {
        // Handle any errors
        console.error(error.message);
        process.exit(1);
      });
  }

  private indexUrl(url: string) {
    Promise.resolve().then(async () => {
      try {
        console.log(colors.gray.underline(`📸 Rendering: ${url}`));
        const browser = await puppeteer.launch();
        const filePrefix = this.siteVersion === 'original' ? 'a_' : 'b_';
        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 1400, height: 800, deviceScaleFactor: 2 });
          if (import.meta.env.VITE_COOKIE_NAME && import.meta.env.VITE_COOKIE_VALUE) {
            await page.setCookie({
              name: import.meta.env.VITE_COOKIE_NAME,
              value: import.meta.env.VITE_COOKIE_VALUE,
              domain: new URL(url).hostname,
            });
          }
          await page.goto(url, { waitUntil: 'networkidle2' });
          await page.screenshot({
            path: `./public/screenshots/${this.path}/${filePrefix}${this.convertUrlToFilename(url)}.png`,
            fullPage: true,
          });
          console.log(colors.green.underline(`✅ Rendered: ${url}`));

          if (this.siteVersion === 'altered') {
            const img1 = PNG.sync.read(
              fs.readFileSync(`./public/screenshots/${this.path}/a_${this.convertUrlToFilename(url)}.png`)
            );
            const img2 = PNG.sync.read(
              fs.readFileSync(`./public/screenshots/${this.path}/b_${this.convertUrlToFilename(url)}.png`)
            );
            if (!img1 || !img2) {
              throw new Error('One of the images to compare is missing');
            }

            const diffDimensions = {
              width: Math.max(img1.width, img2.width),
              height: Math.max(img1.height, img2.height),
            };

            const resizedImg1 = this.createResized(img1, diffDimensions);
            const resizedImg2 = this.createResized(img2, diffDimensions);

            const diff = new PNG(diffDimensions);

            const result = pixelmatch(
              resizedImg1.data,
              resizedImg2.data,
              diff.data,
              diffDimensions.width,
              diffDimensions.height,
              { threshold: 0.1 }
            );

            if (result === 0) {
              console.log(colors.green.underline(`✅ No differences found: ${url}`));
            }
            if (result > 10) {
              console.log(colors.red.underline(`❌ Differences found: ${url}`));
              console.log(colors.red.underline(`👾 Number of different pixels: ${result}`));
              fs.writeFileSync(
                `./public/screenshots/${this.path}/d_${this.convertUrlToFilename(url)}.png`,
                PNG.sync.write(diff)
              );
              console.log(
                colors.red.underline(
                  `🔗 Diff saved: file://${path.resolve(
                    `./public/screenshots/${this.path}/d_${this.convertUrlToFilename(url)}.png`
                  )}`
                )
              );
            }
          }
        } catch (e) {
          console.log(e);
        } finally {
          await browser.close();
          if (this.urls.length > 0) {
            this.indexUrl(this.urls.pop() as string);
          }
        }
      } catch (error) {
        console.log(error);
        console.log(colors.red.underline(`❌ Error rendering: ${url}`));
        if (this.urls.length > 0) {
          this.indexUrl(this.urls.pop() as string);
        }
      }
    });
  }

  private createResized(img, dimensions) {
    if (img.width > dimensions.width || img.height > dimensions.height) {
      throw new Error(`New dimensions expected to be greater than or equal to the original dimensions!`);
    }
    const resized = new PNG(dimensions);
    PNG.bitblt(img, resized, 0, 0, img.width, img.height);

    return resized;
  }

  private convertUrlToFilename(url: string) {
    const urlObj = new URL(url);
    let filename = urlObj.pathname + urlObj.search + urlObj.hash;
    if (!filename || filename === '/') {
      filename = 'home';
    }
    filename = filename.replace(/(^\w+:|^)\/\//, ''); // Remove protocol
    filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Replace non-alphanumeric characters with underscores
    if (filename.length > 120) {
      filename = filename.substring(0, 120); // Limit length to 120 characters
    }
    return filename;
  }
}
