import prompts from 'prompts';
import * as fs from 'fs';
import { HTMLTester } from './html-tester';
import { A11yTester } from './a11y-tester';
import { LinkTester } from './links-tester';
import { RenderType } from './types';

import dns from 'node:dns';
import { HeadingErrorExporter } from './heading-error-export';
import { CompareLinksTester } from './compare-links-tester';
dns.setDefaultResultOrder('ipv4first');

export class TesterFlow {
  private output: RenderType | 'cli-choose';
  private verbose: boolean;

  constructor(output: RenderType | 'cli-choose' = 'cli-choose', verbose: boolean = true) {
    this.output = output;
    this.verbose = verbose;
    console.clear();

    let runData = null;
    fs.readFile('./data/session.json', (err: any, buf: any) => {
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

  private startFlow(runData: any) {
    (async () => {
      if (this.output === 'cli-choose') {
        const renderChoice = await prompts({
          type: 'select',
          name: 'value',
          message: 'Where should the errors be exported to?',
          choices: [
            { title: 'CLI', value: 'cli' },
            { title: 'HTML', value: 'html' },
          ],
          initial: 0,
        });

        this.output = renderChoice.value;
      }

      let responseTool: prompts.Answers<'value'> = { value: '' };
      let level: prompts.Answers<'value'> = { value: '' };
      let exportType: prompts.Answers<'value'> = { value: '' };
      let type: prompts.Answers<'value'> = { value: '' };
      let sitemap: prompts.Answers<'value'> = { value: '' };
      let limitUrls: prompts.Answers<'value'> = { value: 0 };
      let url: prompts.Answers<'value'> = { value: '' };
      let project: prompts.Answers<'value'> = { value: '' };
      let externalUrl: prompts.Answers<'value'> = { value: '' };
      let sitemapOrigin: prompts.Answers<'value'> = { value: '' };
      let baseUrlDestination: prompts.Answers<'value'> = { value: '' };

      const prompt: prompts.PromptObject = {
        type: 'select',
        name: 'value',
        message: 'What do you want to do?',
        choices: [
          { title: 'Test A11y', value: 'a11y' },
          { title: 'Test HTML', value: 'html' },
          { title: 'Test Broken Links', value: 'links' },
          { title: 'Compare two sites', value: 'compareSiteUrls' },
          { title: 'Export Heading Errors', value: 'exportHeadings' },
          { title: 'Nothing (Exit)', value: 'exit' },
        ],
        initial: 0,
      };

      if (runData && prompt.choices && prompt.choices.length > 0) {
        (prompt.choices as prompts.Choice[]).unshift({
          title: `Run last session again (${runData.responseTool}-test for ${
            runData.sitemapOrigin
              ? runData.sitemapOrigin
              : runData.url
              ? runData.url
              : runData.sitemap == 'project'
              ? runData.project
              : runData.sitemap
          }${runData.baseUrlDestination ? ' to ' + runData.baseUrlDestination : ''})`,
          value: 'runAgain',
        });
      }

      responseTool = await prompts(prompt);

      if (responseTool.value != 'runAgain' && responseTool.value != 'exit') {
        if (responseTool.value == 'a11y') {
          level = await prompts({
            type: 'select',
            name: 'value',
            message: 'What level do you want to test?',
            choices: [
              { title: 'WCAG 2.0 Level AAA', value: 'WCAG2AAA' },
              { title: 'WCAG 2.0 Level AA', value: 'WCAG2AA' },
              { title: 'WCAG 2.0 Level A', value: 'WCAG2A' },
            ],
            initial: 0,
          });
        }

        if (
          responseTool.value == 'exportHeadings' ||
          responseTool.value == 'links' ||
          responseTool.value == 'compareSiteUrls'
        ) {
          exportType = await prompts({
            type: 'select',
            name: 'value',
            message: 'To what do you want to export?',
            choices: [
              { title: 'Excel', value: 'excel' },
              { title: 'HTML', value: 'html' },
              { title: 'cli', value: 'cli' },
            ],
            initial: 0,
          });
        }

        if (responseTool.value != 'compareSiteUrls') {
          type = await prompts({
            type: 'select',
            name: 'value',
            message: 'What do you want to test?',
            choices: [
              { title: 'Sitemap', value: 'sitemap' },
              { title: 'URL', value: 'url' },
            ],
            initial: 0,
          });
        }

        if (responseTool.value == 'compareSiteUrls') {
          type = { value: 'compare' };
        }

        switch (type.value) {
          case 'sitemap':
            sitemap = await prompts({
              type: 'select',
              name: 'value',
              message: 'Where is the sitemap?',
              choices: [
                { title: 'Local project', value: 'project' },
                { title: 'External URL', value: 'externalUrl' },
              ],
              initial: 0,
            });

            switch (sitemap.value) {
              case 'project':
                try {
                  const buf = fs.readFileSync('../.ddev/config.yaml', 'utf8');
                  const text = buf.toString();
                  const lines = text.split(/\r?\n/);

                  for (const line of lines) {
                    const match = line.match(/^\s*name\s*:\s*(.+)$/i);

                    if (match && match[1]) {
                      let found = match[1].trim();
                      // remove inline comment
                      found = found.split(/\s+#/)[0].trim();
                      // strip surrounding quotes
                      found = found.replace(/^['"]|['"]$/g, '');
                      if (found.length) {
                        project.value = found;
                      }
                      break;
                    }
                  }
                } catch (error) {
                  console.log('No .ddev/config.yaml found, please provide the project name manually');
                }

                project = await prompts({
                  type: 'text',
                  name: 'value',
                  message: `What is the project code? ${project.value}`,
                  initial: project.value,
                });
                break;
              case 'externalUrl':
                externalUrl = await prompts({
                  type: 'text',
                  name: 'value',
                  message: 'What is the URL to the sitemap?',
                });
                break;
            }

            limitUrls = await prompts({
              type: 'select',
              name: 'value',
              message: "Limit URL's?",
              choices: [
                { title: 'No', value: 0 },
                { title: 'Yes', value: true },
              ],
              initial: 0,
            });

            if (limitUrls.value) {
              limitUrls = await prompts({
                type: 'number',
                name: 'value',
                message: "How many URL's do you want to test per level?",
                initial: 10,
              });
            }
            break;
          case 'url':
            url = await prompts({
              type: 'text',
              name: 'value',
              message: 'What is the URL?',
            });
            break;

          case 'compare':
            sitemapOrigin = await prompts({
              type: 'text',
              name: 'value',
              message: 'What is the URL of the sitemap of the origin site?',
            });
            baseUrlDestination = await prompts({
              type: 'text',
              name: 'value',
              message: 'What is the base URL of the destination site?',
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
          level: level.value ?? '',
          sitemapOrigin: sitemapOrigin.value ?? '',
          baseUrlDestination: baseUrlDestination.value ?? '',
        };
      } else {
        if (responseTool.value != 'exit') {
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

      if (responseTool.value != 'exit') {
        fs.writeFile('./data/session.json', JSON.stringify(runData), function (err: any) {
          if (err) console.log(err);
        });
      }

      if (responseTool.value === 'html') {
        const htmlTester = new HTMLTester();
        if (type.value === 'sitemap') {
          if (sitemap.value === 'project') {
            await htmlTester.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              '',
              true,
              this.output as RenderType,
              this.verbose,
              false,
              limitUrls.value
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await htmlTester.test(
              externalUrl.value,
              '',
              true,
              this.output as RenderType,
              this.verbose,
              false,
              limitUrls.value
            );
            runData.url = externalUrl.value;
          }
        }
        if (type.value === 'url') {
          await htmlTester.test(null, url.value, true, this.output as RenderType, this.verbose, false, limitUrls.value);
          runData.url = url.value;
        }
      }

      if (responseTool.value === 'a11y') {
        const a11yTester = new A11yTester();
        if (type.value === 'sitemap') {
          if (sitemap.value === 'project') {
            await a11yTester.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              '',
              true,
              this.output as RenderType,
              this.verbose,
              false,
              level.value,
              limitUrls.value
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await a11yTester.test(
              externalUrl.value,
              '',
              true,
              this.output as RenderType,
              this.verbose,
              false,
              level.value,
              limitUrls.value
            );
            runData.url = externalUrl.value;
          }
        }
        if (type.value === 'url') {
          await a11yTester.test(
            null,
            url.value,
            true,
            this.output as RenderType,
            this.verbose,
            false,
            level.value,
            limitUrls.value
          );
          runData.url = url.value;
        }
      }

      if (responseTool.value === 'links') {
        if (exportType.value != '') {
          this.output = exportType.value;
        }
        const linksTester = new LinkTester();
        if (type.value === 'sitemap') {
          if (sitemap.value === 'project') {
            await linksTester.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              '',
              false,
              this.output as RenderType,
              this.verbose
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await linksTester.test(externalUrl.value, '', true, this.output as RenderType, this.verbose);
            runData.url = externalUrl.value;
          }
        }
        if (type.value === 'url') {
          await linksTester.test(null, url.value, true, this.output as RenderType, this.verbose);
          runData.url = url.value;
        }
      }

      if (responseTool.value === 'compareSiteUrls') {
        if (exportType.value != '') {
          this.output = exportType.value;
        }
        const compareLinksTester = new CompareLinksTester();
        await compareLinksTester.test(
          sitemapOrigin.value,
          baseUrlDestination.value,
          this.output as RenderType,
          this.verbose
        );
      }

      if (responseTool.value === 'exportHeadings') {
        const headingExporter = new HeadingErrorExporter();

        if (type.value === 'sitemap') {
          if (sitemap.value === 'project') {
            await headingExporter.test(
              `https://${project.value}.local.statik.be/sitemap.xml`,
              '',
              true,
              exportType.value
            );
            runData.url = `https://${project.value}.local.statik.be/sitemap.xml`;
          } else {
            await headingExporter.test(externalUrl.value, '', true, exportType.value);
            runData.url = externalUrl.value;
          }
        }
        if (type.value === 'url') {
          await headingExporter.test(null, url.value, true, exportType.value);
          runData.url = url.value;
        }
      }
    })();
  }
}
