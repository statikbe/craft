import { DOMHelper } from '../utils/domHelper';

export class ComponentLoader {
  public async loadComponent(componentName, selector, plugins = [], componentFolder = 'components-base') {
    const selectors = [selector, ...plugins.map((p) => p.selector)];
    const elements = document.querySelectorAll(selectors.join(','));
    if (elements.length > 0) {
      this.initComponent(componentName, plugins, componentFolder);
    }

    DOMHelper.onDynamicContent(document.documentElement, selectors.join(','), (elements) => {
      this.initComponent(componentName, plugins, componentFolder);
    });
  }

  private async initComponent(componentName, plugins, componentFolder) {
    const component = await import(`../${componentFolder}/${componentName}.component.ts`);
    if (plugins.length > 0) {
      const pluginLoading = [];
      plugins.forEach((plugin) => {
        const element = document.querySelector(plugin.selector);
        if (!element) {
          return;
        }
        pluginLoading.push(
          new Promise(async (resolve, reject) => {
            const pluginModule = await import(`../plugins/${plugin.path}/${plugin.file}.ts`);
            resolve({ name: plugin.name, selector: plugin.selector, module: pluginModule[plugin.name] });
          })
        );
      });
      Promise.all(pluginLoading).then((loadedPlugins) => {
        new component['default']({
          plugins: loadedPlugins,
        });
      });
    } else {
      new component['default']();
    }
  }
}
