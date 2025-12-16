#!/usr/bin/env node
"use strict";

import colors from "colors";
import { Helper } from "../libs/helpers";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import mustache from "mustache";
import open, { apps } from "open";
import { RefreshServer } from "../tester/refresh-server";
import { TestResult } from "../tester/types";

export class ScreenshotTool {
  private urls: string[] = [];
  private totalUrls = 0;
  private verbose = true;
  private siteVersion = "original";
  private limitUrls = 0;
  private path: string = "";
  private output = [];
  private diffMargin = 100;
  private snippet = false;
  private testResolve: any;

  constructor() {
    colors.enable();
  }

  public index(
    sitemapUrl: string | null,
    url = "",
    siteVersion: string = "original",
    verbose: boolean = true,
    limitUrls = 0
  ) {
    this.verbose = verbose;
    this.limitUrls = limitUrls;
    this.siteVersion = siteVersion;

    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(",");
    }

    if (sitemapUrl) {
      Promise.resolve()
        .then(() => {
          Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls, this.limitUrls).then((urls) => {
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

  public retest(url: string, siteVersion: string = "altered") {
    this.siteVersion = siteVersion;
    this.snippet = true;
    const urlObj = new URL(url);
    this.path = urlObj.hostname;
    this.indexUrl(url);
    const testPromise = new Promise((resolve, reject) => {
      this.testResolve = resolve;
    });
    return testPromise;
  }

  private indexUrls() {
    const urlObj = new URL(this.urls[0]);
    this.totalUrls = this.urls.length;
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
        console.log(
          colors.gray.underline(`📸 Rendering (${this.totalUrls - this.urls.length}/${this.totalUrls}): ${url}`)
        );
        const browser = await puppeteer.launch();
        const filePrefix = this.siteVersion === "original" ? "a_" : "b_";
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
          await page.goto(url, { waitUntil: "networkidle2" });
          await page.screenshot({
            path: `./public/screenshots/${this.path}/${filePrefix}${this.convertUrlToFilename(url)}.png`,
            fullPage: true,
          });
          console.log(colors.green.underline(`✅ Rendered: ${url}`));

          if (this.siteVersion === "altered") {
            const img1 = PNG.sync.read(
              fs.readFileSync(`./public/screenshots/${this.path}/a_${this.convertUrlToFilename(url)}.png`)
            );
            const img2 = PNG.sync.read(
              fs.readFileSync(`./public/screenshots/${this.path}/b_${this.convertUrlToFilename(url)}.png`)
            );
            if (!img1 || !img2) {
              throw new Error("One of the images to compare is missing");
            }

            const diffDimensions = {
              width: Math.max(img1.width, img2.width),
              height: Math.max(img1.height, img2.height),
            };

            const resizedImg1 = this.createResized(img1, diffDimensions);
            const resizedImg2 = this.createResized(img2, diffDimensions);

            const diff = new PNG(diffDimensions);

            const result = pixelmatch.default(
              resizedImg1.data,
              resizedImg2.data,
              diff.data,
              diffDimensions.width,
              diffDimensions.height,
              { threshold: 0.1 }
            );

            fs.writeFileSync(
              `./public/screenshots/${this.path}/a_${this.convertUrlToFilename(url)}.png`,
              PNG.sync.write(resizedImg1)
            );
            fs.writeFileSync(
              `./public/screenshots/${this.path}/b_${this.convertUrlToFilename(url)}.png`,
              PNG.sync.write(resizedImg2)
            );

            if (result <= this.diffMargin) {
              console.log(colors.green.underline(`✅ No differences found: ${url}`));
            }
            if (result > this.diffMargin) {
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

              const filename = this.convertUrlToFilename(url);
              this.output.push({
                id: `diff-${this.output.length + 1}`,
                url: url,
                beforeImage: path.resolve(`./public/screenshots/${this.path}/a_${filename}.png`),
                afterImage: path.resolve(`./public/screenshots/${this.path}/b_${filename}.png`),
                diffImage: path.resolve(`./public/screenshots/${this.path}/d_${filename}.png`),
              });
            }
          }
        } catch (e) {
          console.log(e);
        } finally {
          await browser.close();
          if (this.urls.length > 0) {
            this.indexUrl(this.urls.pop() as string);
          } else {
            if (this.siteVersion === "altered") {
              this.renderOutput();
            } else {
              console.log(colors.green.underline(`✅ Screenshot indexing completed.`));
            }
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
    if (!filename || filename === "/") {
      filename = "home";
    }
    filename = filename.replace(/(^\w+:|^)\/\//, ""); // Remove protocol
    filename = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase(); // Replace non-alphanumeric characters with underscores
    if (filename.length > 120) {
      filename = filename.substring(0, 120); // Limit length to 120 characters
    }
    return filename;
  }

  private renderOutput() {
    const now = new Date();
    let fileName = "";
    let filePath = "";
    let body = "";
    const manifest = Helper.getFrontendManifest();

    fileName = `diff-report-${now.getTime()}.html`;
    filePath = `./public/tmp/${fileName}`;
    if (!this.snippet) {
      Helper.clearDirectory("./public/tmp");
    }

    const template = fs.readFileSync("./templates/updateDiff.html", "utf8");
    body = mustache.render(template, {
      manifest: manifest,
      urls: this.output,
    });

    if (!this.snippet) {
      fs.writeFile(filePath, body, (err: any) => {
        if (err) throw err;
        const fullPath = path.resolve(process.cwd(), filePath);
        open.default(`file://${fullPath}`, {
          app: {
            name: apps.chrome,
            arguments: ["--allow-file-access-from-files"],
          },
        });

        const refreshServer = new RefreshServer();
        refreshServer.listenForDiffChanges();
      });
    } else {
      const testResult = {
        body: body,
      };
      this.testResolve(testResult);
    }
  }
}
