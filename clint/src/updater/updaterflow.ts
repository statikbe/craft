import prompts from 'prompts';
import * as fs from 'fs';
import ora from 'ora';

import dns from 'node:dns';
import { ScreenshotTool } from './screenshot';
import { Updater } from './updater';
dns.setDefaultResultOrder('ipv4first');

export class UpdaterFlow {
  constructor(updateCli, updateFrontend) {
    console.clear();
    this.startFlow(updateCli, updateFrontend);
  }

  private async startFlow(updateCli, updateFrontend) {
    let type: prompts.Answers<'value'> = { value: '' };
    let sitemap: prompts.Answers<'value'> = { value: '' };
    let url: prompts.Answers<'value'> = { value: '' };
    let project: prompts.Answers<'value'> = { value: '' };
    let externalUrl: prompts.Answers<'value'> = { value: '' };

    const choice = await prompts({
      type: 'select',
      name: 'value',
      message: 'What do you want to run?',
      choices: [
        { title: 'Pre update check', value: 'preCheck' },
        { title: 'Update', value: 'update' },
        { title: 'Post update check', value: 'postCheck' },
        { title: 'Nothing (Exit)', value: 'exit' },
      ],
      initial: 0,
    });

    if (choice.value == 'preCheck' || choice.value == 'postCheck') {
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
          break;
        case 'url':
          url = await prompts({
            type: 'text',
            name: 'value',
            message: 'What is the URL?',
          });
          break;
      }

      const screenshotTool = new ScreenshotTool();
      const siteVersion = choice.value === 'preCheck' ? 'original' : 'altered';
      if (type.value === 'sitemap') {
        if (sitemap.value === 'project') {
          await screenshotTool.index(`https://${project.value}.local.statik.be/sitemap.xml`, '', siteVersion);
        } else {
          await screenshotTool.index(externalUrl.value, '', siteVersion);
        }
      }
      if (type.value === 'url') {
        await screenshotTool.index(null, url.value, siteVersion);
      }
    }
    if (choice.value == 'update') {
      const updater = new Updater(updateCli, updateFrontend);
      updater.runUpdates();
    }
  }
}
