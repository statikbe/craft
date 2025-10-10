import colors from 'colors';
import { HTMLRenderer } from './html-renderer';
import { A11yRenderer } from './a11y-renderer';
import { LinksRenderer } from './links-renderer';
import { HeadingRenderer } from './heading-renderer';
import {
  A11yErrorMessage,
  BrokenLink,
  HTMLErrorMessage,
  OutputType,
  OutputTypeA11y,
  OutputTypeHTML,
  OutputTypeLink,
  RenderType,
} from './types';
import { log } from 'console';

export class Output {
  private outputHTML: OutputTypeHTML[] = [];
  private outputLinks: OutputTypeLink[] = [];
  private outputA11y: OutputTypeA11y[] = [];
  private outputType: OutputType;
  private url: string;

  constructor(type: OutputType, url: string) {
    this.outputType = type;
    this.url = url;
  }

  public add(url: string, errorMessage: HTMLErrorMessage | BrokenLink | A11yErrorMessage) {
    switch (this.outputType) {
      case 'a11yTester':
        this.addAlly(url, errorMessage as A11yErrorMessage);
        break;
      case 'htmlTester':
        this.addHTML(url, errorMessage as HTMLErrorMessage);
        break;
      case 'linkTester':
        this.addBrokenLink(url, errorMessage as BrokenLink);
        break;
      case 'headingTester':
        this.addHTML(url, errorMessage as HTMLErrorMessage);
        break;
      case 'compareLinksTester':
        this.addBrokenLink(url, errorMessage as BrokenLink);
        break;
    }
  }

  public render(type: RenderType) {
    switch (this.outputType) {
      case 'a11yTester':
        return this.renderA11yOutput(type);
      case 'htmlTester':
        return this.renderHTMLOutput(type);
      case 'linkTester':
        return this.renderBrokenLinkOutput(type);
      case 'headingTester':
        return this.renderHeadingOutput(type);
      case 'compareLinksTester':
        return this.renderBrokenLinkOutput(type, true);
    }
    return '';
  }

  private addAlly(url: string, errorMessage: A11yErrorMessage) {
    const output = this.outputA11y.find((output) => output.url === url);
    if (output) {
      output.errorMessages.push(errorMessage);
    } else {
      this.outputA11y.push({
        url,
        errorMessages: [errorMessage],
      });
    }
  }

  private addHTML(url: string, errorMessage: HTMLErrorMessage) {
    const output = this.outputHTML.find((output) => output.url === url);
    if (output) {
      output.errorMessages.push(errorMessage);
    } else {
      this.outputHTML.push({
        url,
        errorMessages: [errorMessage],
      });
    }
  }

  private addBrokenLink(url: string, errorMessage: BrokenLink) {
    const output = this.outputLinks.find((output) => output.url === url);
    if (output) {
      output.brokenLinks.push(errorMessage);
    } else {
      this.outputLinks.push({
        url,
        brokenLinks: [errorMessage],
      });
    }
  }

  private renderA11yOutput(type: RenderType) {
    const a11yRenderer = new A11yRenderer(this.outputA11y);
    switch (type) {
      case 'cli':
        a11yRenderer.renderA11yOutputConsole();
        break;
      case 'json':
        return JSON.stringify(this.outputA11y);
      case 'html-snippet':
        return a11yRenderer.renderA11yOutputHTML(this.url, true);
      case 'html':
        return a11yRenderer.renderA11yOutputHTML(this.url);
    }
    return '';
  }

  private renderHTMLOutput(type: RenderType) {
    const htmlRenderer = new HTMLRenderer(this.outputHTML);
    switch (type) {
      case 'cli':
        htmlRenderer.renderHTMLOutputConsole();
        break;
      case 'json':
        return JSON.stringify(this.outputHTML);
      case 'html-snippet':
        return htmlRenderer.renderHTMLOutputHTML(this.url, true);
      case 'html':
        return htmlRenderer.renderHTMLOutputHTML(this.url);
    }
    return '';
  }

  private renderHeadingOutput(type: RenderType) {
    const htmlRenderer = new HTMLRenderer(this.outputHTML);
    const headingRenderer = new HeadingRenderer(this.outputHTML);
    switch (type) {
      case 'cli':
        htmlRenderer.renderHTMLOutputConsole();
        break;
      case 'json':
        return JSON.stringify(this.outputHTML);
      case 'excel':
        return headingRenderer.renderHeadingOutputExcel(this.url);
      case 'html':
        return htmlRenderer.renderHTMLOutputHTML(this.url);
    }
    return '';
  }

  private renderBrokenLinkOutput(type: RenderType, compare: boolean = false) {
    const linksRenderer = new LinksRenderer(this.outputLinks);
    switch (type) {
      case 'cli':
        linksRenderer.renderBrokenLinkOutputConsole();
        break;
      case 'json':
        return JSON.stringify(this.outputLinks);
      case 'html-snippet':
        return linksRenderer.renderBrokenLinkOutputHTML(this.url, true);
      case 'html':
        return linksRenderer.renderBrokenLinkOutputHTML(this.url);
      case 'excel':
        return linksRenderer.renderBrokenLinkOutputExcel(this.url, compare);
    }
    return '';
  }
}
