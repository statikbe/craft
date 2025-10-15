"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const colors = require("colors");
const prompts = require("prompts");
const fs$1 = require("fs");
const node = require("html-validate/node");
const cheerio = require("cheerio");
const path$1 = require("path");
const mustache = require("mustache");
const open = require("open");
const express = require("express");
const cors = require("cors");
const pa11y = require("pa11y");
const uniqueSelector = require("cheerio-get-css-selector");
const cliProgress = require("cli-progress");
const excel = require("node-excel-export");
const dns = require("node:dns");
const puppeteer = require("puppeteer");
const pngjs = require("pngjs");
const pixelmatch = require("pixelmatch");
const ora = require("ora");
const child_process = require("child_process");
const util = require("util");
const os = require("os");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs$1);
const cheerio__namespace = /* @__PURE__ */ _interopNamespaceDefault(cheerio);
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path$1);
const pa11y__namespace = /* @__PURE__ */ _interopNamespaceDefault(pa11y);
const uniqueSelector__namespace = /* @__PURE__ */ _interopNamespaceDefault(uniqueSelector);
const cliProgress__namespace = /* @__PURE__ */ _interopNamespaceDefault(cliProgress);
const excel__namespace = /* @__PURE__ */ _interopNamespaceDefault(excel);
const os__namespace = /* @__PURE__ */ _interopNamespaceDefault(os);
const _Helper = class _Helper {
  constructor() {
  }
  static getFrontendManifest() {
    const manifest = JSON.parse(fs__namespace.readFileSync("./public/frontend/.vite/manifest.json", "utf8"));
    return Object.keys(manifest).reduce((acc, key) => {
      const newKey = key.split("/").join("").replace(".", "");
      acc[newKey] = manifest[key];
      return acc;
    }, {});
  }
};
_Helper.getUrlsFromSitemap = (sitemapUrl, sitemapExclude, urls, limitUrls = 0) => {
  const baseUrlCount = {};
  return Promise.resolve().then(
    () => fetch(sitemapUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
      }
    })
  ).then((response) => response.text()).then((body) => {
    const $ = cheerio__namespace.load(body, { xmlMode: true });
    const isSitemapIndex = $("sitemapindex").length > 0;
    if (isSitemapIndex) {
      return Promise.all(
        $("sitemap > loc").toArray().map((element) => {
          return _Helper.getUrlsFromSitemap($(element).text(), sitemapExclude, urls, limitUrls);
        })
      ).then((configs) => {
        return configs.pop();
      });
    }
    $("url > loc").toArray().forEach((element) => {
      let url = $(element).text();
      const extension = new RegExp(/\.[0-9a-z]+$/i);
      if (sitemapExclude.length > 0 && url.match(sitemapExclude) || url.match(extension)) {
        return;
      }
      const urlParts = url.split("/");
      const baseUrl = urlParts.slice(0, -1).join("/");
      if (limitUrls > 0 && urlParts.length > 4) {
        if (!baseUrlCount[baseUrl]) {
          baseUrlCount[baseUrl] = 0;
        }
        if (baseUrlCount[baseUrl] >= limitUrls) {
          return;
        }
        baseUrlCount[baseUrl]++;
      }
      urls.push(url);
    });
    return urls;
  }).catch((error) => {
    if (error.stack && error.stack.includes("node-fetch")) {
      throw new Error(`The sitemap "${sitemapUrl}" could not be loaded`);
    }
    console.log(error);
    throw new Error(`The sitemap "${sitemapUrl}" could not be parsed`);
  });
};
_Helper.clearDirectory = (directory) => {
  return new Promise((resolve, reject) => {
    fs__namespace.readdir(directory, (err, files) => {
      if (err) reject(err);
      if (files) {
        for (const file of files) {
          fs__namespace.unlink(path$1.join(directory, file), (err2) => {
            if (err2) reject(err2);
          });
        }
      }
      resolve();
    });
  });
};
let Helper = _Helper;
class A11yTester {
  constructor() {
    this.external = false;
    this.currentUrl = 1;
    this.totalUrls = 0;
    this.totalErrorUrls = 0;
    this.urls = [];
    this.outputType = "cli";
    this.verbose = true;
    this.limitUrls = 0;
    this.testPromise = null;
    this.level = "WCAG2AAA";
    colors.enable();
    this.output = new Output("a11yTester", "");
  }
  test(sitemapUrl, url = "", external = false, output = "cli", verbose = true, level = "WCAG2AAA", limitUrls = 0) {
    this.outputType = output;
    this.verbose = verbose;
    this.external = external;
    this.level = level;
    this.limitUrls = limitUrls;
    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(",");
    }
    if (sitemapUrl) {
      Promise.resolve().then(() => {
        Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls, this.limitUrls).then((urls) => {
          if (urls) {
            this.testUrls();
          }
        });
      }).catch((error) => {
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
  testUrls() {
    if (this.verbose) {
      console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS
`));
    }
    this.output = new Output("a11yTester", new URL(this.urls[0]).origin);
    this.totalUrls = this.urls.length;
    this.currentUrl = 0;
    if (this.external && this.urls.length > 0) {
      this.testUrl(this.urls.pop());
    } else {
      const promesses = [];
      this.urls.forEach((url) => {
        promesses.push(this.testUrl(url));
      });
      Promise.all(promesses).then(() => {
        this.output.render(this.outputType);
      });
    }
  }
  testUrl(url) {
    return pa11y__namespace.default(url, {
      runners: ["htmlcs"],
      standard: this.level,
      userAgent: "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
    }).then((results) => {
      this.currentUrl++;
      if (this.verbose) {
        process.stdout.write(colors.cyan(" > "));
        process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
        process.stdout.write(url);
        process.stdout.write(" - ");
        if (results.issues.length == 0) {
          console.log(colors.green("0 errors"));
        } else {
          console.log(colors.red(`${results.issues.length} errors`));
          this.totalErrorUrls++;
        }
      }
      results.issues.forEach((issue) => {
        this.output.add(url, {
          message: issue.message,
          selector: issue.selector,
          context: issue.context
        });
      });
      this.checkNext();
    }).catch((error) => {
      console.log(error);
      this.currentUrl++;
      this.checkNext();
    });
  }
  checkNext() {
    if (this.external && this.urls.length > 0) {
      setTimeout(() => {
        this.testUrl(this.urls.pop());
      }, 100);
    }
    if (this.external && this.urls.length == 0) {
      const renderOutput = this.output.render(this.outputType);
      const testResult = {
        filename: renderOutput,
        numberOfUrls: this.totalUrls,
        numberOfUrlsWithErrors: this.totalErrorUrls
      };
      this.testResolve(testResult);
    }
  }
}
class LinkTester {
  constructor() {
    this.external = false;
    this.urls = [];
    this.outputType = "cli";
    this.verbose = true;
    this.testPromise = null;
    this.totalUrls = 0;
    this.totalErrorUrls = 0;
    colors.enable();
    this.output = new Output("linkTester", "");
  }
  test(sitemapUrl, url = "", external = false, output = "cli", verbose = true) {
    this.external = external;
    this.outputType = output;
    this.verbose = verbose;
    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(",");
    }
    this.totalUrls = this.urls.length;
    if (sitemapUrl) {
      Promise.resolve().then(() => {
        Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls).then((urls) => {
          if (urls) {
            this.urls = urls;
            this.totalUrls = urls.length;
            this.testUrls();
          }
        });
      }).catch((error) => {
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
  testUrls() {
    this.output = new Output("linkTester", new URL(this.urls[0]).origin);
    Promise.resolve().then(() => {
      if (this.verbose) {
        console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS
`));
      }
      let uniqueLinks = [];
      const baseUrl = this.urls[0].split("/")[0] + "//" + this.urls[0].split("/")[2];
      this.testLinks(baseUrl, uniqueLinks);
    }).catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
  }
  testLinks(baseUrl, uniqueLinks) {
    this.testLink(this.urls[0], baseUrl, uniqueLinks).then((result) => {
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
        const testResult = {
          filename: renderOutput,
          numberOfUrls: this.totalUrls,
          numberOfUrlsWithErrors: this.totalErrorUrls
        };
        this.testResolve(testResult);
      }
    });
  }
  testLink(url, baseUrl, uniqueLinks) {
    return new Promise((resolveTest, rejectTest) => {
      Promise.resolve().then(
        () => fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
          }
        })
      ).then((response) => response.text()).then((body) => {
        Promise.resolve().then(() => {
          let totalErrors = 0;
          let urlsChecked = 0;
          const $ = cheerio__namespace.load(body);
          uniqueSelector__namespace.init($);
          const elementsAnchors = $("a[href]").toArray().filter((element) => {
            const href = $(element).attr("href");
            return href && href.startsWith("http");
          });
          const elementsLinks = $("link[href]").toArray().filter(
            (element) => $(element).attr("rel") != "canonical" && $(element).attr("rel") != "alternate" && $(element).attr("rel") != "preconnect"
          ).map((element) => {
            const href = $(element).attr("href");
            if (href && href.startsWith("http")) return element;
            else
              return $(element).attr("href", baseUrl + href).get(0);
          });
          const elementsScripts = $("script[src]").toArray();
          const elementsImages = $("img[src]").toArray().map((element) => {
            const src = $(element).attr("src");
            if (src && src.startsWith("http")) return element;
            else if (src && src.startsWith("data")) return element;
            else
              return $(element).attr("src", baseUrl + src).get(0);
          });
          let elements = [...elementsAnchors, ...elementsLinks, ...elementsScripts, ...elementsImages];
          elements = elements.map((element) => {
            let link = "";
            if (!element) return element;
            if (element.tagName == "a" || element.tagName == "link") link = $(element).attr("href") ?? "";
            else if (element.tagName == "script" || element.tagName == "img") link = $(element).attr("src") ?? "";
            if (element.tagName == "img" && link.startsWith("data")) {
              const srcset = $(element).attr("srcset");
              if (srcset) {
                link = srcset.split(" ")[0];
              }
              if (link.indexOf("http") == -1) {
                link = baseUrl + link;
              }
            }
            $(element).attr("data-url", link);
            return element;
          });
          elements = elements.filter((element) => {
            const dataUrl = $(element).attr("data-url");
            if (dataUrl) {
              if (uniqueLinks.indexOf(dataUrl) >= 0) return false;
              else {
                uniqueLinks.push(dataUrl);
                return true;
              }
            } else return false;
          });
          let bar = null;
          if (this.verbose) {
            bar = new cliProgress__namespace.SingleBar(
              {
                clearOnComplete: false,
                hideCursor: true,
                format: (options, params, payload) => {
                  const bar2 = options.barCompleteString.substr(0, Math.round(params.progress * options.barsize));
                  const barIncomplete = options.barIncompleteString.substr(
                    Math.round(params.progress * options.barsize) + 1
                  );
                  return bar2 + barIncomplete + " | " + payload.url + " | Links checked: " + params.value + "/" + params.total + " | " + (payload.errors == 0 ? colors.green(payload.errors + " errors") : colors.red(payload.errors + " errors"));
                }
              },
              cliProgress__namespace.Presets.shades_grey
            );
            bar.start(elements.length, 0, {
              url,
              errors: totalErrors
            });
          }
          if (elements.length == 0) {
            if (this.verbose && bar) {
              bar.stop();
            }
            resolveTest({
              uniqueLinks
            });
          }
          const totalElements = elements.length;
          const checkLink = (element) => {
            const dataUrl = $(element).attr("data-url");
            if (!dataUrl) return;
            if (!element) return;
            fetch(dataUrl, {
              signal: AbortSignal.timeout(1e4),
              headers: {
                "User-Agent": "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
              }
            }).then((response) => {
              if (response.status >= 400) {
                this.output.add(url, {
                  url: dataUrl,
                  status: response.status.toString(),
                  tag: `<${element.tagName}>`,
                  selector: $(element).getUniqueSelector(),
                  linkText: $(element).text()
                });
                totalErrors++;
              } else {
                this.output.add(url, {
                  url: dataUrl,
                  status: response.status.toString()
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
                  uniqueLinks
                });
              }
            }).catch((error) => {
              this.output.add(url, {
                url: dataUrl,
                status: error.cause ? error.cause.code : error,
                tag: `<${element.tagName}>`,
                selector: $(element).getUniqueSelector(),
                linkText: $(element).text()
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
                  uniqueLinks
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
      }).catch((error) => {
        rejectTest(error);
      });
    });
  }
}
class RefreshServer {
  constructor() {
    this.app = express();
    this.app.use(cors());
    this.app.listen(3030, () => {
      console.log("Server running on port 3030");
    });
    this.app.use(express.static("public"));
  }
  listenForA11yChanges() {
    this.app.get("/a11y-retest", cors(), (req, res, next) => {
      console.log("a11y-retest", req.query);
      const session = JSON.parse(fs__namespace.readFileSync("./data/session.json", "utf8"));
      const a11yTester = new A11yTester();
      a11yTester.test(null, req.query.url, true, "html-snippet", true, false, session.level ? session.level : "WCAG2AAA").then((result) => {
        res.json(result.filename);
      });
    });
  }
  listenForHtmlChanges() {
    this.app.get("/html-retest", cors(), (req, res, next) => {
      console.log("html-retest", req.query);
      const htmlTester = new HTMLTester();
      htmlTester.test(null, req.query.url, true, "html-snippet", true).then((result) => {
        res.json(result.filename);
      });
    });
  }
  listenForLinksChanges() {
    this.app.get("/links-retest", cors(), (req, res, next) => {
      console.log("links-retest", req.query);
      const linksTester = new LinkTester();
      linksTester.test(null, req.query.url, true, "html-snippet", true).then((result) => {
        res.json(result.filename);
      });
    });
  }
}
class HTMLRenderer {
  constructor(outputHTML) {
    this.outputHTML = [];
    this.outputHTML = outputHTML;
  }
  renderHTMLOutputConsole() {
    let output = "";
    this.outputHTML.forEach((outputType) => {
      output += colors.underline.cyan(`${outputType.url} - ${outputType.errorMessages.length} errors

`);
      outputType.errorMessages.forEach((message) => {
        output += ` ${colors.red("•")} ${message.message}
`;
        if (message.selector) {
          output += `   ${colors.yellow(message.selector)}
`;
        }
        if (message.ruleId && message.line && message.column) {
          output += `   ${colors.dim(message.ruleId)} - line: ${message.line} | column: ${message.column}
`;
        }
        if (message.ruleUrl) {
          output += `   ${colors.dim.underline.italic(message.ruleUrl)}
`;
        }
        output += "\n";
      });
    });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }
  renderHTMLOutputHTML(url, snippet = false) {
    const now = /* @__PURE__ */ new Date();
    const mainUrl = new URL(url);
    let fileName = "";
    let path2 = "";
    let body = "";
    const manifest = Helper.getFrontendManifest();
    this.outputHTML.map((output) => {
      output.numberOfErrors = output.errorMessages.length;
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, "");
    });
    fileName = `${now.getTime()}.html`;
    path2 = `./public/tmp/${fileName}`;
    if (!snippet) {
      Helper.clearDirectory("./public/tmp");
    }
    const template = fs__namespace.readFileSync("./templates/htmlTester.html", "utf8");
    body = mustache.render(template, {
      manifest,
      mainUrl: mainUrl.origin,
      date: now.toLocaleString(),
      local: true,
      testedUrls: this.outputHTML
    });
    if (!snippet) {
      fs__namespace.writeFile(path2, body, (err) => {
        if (err) throw err;
        open.default(`http://localhost:3030/tmp/${fileName}`, {
          app: {
            name: open.apps.chrome,
            arguments: ["--allow-file-access-from-files"]
          }
        });
        const refreshServer = new RefreshServer();
        refreshServer.listenForHtmlChanges();
      });
    }
    if (snippet) {
      return body;
    } else {
      return fileName;
    }
  }
}
class A11yRenderer {
  constructor(outputA11y) {
    this.outputA11y = [];
    this.outputA11y = outputA11y;
  }
  renderA11yOutputConsole() {
    let output = "";
    this.outputA11y.forEach((outputType) => {
      output += colors.cyan(`
> Errors for: ${outputType.url}

`);
      outputType.errorMessages.forEach((message) => {
        output += `------------------------

`;
        output += `${colors.red(`${message.message}`)}

`;
        if (message.selector) {
          output += `${colors.yellow(message.selector)}

`;
        }
        if (message.context) {
          output += `${colors.gray(message.context)}

`;
        }
      });
    });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }
  renderA11yOutputHTML(url, snippet = false) {
    const now = /* @__PURE__ */ new Date();
    let fileName = "";
    let path2 = "";
    let body = "";
    const manifest = Helper.getFrontendManifest();
    const mainUrl = new URL(url);
    this.outputA11y.map((output) => {
      output.numberOfErrors = output.errorMessages.length;
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, "");
    });
    fileName = `${now.getTime()}.html`;
    path2 = `./public/tmp/${fileName}`;
    if (!snippet) {
      Helper.clearDirectory("./public/tmp");
    }
    const template = fs__namespace.readFileSync("./templates/a11yTester.html", "utf8");
    body = mustache.render(template, {
      manifest,
      mainUrl: mainUrl.origin,
      date: now.toLocaleString(),
      local: true,
      testedUrls: this.outputA11y
    });
    if (!snippet) {
      fs__namespace.writeFile(path2, body, (err) => {
        if (err) throw err;
        open.default(`http://localhost:3030/tmp/${fileName}`, {
          app: {
            name: "google chrome",
            arguments: ["--allow-file-access-from-files"]
          }
        });
        const refreshServer = new RefreshServer();
        refreshServer.listenForA11yChanges();
      });
    }
    if (snippet) {
      return body;
    } else {
      return fileName;
    }
  }
}
class LinksRenderer {
  constructor(outputLinks = []) {
    this.outputLinks = outputLinks;
  }
  renderBrokenLinkOutputConsole() {
    let output = "";
    this.outputLinks.filter((f) => f.brokenLinks.find((bl) => bl.status != "200")).forEach((outputType) => {
      output += colors.cyan(`> Errors for: ${outputType.url}

`);
      outputType.brokenLinks.filter((bl) => bl.status != "200").forEach((link) => {
        output += ` ${colors.red("•")} ${colors.red(`${link.status}`)} : ${link.url}
`;
        output += `   ${colors.yellow(
          link.linkText && link.linkText.length ? link.linkText : link.tag ?? ""
        )} : 
   ${colors.yellow(link.selector ?? "")}

`;
      });
    });
    if (output.length > 0) {
      process.stdout.write(output);
      process.exit();
    }
  }
  renderBrokenLinkOutputHTML(url, snippet = false) {
    const now = /* @__PURE__ */ new Date();
    let fileName = "";
    let path2 = "";
    let body = "";
    const manifest = Helper.getFrontendManifest();
    const mainUrl = new URL(url);
    this.outputLinks.map((output) => {
      output.numberOfErrors = output.brokenLinks.filter((bl) => bl.status != "200").length;
      output.numberOfOKLinks = output.brokenLinks.filter((bl) => bl.status == "200").length;
      output.okLinks = output.brokenLinks.filter((bl) => bl.status == "200");
      output.brokenLinks = output.brokenLinks.filter((bl) => bl.status != "200");
      output.id = output.url.replace(/[^a-zA-Z0-9]/g, "");
    });
    fileName = `${now.getTime()}.html`;
    path2 = `./public/tmp/${fileName}`;
    if (!snippet) {
      Helper.clearDirectory("./public/tmp");
    }
    const template = fs__namespace.readFileSync("./templates/linkTester.html", "utf8");
    body = mustache.render(template, {
      manifest,
      mainUrl: mainUrl.origin,
      date: now.toLocaleString(),
      local: true,
      testedUrls: this.outputLinks
    });
    if (!snippet) {
      fs__namespace.writeFile(path2, body, (err) => {
        if (err) throw err;
        open.default(`http://localhost:3030/tmp/${fileName}`, {
          app: {
            name: open.apps.chrome,
            arguments: ["--allow-file-access-from-files"]
          }
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
  renderBrokenLinkOutputExcel(url, compare = false) {
    this.outputLinks.map((output) => {
      output.numberOfErrors = output.brokenLinks.filter((bl) => bl.status != "200").length;
      output.brokenLinks = output.brokenLinks.filter((bl) => bl.status != "200");
    });
    const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: "FFCCCCCC"
          }
        },
        font: {
          color: {
            rgb: "FF000000"
          },
          sz: 14,
          bold: true
        },
        alignment: {
          vertical: "top"
        }
      },
      cell: {
        alignment: {
          vertical: "top"
        }
      }
    };
    const specification = {
      url: {
        displayName: "URL",
        headerStyle: styles.headerDark,
        width: 300
      },
      status: {
        displayName: "Status",
        headerStyle: styles.headerDark,
        width: 200
      },
      link: {
        displayName: "Link",
        headerStyle: styles.headerDark,
        width: 200
      },
      ...compare ? {
        linkText: {
          displayName: "Link Text",
          headerStyle: styles.headerDark,
          width: 200
        }
      } : {}
    };
    const dataset = [];
    const merges = [];
    let currentRow = 2;
    this.outputLinks.forEach((outputType) => {
      outputType.brokenLinks.forEach((output) => {
        const row = {
          url: {
            value: outputType.url,
            style: styles.cell
          },
          status: output.status,
          link: output.url,
          ...compare ? { linkText: output.linkText } : {}
        };
        dataset.push(row);
      });
      const merge = {
        start: { row: currentRow, column: 1 },
        end: { row: currentRow + outputType.brokenLinks.length - 1, column: 1 }
      };
      merges.push(merge);
      currentRow += outputType.brokenLinks.length;
    });
    const report = excel__namespace.buildExport([
      {
        name: "Report",
        merges,
        specification,
        data: dataset
      }
    ]);
    const fileName = `link-test-${url.replace(/[^a-zA-Z0-9]/g, "")}.xlsx`;
    const path2 = `./public/excel/${fileName}`;
    fs__namespace.writeFileSync(path2, report);
    open.default(path2, {
      app: {
        name: open.apps.chrome,
        arguments: ["--allow-file-access-from-files"]
      }
    });
    return path2;
  }
}
class HeadingRenderer {
  constructor(outputHTML) {
    this.outputHTML = [];
    this.outputHTML = outputHTML;
  }
  renderHeadingOutputExcel(url) {
    const styles = {
      headerDark: {
        fill: {
          fgColor: {
            rgb: "FFCCCCCC"
          }
        },
        font: {
          color: {
            rgb: "FF000000"
          },
          sz: 14,
          bold: true
        }
      }
    };
    const specification = {
      url: {
        displayName: "URL",
        headerStyle: styles.headerDark,
        width: 300
      },
      error: {
        displayName: "Error",
        headerStyle: styles.headerDark,
        width: 200
      },
      headingText: {
        displayName: "Heading Text",
        headerStyle: styles.headerDark,
        width: 200
      }
    };
    const dataset = [];
    this.outputHTML.forEach((outputType) => {
      outputType.errorMessages.forEach((message) => {
        const row = {
          url: outputType.url,
          error: message.message,
          headingText: message.elementText
        };
        dataset.push(row);
      });
    });
    const report = excel__namespace.buildExport([
      {
        name: "Report",
        specification,
        data: dataset
      }
    ]);
    const fileName = `heading-test-${url.replace(/[^a-zA-Z0-9]/g, "")}.xlsx`;
    const path2 = `./public/excel/${fileName}`;
    fs__namespace.writeFileSync(path2, report);
    open.default(path2, {
      app: {
        name: open.apps.chrome,
        arguments: ["--allow-file-access-from-files"]
      }
    });
    return path2;
  }
}
class Output {
  constructor(type, url) {
    this.outputHTML = [];
    this.outputLinks = [];
    this.outputA11y = [];
    this.outputType = type;
    this.url = url;
  }
  add(url, errorMessage) {
    switch (this.outputType) {
      case "a11yTester":
        this.addAlly(url, errorMessage);
        break;
      case "htmlTester":
        this.addHTML(url, errorMessage);
        break;
      case "linkTester":
        this.addBrokenLink(url, errorMessage);
        break;
      case "headingTester":
        this.addHTML(url, errorMessage);
        break;
      case "compareLinksTester":
        this.addBrokenLink(url, errorMessage);
        break;
    }
  }
  render(type) {
    switch (this.outputType) {
      case "a11yTester":
        return this.renderA11yOutput(type);
      case "htmlTester":
        return this.renderHTMLOutput(type);
      case "linkTester":
        return this.renderBrokenLinkOutput(type);
      case "headingTester":
        return this.renderHeadingOutput(type);
      case "compareLinksTester":
        return this.renderBrokenLinkOutput(type, true);
    }
    return "";
  }
  addAlly(url, errorMessage) {
    const output = this.outputA11y.find((output2) => output2.url === url);
    if (output) {
      output.errorMessages.push(errorMessage);
    } else {
      this.outputA11y.push({
        url,
        errorMessages: [errorMessage]
      });
    }
  }
  addHTML(url, errorMessage) {
    const output = this.outputHTML.find((output2) => output2.url === url);
    if (output) {
      output.errorMessages.push(errorMessage);
    } else {
      this.outputHTML.push({
        url,
        errorMessages: [errorMessage]
      });
    }
  }
  addBrokenLink(url, errorMessage) {
    const output = this.outputLinks.find((output2) => output2.url === url);
    if (output) {
      output.brokenLinks.push(errorMessage);
    } else {
      this.outputLinks.push({
        url,
        brokenLinks: [errorMessage]
      });
    }
  }
  renderA11yOutput(type) {
    const a11yRenderer = new A11yRenderer(this.outputA11y);
    switch (type) {
      case "cli":
        a11yRenderer.renderA11yOutputConsole();
        break;
      case "json":
        return JSON.stringify(this.outputA11y);
      case "html-snippet":
        return a11yRenderer.renderA11yOutputHTML(this.url, true);
      case "html":
        return a11yRenderer.renderA11yOutputHTML(this.url);
    }
    return "";
  }
  renderHTMLOutput(type) {
    const htmlRenderer = new HTMLRenderer(this.outputHTML);
    switch (type) {
      case "cli":
        htmlRenderer.renderHTMLOutputConsole();
        break;
      case "json":
        return JSON.stringify(this.outputHTML);
      case "html-snippet":
        return htmlRenderer.renderHTMLOutputHTML(this.url, true);
      case "html":
        return htmlRenderer.renderHTMLOutputHTML(this.url);
    }
    return "";
  }
  renderHeadingOutput(type) {
    const htmlRenderer = new HTMLRenderer(this.outputHTML);
    const headingRenderer = new HeadingRenderer(this.outputHTML);
    switch (type) {
      case "cli":
        htmlRenderer.renderHTMLOutputConsole();
        break;
      case "json":
        return JSON.stringify(this.outputHTML);
      case "excel":
        return headingRenderer.renderHeadingOutputExcel(this.url);
      case "html":
        return htmlRenderer.renderHTMLOutputHTML(this.url);
    }
    return "";
  }
  renderBrokenLinkOutput(type, compare = false) {
    const linksRenderer = new LinksRenderer(this.outputLinks);
    switch (type) {
      case "cli":
        linksRenderer.renderBrokenLinkOutputConsole();
        break;
      case "json":
        return JSON.stringify(this.outputLinks);
      case "html-snippet":
        return linksRenderer.renderBrokenLinkOutputHTML(this.url, true);
      case "html":
        return linksRenderer.renderBrokenLinkOutputHTML(this.url);
      case "excel":
        return linksRenderer.renderBrokenLinkOutputExcel(this.url, compare);
    }
    return "";
  }
}
class HTMLTester {
  constructor() {
    this.currentUrl = 1;
    this.totalUrls = 0;
    this.totalErrorUrls = 0;
    this.external = false;
    this.urls = [];
    this.outputType = "cli";
    this.verbose = true;
    this.limitUrls = 0;
    this.testPromise = null;
    colors.enable();
    this.output = new Output("htmlTester", "");
    this.htmlvalidate = new node.HtmlValidate({
      elements: ["html5"],
      extends: ["html-validate:recommended"],
      rules: {
        "void-style": "off",
        "no-trailing-whitespace": "off",
        "no-inline-style": "off",
        "wcag/h71": "off",
        "wcag/h63": "off",
        "script-type": "off",
        "long-title": "off",
        "no-raw-characters": "off",
        "attribute-boolean-style": "off",
        "valid-id": ["error", { relaxed: true }]
      }
    });
  }
  test(sitemapUrl, url = "", external = false, output = "cli", verbose = true, limitUrls = 0) {
    this.external = external;
    this.outputType = output;
    this.verbose = verbose;
    this.limitUrls = limitUrls;
    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(",");
    }
    if (sitemapUrl) {
      Promise.resolve().then(() => {
        Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls, this.limitUrls).then((urls) => {
          if (urls) {
            this.urls = urls;
            this.testUrls();
          }
        });
      }).catch((error) => {
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
  testUrls() {
    Promise.resolve().then(() => {
      if (this.verbose) {
        console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS`));
      }
      this.output = new Output("htmlTester", new URL(this.urls[0]).origin);
      this.totalUrls = this.urls.length;
      this.currentUrl = 0;
      if (this.external && this.urls.length > 0) {
        this.testUrl(this.urls.pop());
      } else {
        this.urls.forEach((url) => {
          this.testUrl(url);
        });
      }
    }).catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
  }
  testUrl(url) {
    Promise.resolve().then(
      () => fetch(url, {
        signal: AbortSignal.timeout(1e4),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
        }
      })
    ).then((response) => response.text()).then((body) => {
      this.htmlvalidate.validateString(body).then((result) => {
        if (result.valid) {
          this.RenderUrl(url, 0);
        } else {
          result.results[0].messages.forEach((message) => {
            this.output.add(url, message);
          });
          this.RenderUrl(url, result.results[0].errorCount);
        }
      }).catch((error) => {
        this.RenderUrl(url, 1, {
          message: error
        });
      });
    }).catch((error) => {
      console.log(error);
      this.RenderUrl(url, 1, {
        message: error
      });
    });
  }
  RenderUrl(url, errors, message) {
    this.currentUrl++;
    if (this.verbose) {
      process.stdout.write(colors.cyan(" > "));
      process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
      process.stdout.write(url);
      process.stdout.write(" - ");
      if (errors == 0) {
        console.log(colors.green("0 errors"));
      } else {
        console.log(colors.red(`${errors} errors`));
        this.totalErrorUrls++;
      }
    }
    if (message) {
      this.output.add(url, message);
    }
    if (this.currentUrl == this.totalUrls) {
      const renderOutput = this.output.render(this.outputType);
      const testResult = {
        filename: renderOutput,
        numberOfUrls: this.totalUrls,
        numberOfUrlsWithErrors: this.totalErrorUrls
      };
      this.testResolve(testResult);
    }
    if (this.external && this.urls.length > 0) {
      setTimeout(() => {
        this.testUrl(this.urls.pop());
      }, 100);
    }
  }
}
class HeadingErrorExporter {
  constructor() {
    this.currentUrl = 1;
    this.totalUrls = 0;
    this.totalErrorUrls = 0;
    this.external = false;
    this.urls = [];
    this.verbose = true;
    this.testPromise = null;
    this.exportType = "cli";
    colors.enable();
    this.output = new Output("headingTester", "");
    this.htmlvalidate = new node.HtmlValidate({
      elements: ["html5"],
      extends: ["html-validate:document"],
      rules: {
        "input-missing-label": "off",
        "missing-doctype": "off",
        "no-missing-references": "off",
        "require-sri": "off"
      }
    });
  }
  test(sitemapUrl, url = "", external = false, exportType = "cli") {
    this.external = external;
    this.exportType = exportType;
    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(",");
    }
    if (sitemapUrl) {
      Promise.resolve().then(() => {
        Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls).then((urls) => {
          if (urls) {
            this.urls = urls;
            this.testUrls();
          }
        });
      }).catch((error) => {
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
  testUrls() {
    Promise.resolve().then(() => {
      if (this.verbose) {
        console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS`));
      }
      this.output = new Output("headingTester", new URL(this.urls[0]).origin);
      this.totalUrls = this.urls.length;
      this.currentUrl = 0;
      if (this.external && this.urls.length > 0) {
        this.testUrl(this.urls.pop());
      } else {
        this.urls.forEach((url) => {
          this.testUrl(url);
        });
      }
    }).catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
  }
  testUrl(url) {
    Promise.resolve().then(
      () => fetch(url, {
        signal: AbortSignal.timeout(1e4),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
        }
      })
    ).then((response) => response.text()).then((body) => {
      this.htmlvalidate.validateString(body).then((result) => {
        const $ = cheerio__namespace.load(body);
        uniqueSelector__namespace.init($);
        if (result.valid) {
          this.RenderUrl(url, 0);
        } else {
          result.results[0].messages.forEach((message) => {
            if (message.selector) {
              const text = $(message.selector).text();
              message.elementText = text;
            }
            this.output.add(url, message);
          });
          this.RenderUrl(url, result.results[0].errorCount);
        }
      }).catch((error) => {
        this.RenderUrl(url, 1, {
          message: error
        });
      });
    }).catch((error) => {
      console.log(error);
      this.RenderUrl(url, 1, {
        message: error
      });
    });
  }
  RenderUrl(url, errors, message) {
    this.currentUrl++;
    if (this.verbose) {
      process.stdout.write(colors.cyan(" > "));
      process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
      process.stdout.write(url);
      process.stdout.write(" - ");
      if (errors == 0) {
        console.log(colors.green("0 errors"));
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
      const testResult = {
        filename: renderOutput,
        numberOfUrls: this.totalUrls,
        numberOfUrlsWithErrors: this.totalErrorUrls
      };
      this.testResolve(testResult);
    }
    if (this.external && this.urls.length > 0) {
      setTimeout(() => {
        this.testUrl(this.urls.pop());
      }, 100);
    }
  }
}
class CompareLinksTester {
  constructor() {
    this.outputType = "cli";
    this.baseUrlDestination = "";
    this.urls = [];
    this.verbose = true;
    this.testPromise = null;
    this.currentUrl = 1;
    this.totalUrls = 0;
    this.totalErrorUrls = 0;
    colors.enable();
    this.output = new Output("compareLinksTester", "");
  }
  test(sitemapUrl, url = "", output = "cli", verbose = true) {
    this.baseUrlDestination = url;
    if (sitemapUrl.length == 0 || this.baseUrlDestination.length == 0) {
      console.error("You need to provide both the sitemap of the origin site and the base URL of the destination site");
      process.exit(1);
    }
    this.outputType = output;
    this.verbose = verbose;
    if (sitemapUrl) {
      Promise.resolve().then(() => {
        Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls).then((urls) => {
          if (urls) {
            this.urls = urls;
            this.totalUrls = urls.length;
            this.testUrls();
          }
        });
      }).catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
    }
    this.testPromise = new Promise((resolve, reject) => {
      this.testResolve = resolve;
    });
    return this.testPromise;
  }
  testUrls() {
    this.output = new Output("compareLinksTester", new URL(this.urls[0]).origin);
    Promise.resolve().then(() => {
      if (this.verbose) {
        console.log(colors.cyan.underline(`Running validation on ${this.urls.length} URLS
`));
      }
      this.testLinks(this.baseUrlDestination);
    }).catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
  }
  testLinks(baseUrl) {
    this.testLink(this.urls[0], baseUrl).then((result) => {
      this.urls.shift();
      this.currentUrl++;
      if (this.urls.length > 0) {
        setTimeout(() => {
          this.testLinks(baseUrl);
        }, 100);
      } else {
        const renderOutput = this.output.render(this.outputType, false);
        const testResult = {
          filename: renderOutput,
          numberOfUrls: this.totalUrls,
          numberOfUrlsWithErrors: this.totalErrorUrls
        };
        this.testResolve(testResult);
      }
    });
  }
  testLink(url, baseUrl) {
    const link = new URL(url);
    const baseUrlObj = new URL(baseUrl);
    const testUrl = baseUrlObj.origin + link.pathname + link.search;
    if (this.verbose) {
      process.stdout.write(colors.cyan(" > "));
      process.stdout.write(colors.yellow(` ${this.currentUrl}/${this.totalUrls} `));
    }
    return new Promise((resolveTest, rejectTest) => {
      Promise.resolve().then(
        () => fetch(testUrl, {
          signal: AbortSignal.timeout(1e4),
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)"
          }
        })
      ).then((response) => {
        if (response.status == 404) {
          this.output.add(url, {
            url: testUrl,
            status: response.status.toString()
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
      }).catch((error) => {
        this.output.add(url, {
          url: testUrl,
          status: error.cause ? error.cause.code : error
        });
        this.totalErrorUrls++;
        resolveTest(true);
      });
    });
  }
}
dns.setDefaultResultOrder("ipv4first");
class TesterFlow {
  constructor(output = "cli-choose", verbose = true) {
    this.output = output;
    this.verbose = verbose;
    console.clear();
    let runData = null;
    fs__namespace.readFile("./data/session.json", (err, buf) => {
      if (err) {
        runData = null;
      }
      try {
        runData = JSON.parse(buf.toString());
      } catch (error) {
        runData = null;
      }
      this.startFlow(runData);
    });
  }
  startFlow(runData) {
    (async () => {
      if (this.output === "cli-choose") {
        const renderChoice = await prompts({
          type: "select",
          name: "value",
          message: "Where should the errors be exported to?",
          choices: [
            { title: "CLI", value: "cli" },
            { title: "HTML", value: "html" }
          ],
          initial: 0
        });
        this.output = renderChoice.value;
      }
      let responseTool = { value: "" };
      let level = { value: "" };
      let exportType = { value: "" };
      let type = { value: "" };
      let sitemap = { value: "" };
      let limitUrls = { value: 0 };
      let url = { value: "" };
      let project = { value: "" };
      let externalUrl = { value: "" };
      let sitemapOrigin = { value: "" };
      let baseUrlDestination = { value: "" };
      const prompt = {
        type: "select",
        name: "value",
        message: "What do you want to do?",
        choices: [
          { title: "Test A11y", value: "a11y" },
          { title: "Test HTML", value: "html" },
          { title: "Test Broken Links", value: "links" },
          { title: "Compare two sites", value: "compareSiteUrls" },
          { title: "Export Heading Errors", value: "exportHeadings" },
          { title: "Nothing (Exit)", value: "exit" }
        ],
        initial: 0
      };
      if (runData && prompt.choices && prompt.choices.length > 0) {
        prompt.choices.unshift({
          title: `Run last session again (${runData.responseTool}-test for ${runData.sitemapOrigin ? runData.sitemapOrigin : runData.url ? runData.url : runData.sitemap == "project" ? runData.project : runData.sitemap}${runData.baseUrlDestination ? " to " + runData.baseUrlDestination : ""})`,
          value: "runAgain"
        });
      }
      responseTool = await prompts(prompt);
      if (responseTool.value != "runAgain" && responseTool.value != "exit") {
        if (responseTool.value == "a11y") {
          level = await prompts({
            type: "select",
            name: "value",
            message: "What level do you want to test?",
            choices: [
              { title: "WCAG 2.0 Level AAA", value: "WCAG2AAA" },
              { title: "WCAG 2.0 Level AA", value: "WCAG2AA" },
              { title: "WCAG 2.0 Level A", value: "WCAG2A" }
            ],
            initial: 0
          });
        }
        if (responseTool.value == "exportHeadings" || responseTool.value == "links" || responseTool.value == "compareSiteUrls") {
          exportType = await prompts({
            type: "select",
            name: "value",
            message: "To what do you want to export?",
            choices: [
              { title: "Excel", value: "excel" },
              { title: "HTML", value: "html" },
              { title: "cli", value: "cli" }
            ],
            initial: 0
          });
        }
        if (responseTool.value != "compareSiteUrls") {
          type = await prompts({
            type: "select",
            name: "value",
            message: "What do you want to test?",
            choices: [
              { title: "Sitemap", value: "sitemap" },
              { title: "URL", value: "url" }
            ],
            initial: 0
          });
        }
        if (responseTool.value == "compareSiteUrls") {
          type = { value: "compare" };
        }
        switch (type.value) {
          case "sitemap":
            sitemap = await prompts({
              type: "select",
              name: "value",
              message: "Where is the sitemap?",
              choices: [
                { title: "Local project", value: "project" },
                { title: "External URL", value: "externalUrl" }
              ],
              initial: 0
            });
            switch (sitemap.value) {
              case "project":
                try {
                  const buf = fs__namespace.readFileSync("../.ddev/config.yaml", "utf8");
                  const text = buf.toString();
                  const lines = text.split(/\r?\n/);
                  for (const line of lines) {
                    const match = line.match(/^\s*name\s*:\s*(.+)$/i);
                    if (match && match[1]) {
                      let found = match[1].trim();
                      found = found.split(/\s+#/)[0].trim();
                      found = found.replace(/^['"]|['"]$/g, "");
                      if (found.length) {
                        project.value = found;
                      }
                      break;
                    }
                  }
                } catch (error) {
                  console.log("No .ddev/config.yaml found, please provide the project name manually");
                }
                project = await prompts({
                  type: "text",
                  name: "value",
                  message: `What is the project code? ${project.value}`,
                  initial: project.value
                });
                break;
              case "externalUrl":
                externalUrl = await prompts({
                  type: "text",
                  name: "value",
                  message: "What is the URL to the sitemap?"
                });
                break;
            }
            limitUrls = await prompts({
              type: "select",
              name: "value",
              message: "Limit URL's?",
              choices: [
                { title: "No", value: 0 },
                { title: "Yes", value: true }
              ],
              initial: 0
            });
            if (limitUrls.value) {
              limitUrls = await prompts({
                type: "number",
                name: "value",
                message: "How many URL's do you want to test per level?",
                initial: 10
              });
            }
            break;
          case "url":
            url = await prompts({
              type: "text",
              name: "value",
              message: "What is the URL?"
            });
            break;
          case "compare":
            sitemapOrigin = await prompts({
              type: "text",
              name: "value",
              message: "What is the URL of the sitemap of the origin site?"
            });
            baseUrlDestination = await prompts({
              type: "text",
              name: "value",
              message: "What is the base URL of the destination site?"
            });
            break;
        }
        runData = {
          responseTool: responseTool.value,
          exportType: exportType.value,
          type: type.value,
          sitemap: sitemap.value,
          limitUrls: limitUrls.value,
          url: url.value,
          project: project.value,
          externalUrl: externalUrl.value,
          level: level.value ?? "",
          sitemapOrigin: sitemapOrigin.value ?? "",
          baseUrlDestination: baseUrlDestination.value ?? ""
        };
      } else {
        if (responseTool.value != "exit") {
          responseTool.value = runData.responseTool;
        }
        exportType.value = runData.exportType;
        type.value = runData.type;
        sitemap.value = runData.sitemap;
        limitUrls.value = runData.limitUrls;
        url.value = runData.url;
        project.value = runData.project;
        externalUrl.value = runData.externalUrl;
        level.value = runData.level;
        sitemapOrigin.value = runData.sitemapOrigin;
        baseUrlDestination.value = runData.baseUrlDestination;
      }
      if (responseTool.value != "exit") {
        fs__namespace.writeFile("./data/session.json", JSON.stringify(runData), function(err) {
          if (err) console.log(err);
        });
      }
      if (responseTool.value === "html") {
        const htmlTester = new HTMLTester();
        if (type.value === "sitemap") {
          if (sitemap.value === "project") {
            await htmlTester.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              "",
              true,
              this.output,
              this.verbose,
              false,
              limitUrls.value
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await htmlTester.test(
              externalUrl.value,
              "",
              true,
              this.output,
              this.verbose,
              false,
              limitUrls.value
            );
            runData.url = externalUrl.value;
          }
        }
        if (type.value === "url") {
          await htmlTester.test(null, url.value, true, this.output, this.verbose, false, limitUrls.value);
          runData.url = url.value;
        }
      }
      if (responseTool.value === "a11y") {
        const a11yTester = new A11yTester();
        if (type.value === "sitemap") {
          if (sitemap.value === "project") {
            await a11yTester.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              "",
              true,
              this.output,
              this.verbose,
              false,
              level.value,
              limitUrls.value
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await a11yTester.test(
              externalUrl.value,
              "",
              true,
              this.output,
              this.verbose,
              false,
              level.value,
              limitUrls.value
            );
            runData.url = externalUrl.value;
          }
        }
        if (type.value === "url") {
          await a11yTester.test(
            null,
            url.value,
            true,
            this.output,
            this.verbose,
            false,
            level.value,
            limitUrls.value
          );
          runData.url = url.value;
        }
      }
      if (responseTool.value === "links") {
        if (exportType.value != "") {
          this.output = exportType.value;
        }
        const linksTester = new LinkTester();
        if (type.value === "sitemap") {
          if (sitemap.value === "project") {
            await linksTester.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              "",
              false,
              this.output,
              this.verbose
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await linksTester.test(externalUrl.value, "", true, this.output, this.verbose);
            runData.url = externalUrl.value;
          }
        }
        if (type.value === "url") {
          await linksTester.test(null, url.value, true, this.output, this.verbose);
          runData.url = url.value;
        }
      }
      if (responseTool.value === "compareSiteUrls") {
        if (exportType.value != "") {
          this.output = exportType.value;
        }
        const compareLinksTester = new CompareLinksTester();
        await compareLinksTester.test(
          sitemapOrigin.value,
          baseUrlDestination.value,
          this.output,
          this.verbose
        );
      }
      if (responseTool.value === "exportHeadings") {
        const headingExporter = new HeadingErrorExporter();
        if (type.value === "sitemap") {
          if (sitemap.value === "project") {
            await headingExporter.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              "",
              true,
              exportType.value
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await headingExporter.test(externalUrl.value, "", true, exportType.value);
            runData.url = externalUrl.value;
          }
        }
        if (type.value === "url") {
          await headingExporter.test(null, url.value, true, exportType.value);
          runData.url = url.value;
        }
      }
    })();
  }
}
class ScreenshotTool {
  constructor() {
    this.urls = [];
    this.verbose = true;
    this.siteVersion = "original";
    this.limitUrls = 0;
    this.path = "";
    colors.enable();
  }
  index(sitemapUrl, url = "", siteVersion = "original", verbose = true, limitUrls = 0) {
    this.verbose = verbose;
    this.limitUrls = limitUrls;
    this.siteVersion = siteVersion;
    console.log(sitemapUrl);
    this.urls = [];
    if (url.length > 0) {
      this.urls = url.split(",");
    }
    if (sitemapUrl) {
      Promise.resolve().then(() => {
        Helper.getUrlsFromSitemap(sitemapUrl, "", this.urls, this.limitUrls).then((urls) => {
          if (urls) {
            this.urls = urls;
            this.indexUrls();
          }
        });
      }).catch((error) => {
        console.error(error.message);
        process.exit(1);
      });
    } else {
      this.indexUrls();
    }
  }
  indexUrls() {
    const urlObj = new URL(this.urls[0]);
    this.path = urlObj.hostname;
    const screenshotsDir = path$1.join(`./public/screenshots`, this.path);
    if (!fs$1.existsSync(screenshotsDir)) {
      fs$1.mkdirSync(screenshotsDir, { recursive: true });
    }
    Promise.resolve().then(() => {
      if (this.verbose) {
        console.log(colors.cyan.underline(`Indexing: ${this.urls.length}`));
      }
      if (this.urls.length > 0) {
        this.indexUrl(this.urls.pop());
      }
    }).catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
  }
  indexUrl(url) {
    Promise.resolve().then(async () => {
      try {
        console.log(colors.gray.underline(`📸 Rendering: ${url}`));
        const browser = await puppeteer.launch();
        const filePrefix = this.siteVersion === "original" ? "a_" : "b_";
        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 1400, height: 800, deviceScaleFactor: 2 });
          if (void 0) ;
          await page.goto(url, { waitUntil: "networkidle2" });
          await page.screenshot({
            path: `./public/screenshots/${this.path}/${filePrefix}${this.convertUrlToFilename(url)}.png`,
            fullPage: true
          });
          console.log(colors.green.underline(`✅ Rendered: ${url}`));
          if (this.siteVersion === "altered") {
            const img1 = pngjs.PNG.sync.read(
              fs$1.readFileSync(`./public/screenshots/${this.path}/a_${this.convertUrlToFilename(url)}.png`)
            );
            const img2 = pngjs.PNG.sync.read(
              fs$1.readFileSync(`./public/screenshots/${this.path}/b_${this.convertUrlToFilename(url)}.png`)
            );
            if (!img1 || !img2) {
              throw new Error("One of the images to compare is missing");
            }
            const diffDimensions = {
              width: Math.max(img1.width, img2.width),
              height: Math.max(img1.height, img2.height)
            };
            const resizedImg1 = this.createResized(img1, diffDimensions);
            const resizedImg2 = this.createResized(img2, diffDimensions);
            const diff = new pngjs.PNG(diffDimensions);
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
              fs$1.writeFileSync(
                `./public/screenshots/${this.path}/d_${this.convertUrlToFilename(url)}.png`,
                pngjs.PNG.sync.write(diff)
              );
              console.log(
                colors.red.underline(
                  `🔗 Diff saved: file://${path$1.resolve(
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
            this.indexUrl(this.urls.pop());
          }
        }
      } catch (error) {
        console.log(error);
        console.log(colors.red.underline(`❌ Error rendering: ${url}`));
        if (this.urls.length > 0) {
          this.indexUrl(this.urls.pop());
        }
      }
    });
  }
  createResized(img, dimensions) {
    if (img.width > dimensions.width || img.height > dimensions.height) {
      throw new Error(`New dimensions expected to be greater than or equal to the original dimensions!`);
    }
    const resized = new pngjs.PNG(dimensions);
    pngjs.PNG.bitblt(img, resized, 0, 0, img.width, img.height);
    return resized;
  }
  convertUrlToFilename(url) {
    const urlObj = new URL(url);
    let filename = urlObj.pathname + urlObj.search + urlObj.hash;
    if (!filename || filename === "/") {
      filename = "home";
    }
    filename = filename.replace(/(^\w+:|^)\/\//, "");
    filename = filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    if (filename.length > 120) {
      filename = filename.substring(0, 120);
    }
    return filename;
  }
}
const fs = require("fs");
const path = require("path");
class UpdateChecker {
  constructor() {
  }
  static async checkCliForUpdates(basePath = "./") {
    const config = this.getConfig(basePath);
    const configPath = path.resolve(process.cwd(), basePath, config.cli.packagePath);
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf8");
      const cliPackage = JSON.parse(raw);
      const currentVersion = cliPackage.version;
      let latestVersion = "";
      await fetch(config.cli.packageGitUrl).then((response) => response.json()).then((data) => {
        latestVersion = data.version;
      }).catch((err) => {
        console.error(`Failed to fetch latest version: ${err?.message ?? err}`);
      });
      if (currentVersion !== latestVersion) {
        return { update: true, currentVersion, latestVersion };
      }
    }
    return { update: false };
  }
  static async checkFrontendForUpdates(basePath = "./") {
    const config = this.getConfig(basePath);
    const configPath = path.resolve(process.cwd(), basePath, config.frontend.packagePath);
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, "utf8");
      const frontendPackage = JSON.parse(raw);
      const currentVersion = frontendPackage.version;
      let latestVersion = "";
      await fetch(config.frontend.packageGitUrl).then((response) => response.json()).then((data) => {
        latestVersion = data.version;
      }).catch((err) => {
        console.error(`Failed to fetch latest version: ${err?.message ?? err}`);
      });
      if (currentVersion !== latestVersion) {
        return { update: true, currentVersion, latestVersion };
      }
    }
    return { update: false };
  }
  static getConfig(basePath = "./") {
    try {
      const configPath = path.resolve(process.cwd(), basePath, "cli.config.json");
      const raw = fs.readFileSync(configPath, "utf8");
      return JSON.parse(raw);
    } catch (err) {
      throw new Error(`Failed to read or parse cli.config.json: ${err?.message ?? err}`);
    }
  }
}
class GitActions {
  constructor() {
  }
  static async pullLatestChanges() {
    const config = UpdateChecker.getConfig();
    return this.getRemoteFiles(config.cli.updateRepo, config.cli.updatePath, "../" + config.cli.updatePath);
  }
  static async getRemoteFiles(repo, remotePath, localPath) {
    return new Promise(async (resolve, reject) => {
      const execAsync = util.promisify(child_process.exec);
      const fsp = fs__namespace.promises;
      const sparsePath = remotePath;
      const targetDir = path__namespace.resolve(process.cwd(), localPath);
      async function copyDir(src, dest) {
        await fsp.mkdir(dest, { recursive: true });
        const entries = await fsp.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path__namespace.join(src, entry.name);
          const destPath = path__namespace.join(dest, entry.name);
          if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
          } else if (entry.isSymbolicLink()) {
            const link = await fsp.readlink(srcPath);
            try {
              await fsp.symlink(link, destPath);
            } catch {
            }
          } else {
            await fsp.copyFile(srcPath, destPath);
          }
        }
      }
      const tmpBase = os__namespace.tmpdir();
      const tmpPrefix = "a11y-sparse-";
      const tmpDir = await fsp.mkdtemp(path__namespace.join(tmpBase, tmpPrefix));
      try {
        await execAsync(`git clone --filter=blob:none --no-checkout ${repo} "${tmpDir}"`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout init --cone`);
        await execAsync(`git -C "${tmpDir}" sparse-checkout set ${sparsePath}`);
        await execAsync(`git -C "${tmpDir}" checkout`);
        const srcFolder = path__namespace.join(tmpDir, ...sparsePath.split("/"));
        await fsp.rm(targetDir, { recursive: true, force: true });
        await copyDir(srcFolder, targetDir);
      } catch (err) {
        throw new Error(`Failed to pull updates from ${repo}: ${err && err.message ? err.message : err}`);
      } finally {
        try {
          await fsp.rm(tmpDir, { recursive: true, force: true });
        } catch (err) {
          throw new Error(`Failed to remove ${tmpDir}: ${err && err.message ? err.message : err}`);
        }
      }
      resolve();
    });
  }
}
class Updater {
  constructor(updateCli, updateFrontend) {
    this.updateCli = updateCli;
    this.updateFrontend = updateFrontend;
  }
  runUpdates() {
    if (this.updateCli && this.updateCli.update) {
      const spinner = ora.default("Updating CLI ...").start();
      UpdateChecker.getConfig();
      const execAsync = util.promisify(child_process.exec);
      spinner.color = "green";
      spinner.text = "Downloading update ...";
      GitActions.pullLatestChanges().then(async () => {
        spinner.succeed("CLI updated successfully!");
        spinner.stop();
        spinner.clear();
        spinner.start("Building CLI ...");
        await execAsync("yarn install");
        await execAsync("yarn build-cli");
        spinner.succeed("CLI built successfully!");
        spinner.stop();
        spinner.clear();
        if (this.updateFrontend && this.updateFrontend.update) {
          console.log(
            colors.yellow("⚠️ CLI updated successfully! Please restart the CLI to apply the frontend updates.")
          );
        } else {
          console.log(colors.green("✅ The CLI is now up to date!"));
        }
        process.exit(0);
      });
    } else if (this.updateFrontend && this.updateFrontend.update) {
      console.log("Updating Frontend...");
    }
  }
}
dns.setDefaultResultOrder("ipv4first");
class UpdaterFlow {
  constructor(updateCli, updateFrontend) {
    console.clear();
    this.startFlow(updateCli, updateFrontend);
  }
  async startFlow(updateCli, updateFrontend) {
    let type = { value: "" };
    let sitemap = { value: "" };
    let url = { value: "" };
    let project = { value: "" };
    let externalUrl = { value: "" };
    const choice = await prompts({
      type: "select",
      name: "value",
      message: "What do you want to run?",
      choices: [
        { title: "Pre update check", value: "preCheck" },
        { title: "Update", value: "update" },
        { title: "Post update check", value: "postCheck" },
        { title: "Nothing (Exit)", value: "exit" }
      ],
      initial: 0
    });
    if (choice.value == "preCheck" || choice.value == "postCheck") {
      type = await prompts({
        type: "select",
        name: "value",
        message: "What do you want to test?",
        choices: [
          { title: "Sitemap", value: "sitemap" },
          { title: "URL", value: "url" }
        ],
        initial: 0
      });
      switch (type.value) {
        case "sitemap":
          sitemap = await prompts({
            type: "select",
            name: "value",
            message: "Where is the sitemap?",
            choices: [
              { title: "Local project", value: "project" },
              { title: "External URL", value: "externalUrl" }
            ],
            initial: 0
          });
          switch (sitemap.value) {
            case "project":
              try {
                const buf = fs__namespace.readFileSync("../.ddev/config.yaml", "utf8");
                const text = buf.toString();
                const lines = text.split(/\r?\n/);
                for (const line of lines) {
                  const match = line.match(/^\s*name\s*:\s*(.+)$/i);
                  if (match && match[1]) {
                    let found = match[1].trim();
                    found = found.split(/\s+#/)[0].trim();
                    found = found.replace(/^['"]|['"]$/g, "");
                    if (found.length) {
                      project.value = found;
                    }
                    break;
                  }
                }
              } catch (error) {
                console.log("No .ddev/config.yaml found, please provide the project name manually");
              }
              project = await prompts({
                type: "text",
                name: "value",
                message: `What is the project code? ${project.value}`,
                initial: project.value
              });
              break;
            case "externalUrl":
              externalUrl = await prompts({
                type: "text",
                name: "value",
                message: "What is the URL to the sitemap?"
              });
              break;
          }
          break;
        case "url":
          url = await prompts({
            type: "text",
            name: "value",
            message: "What is the URL?"
          });
          break;
      }
      const screenshotTool = new ScreenshotTool();
      const siteVersion = choice.value === "preCheck" ? "original" : "altered";
      if (type.value === "sitemap") {
        if (sitemap.value === "project") {
          await screenshotTool.index(`https://${project.value}.local.statik.be/sitemap.xml`, "", siteVersion);
        } else {
          await screenshotTool.index(externalUrl.value, "", siteVersion);
        }
      }
      if (type.value === "url") {
        await screenshotTool.index(null, url.value, siteVersion);
      }
    }
    if (choice.value == "update") {
      const updater = new Updater(updateCli, updateFrontend);
      updater.runUpdates();
    }
  }
}
class Start {
  constructor() {
    this.runInit();
  }
  async runInit() {
    console.clear();
    process.stdout.write("·······································\n");
    process.stdout.write(":                                     :\n");
    process.stdout.write(":   _________ .__  .__        __      :\n");
    process.stdout.write(":   \\_   ___ \\|  | |__| _____/  |_    :\n");
    process.stdout.write(":   /    \\  \\/|  | |  |/    \\   __\\   :\n");
    process.stdout.write(":   \\     \\___|  |_|  |   |  \\  |     :\n");
    process.stdout.write(":    \\______  /____/__|___|  /__|     :\n");
    process.stdout.write(":           \\/             \\/         :\n");
    process.stdout.write(":                                     :\n");
    process.stdout.write("·······································\n\n");
    const startChoice = {
      type: "select",
      name: "value",
      message: "What do you want to run?",
      choices: [
        { title: "Test", value: "test" },
        { title: "Exit", value: "exit" }
      ],
      initial: 0
    };
    let updateCli;
    let updateFrontend;
    try {
      updateCli = await UpdateChecker.checkCliForUpdates();
      updateFrontend = await UpdateChecker.checkFrontendForUpdates();
      if (updateCli.update || updateFrontend.update) {
        process.stdout.write("---------------------------------------------------------------------------\n");
      }
      if (updateCli.update) {
        process.stdout.write(
          `| 🐦‍🔥 There is an update available for the CLI: ${colors.yellow(
            updateCli.currentVersion
          )} -> ${colors.green(updateCli.latestVersion)}
`
        );
      }
      if (updateFrontend.update) {
        process.stdout.write(
          `| 🎨 There is an update available for the Frontend: ${colors.yellow(
            updateFrontend.currentVersion
          )} -> ${colors.green(updateFrontend.latestVersion)}
`
        );
      }
      if (updateCli.update || updateFrontend.update) {
        startChoice.choices.unshift({ title: "Update", value: "update" });
        process.stdout.write("---------------------------------------------------------------------------\n\n");
      }
    } catch (error) {
      console.error(`Failed to check for updates: ${error?.message ?? error}`);
    }
    const choice = await prompts(startChoice);
    switch (choice.value) {
      case "update":
        new UpdaterFlow(updateCli, updateFrontend);
        break;
      case "test":
        new TesterFlow();
        break;
      default:
        console.log("No valid choice made, exiting.");
        process.exit(0);
    }
  }
}
async function main() {
  let startPrompt = true;
  for (const val of process.argv) {
    if (val === "--checkupdates") {
      try {
        const updateCli = await UpdateChecker.checkCliForUpdates("./clint/");
        const updateFrontend = await UpdateChecker.checkFrontendForUpdates("./clint/");
        if (updateCli.update || updateFrontend.update) {
          process.stdout.write("---------------------------------------------------------------------------\n");
        }
        if (updateCli.update) {
          process.stdout.write(
            `| 🐦‍🔥 There is an update available for the CLI: ${colors.yellow(
              updateCli.currentVersion
            )} -> ${colors.green(updateCli.latestVersion)}
`
          );
        }
        if (updateFrontend.update) {
          process.stdout.write(
            `| 🎨 There is an update available for the Frontend: ${colors.yellow(
              updateFrontend.currentVersion
            )} -> ${colors.green(updateFrontend.latestVersion)}
`
          );
        }
        if (updateCli.update || updateFrontend.update) {
          process.stdout.write("---------------------------------------------------------------------------\n\n");
        }
      } catch (error) {
        console.error(`Failed to check for updates: ${error?.message ?? error}`);
      }
      startPrompt = false;
    }
  }
  if (startPrompt) {
    new Start();
  }
}
main();
exports.Start = Start;
