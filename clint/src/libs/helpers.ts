import * as cheerio from 'cheerio';
import * as fs from 'fs';
import path from 'path';

export class Helper {
  constructor() {}
  public static getUrlsFromSitemap = (
    sitemapUrl: string,
    sitemapExclude: string,
    urls: Array<string>,
    limitUrls: number = 0
  ): Promise<string[] | undefined> => {
    const baseUrlCount: { [key: string]: number } = {};

    return Promise.resolve()
      .then(() =>
        fetch(sitemapUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; StatikTesterBot/0.1; +http://www.statik.be/)',
          },
        })
      )
      .then((response) => response.text())
      .then((body) => {
        const $ = cheerio.load(body, { xmlMode: true });

        const isSitemapIndex = $('sitemapindex').length > 0;
        if (isSitemapIndex) {
          return Promise.all(
            $('sitemap > loc')
              .toArray()
              .map((element: cheerio.Element) => {
                return this.getUrlsFromSitemap($(element).text(), sitemapExclude, urls, limitUrls);
              })
          ).then((configs) => {
            return configs.pop();
          });
        }

        $('url > loc')
          .toArray()
          .forEach((element) => {
            let url = $(element).text();
            const extension = new RegExp(/\.[0-9a-z]+$/i);
            if ((sitemapExclude.length > 0 && url.match(sitemapExclude)) || url.match(extension)) {
              return;
            }

            const urlParts = url.split('/');
            const baseUrl = urlParts.slice(0, -1).join('/');
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
      })
      .catch((error) => {
        if (error.stack && error.stack.includes('node-fetch')) {
          throw new Error(`The sitemap "${sitemapUrl}" could not be loaded`);
        }
        console.log(error);
        throw new Error(`The sitemap "${sitemapUrl}" could not be parsed`);
      });
  };

  public static clearDirectory = (directory: string) => {
    return new Promise<void>((resolve, reject) => {
      fs.readdir(directory, (err, files) => {
        if (err) reject(err);
        if (files) {
          for (const file of files) {
            fs.unlink(path.join(directory, file), (err) => {
              if (err) reject(err);
            });
          }
        }
        resolve();
      });
    });
  };

  public static getFrontendManifest() {
    const manifest = JSON.parse(fs.readFileSync('./public/frontend/.vite/manifest.json', 'utf8'));
    return Object.keys(manifest).reduce((acc, key) => {
      const newKey = key.split('/').join('').replace('.', '');
      acc[newKey] = manifest[key];
      return acc;
    }, {});
  }
}
