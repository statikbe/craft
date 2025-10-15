declare module "pa11y-ci";
declare module "cheerio-get-css-selector";

declare interface CheerioWithCSS extends Cheerio {
  getUniqueSelector(): string;
}
